[CmdletBinding()]
param(
    [switch]$ReconfigureDatabase
)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPython = Join-Path $ProjectDir "django_entorno\Scripts\python.exe"
$Requirements = Join-Path $ProjectDir "Backend\requirements.txt"
$ManagePy = Join-Path $ProjectDir "Backend\inventario\manage.py"
$FrontendDir = Join-Path $ProjectDir "Frontend"
$EnvFile = Join-Path $ProjectDir "Backend\.env"

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Invoke-Checked {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$ErrorMessage
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw $ErrorMessage
    }
}

function Find-CommandPath([string]$Name) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }
    return $null
}

function Find-MySqlClient {
    $mysql = Find-CommandPath "mysql.exe"
    if ($mysql) {
        return $mysql
    }

    $roots = @()
    if ($env:ProgramFiles) {
        $roots += Join-Path $env:ProgramFiles "MySQL"
    }
    if (${env:ProgramFiles(x86)}) {
        $roots += Join-Path ${env:ProgramFiles(x86)} "MySQL"
    }
    $roots = $roots | Where-Object { Test-Path $_ }

    foreach ($root in $roots) {
        $match = Get-ChildItem $root -Recurse -Filter "mysql.exe" -File -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending |
            Select-Object -First 1
        if ($match) {
            return $match.FullName
        }
    }

    return $null
}

Write-Host "========================================================"
Write-Host " CONFIGURACION AUTOMATICA - INVENTARIO TRILALEO"
Write-Host "========================================================"

Write-Step "Verificando Python y preparando el backend"
if (-not (Test-Path $VenvPython)) {
    $launcher = Find-CommandPath "py.exe"
    $launcherArgs = @("-3")

    if (-not $launcher) {
        $launcher = Find-CommandPath "python.exe"
        $launcherArgs = @()
    }

    if (-not $launcher) {
        throw "No se encontro Python. Instala Python 3.10 o superior y vuelve a ejecutar este instalador."
    }

    Invoke-Checked $launcher ($launcherArgs + @("-c", "import sys; assert sys.version_info >= (3, 10), 'Se requiere Python 3.10 o superior'")) "La version de Python no es compatible."
    Invoke-Checked $launcher ($launcherArgs + @("-m", "venv", (Join-Path $ProjectDir "django_entorno"))) "No se pudo crear el entorno virtual de Python."
}

Invoke-Checked $VenvPython @("-m", "pip", "install", "--upgrade", "pip") "No se pudo actualizar pip."
Invoke-Checked $VenvPython @("-m", "pip", "install", "-r", $Requirements) "No se pudieron instalar las dependencias de Python."

Write-Step "Verificando Node.js y preparando el frontend"
$npm = Find-CommandPath "npm.cmd"
$node = Find-CommandPath "node.exe"
if (-not $npm -or -not $node) {
    throw "No se encontro Node.js/npm. Instala Node.js LTS y vuelve a ejecutar este instalador."
}

$nodeVersion = & $node "--version"
if ($LASTEXITCODE -ne 0 -or [version]($nodeVersion.TrimStart('v')) -lt [version]"18.0.0") {
    throw "Se requiere Node.js 18 o superior. Instala una version LTS reciente."
}

if (-not (Test-Path (Join-Path $FrontendDir "node_modules\.bin\next.cmd"))) {
    Push-Location $FrontendDir
    try {
        Invoke-Checked $npm @("ci") "No se pudieron instalar las dependencias del frontend."
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "Las dependencias del frontend ya estan instaladas."
}

$NeedsDatabaseSetup = $ReconfigureDatabase -or -not (Test-Path $EnvFile)
if ($NeedsDatabaseSetup) {
    Write-Step "Configurando MySQL"
    $mysql = Find-MySqlClient
    if (-not $mysql) {
        throw "No se encontro MySQL Server. Instala MySQL Server 8 y vuelve a ejecutar este instalador."
    }

    $mysqlService = Get-Service -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like "MySQL*" } |
        Select-Object -First 1
    if ($mysqlService -and $mysqlService.Status -ne "Running") {
        Write-Host "Intentando iniciar el servicio $($mysqlService.Name)..."
        try {
            Start-Service $mysqlService.Name
        }
        catch {
            throw "MySQL esta instalado, pero su servicio no esta iniciado. Inicia MySQL como administrador y vuelve a intentarlo."
        }
    }

    $adminUser = Read-Host "Usuario administrador de MySQL [root]"
    if ([string]::IsNullOrWhiteSpace($adminUser)) {
        $adminUser = "root"
    }

    $appUser = "trilaleo_app"
    $appPassword = ([Guid]::NewGuid().ToString("N") + [Guid]::NewGuid().ToString("N"))
    $sql = @"
CREATE DATABASE IF NOT EXISTS inventario_trilaleo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$appUser'@'localhost' IDENTIFIED BY '$appPassword';
ALTER USER '$appUser'@'localhost' IDENTIFIED BY '$appPassword';
GRANT ALL PRIVILEGES ON inventario_trilaleo.* TO '$appUser'@'localhost';
CREATE USER IF NOT EXISTS '$appUser'@'127.0.0.1' IDENTIFIED BY '$appPassword';
ALTER USER '$appUser'@'127.0.0.1' IDENTIFIED BY '$appPassword';
GRANT ALL PRIVILEGES ON inventario_trilaleo.* TO '$appUser'@'127.0.0.1';
FLUSH PRIVILEGES;
"@

    Write-Host "MySQL pedira ahora la contrasena de $adminUser. No se guardara esa contrasena."
    & $mysql "--user=$adminUser" "--password" "--execute=$sql"
    if ($LASTEXITCODE -ne 0) {
        throw "MySQL rechazo la configuracion. Verifica la contrasena administrativa y vuelve a intentarlo."
    }

    $secretKey = [Guid]::NewGuid().ToString("N") + [Guid]::NewGuid().ToString("N")
    $envContent = @"
DB_NAME=inventario_trilaleo
DB_USER=$appUser
DB_PASSWORD=$appPassword
DB_HOST=127.0.0.1
DB_PORT=3306
DEBUG=True
ALLOWED_HOSTS=*
SECRET_KEY=$secretKey
"@
    [System.IO.File]::WriteAllText($EnvFile, $envContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "Configuracion privada guardada en Backend\.env."
}
else {
    Write-Step "Usando la configuracion MySQL existente"
}

Write-Step "Creando y actualizando las tablas"
Invoke-Checked $VenvPython @($ManagePy, "migrate", "--noinput") "No se pudieron preparar las tablas de la base de datos. Ejecuta configurar_sistema.bat --database para renovar la conexion."

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " CONFIGURACION COMPLETADA CORRECTAMENTE" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Ya puedes ejecutar iniciar_sistema.bat."
