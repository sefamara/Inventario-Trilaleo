[CmdletBinding()]
param(
    [switch]$Elevated
)

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $ProjectDir "Backend\.env"

function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Administrator)) {
    Write-Host "Se solicitaran permisos de administrador para instalar los requisitos."
    $arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Elevated"
    try {
        $process = Start-Process powershell.exe -Verb RunAs -ArgumentList $arguments -Wait -PassThru
        exit $process.ExitCode
    }
    catch {
        Write-Error "No se concedieron permisos de administrador."
        exit 1
    }
}

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Refresh-Path {
    $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

function Find-CommandPath([string]$Name) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }
    return $null
}

function Find-MySqlBinary([string]$Name) {
    $command = Find-CommandPath $Name
    if ($command) {
        return $command
    }

    $roots = @()
    if ($env:ProgramFiles) {
        $roots += Join-Path $env:ProgramFiles "MySQL"
    }
    if (${env:ProgramFiles(x86)}) {
        $roots += Join-Path ${env:ProgramFiles(x86)} "MySQL"
    }

    foreach ($root in ($roots | Where-Object { Test-Path $_ })) {
        $match = Get-ChildItem $root -Recurse -Filter $Name -File -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending |
            Select-Object -First 1
        if ($match) {
            return $match.FullName
        }
    }

    return $null
}

function Install-WingetPackage {
    param(
        [string]$Id,
        [string]$DisplayName
    )

    Write-Host "Instalando $DisplayName..."
    & $script:Winget install --id $Id --exact --silent --accept-package-agreements --accept-source-agreements --disable-interactivity
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo instalar $DisplayName con winget."
    }
    Refresh-Path
}

function Test-PythonVersion {
    $launcher = Find-CommandPath "py.exe"
    if ($launcher) {
        & $launcher -3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)" 2>$null
        return $LASTEXITCODE -eq 0
    }

    $python = Find-CommandPath "python.exe"
    if ($python) {
        & $python -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)" 2>$null
        return $LASTEXITCODE -eq 0
    }

    return $false
}

function Test-NodeVersion {
    $node = Find-CommandPath "node.exe"
    if (-not $node) {
        return $false
    }

    $versionText = & $node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        return $false
    }

    return [version]($versionText.TrimStart('v')) -ge [version]"18.0.0"
}

function ConvertTo-PlainText([Security.SecureString]$SecureValue) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function Read-NewRootPassword {
    while ($true) {
        Write-Host "Define una contrasena administrativa para MySQL (minimo 8 caracteres)."
        $first = ConvertTo-PlainText (Read-Host "Nueva contrasena" -AsSecureString)
        $second = ConvertTo-PlainText (Read-Host "Repite la contrasena" -AsSecureString)

        if ($first.Length -ge 8 -and $first -ceq $second) {
            return $first
        }
        Write-Host "Las contrasenas no coinciden o son demasiado cortas." -ForegroundColor Yellow
    }
}

function Escape-SqlLiteral([string]$Value) {
    return $Value.Replace('\', '\\').Replace("'", "''")
}

function Write-ApplicationEnv {
    param(
        [string]$AppUser,
        [string]$AppPassword
    )

    $secretKey = [Guid]::NewGuid().ToString("N") + [Guid]::NewGuid().ToString("N")
    $content = @"
DB_NAME=inventario_trilaleo
DB_USER=$AppUser
DB_PASSWORD=$AppPassword
DB_HOST=127.0.0.1
DB_PORT=3306
DEBUG=True
ALLOWED_HOSTS=*
SECRET_KEY=$secretKey
"@
    [IO.File]::WriteAllText($EnvFile, $content, [Text.UTF8Encoding]::new($false))
}

function Initialize-MySqlServer {
    param(
        [string]$MySql,
        [string]$MySqlServer
    )

    Write-Step "Inicializando MySQL Server"
    $baseDir = Split-Path -Parent (Split-Path -Parent $MySqlServer)
    $configDir = Join-Path $env:ProgramData "MySQL\Trilaleo"
    $dataDir = Join-Path $configDir "Data"
    $configFile = Join-Path $configDir "my.ini"
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null

    $baseForIni = $baseDir.Replace('\', '/')
    $dataForIni = $dataDir.Replace('\', '/')
    $config = @"
[mysqld]
basedir=$baseForIni
datadir=$dataForIni
port=3306
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
"@
    [IO.File]::WriteAllText($configFile, $config, [Text.UTF8Encoding]::new($false))

    if (-not (Test-Path (Join-Path $dataDir "mysql"))) {
        New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
        & $MySqlServer "--defaults-file=$configFile" --initialize-insecure --console
        if ($LASTEXITCODE -ne 0) {
            throw "No se pudo inicializar el directorio de datos de MySQL."
        }
    }

    & $MySqlServer --install MySQLTrilaleo "--defaults-file=$configFile"
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo registrar el servicio MySQLTrilaleo."
    }

    Start-Service MySQLTrilaleo
    $service = Get-Service MySQLTrilaleo
    $service.WaitForStatus("Running", [TimeSpan]::FromSeconds(30))

    $rootPassword = Read-NewRootPassword
    $escapedRootPassword = Escape-SqlLiteral $rootPassword
    $appUser = "trilaleo_app"
    $appPassword = [Guid]::NewGuid().ToString("N") + [Guid]::NewGuid().ToString("N")
    $sql = @"
CREATE DATABASE IF NOT EXISTS inventario_trilaleo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$appUser'@'localhost' IDENTIFIED BY '$appPassword';
ALTER USER '$appUser'@'localhost' IDENTIFIED BY '$appPassword';
GRANT ALL PRIVILEGES ON inventario_trilaleo.* TO '$appUser'@'localhost';
CREATE USER IF NOT EXISTS '$appUser'@'127.0.0.1' IDENTIFIED BY '$appPassword';
ALTER USER '$appUser'@'127.0.0.1' IDENTIFIED BY '$appPassword';
GRANT ALL PRIVILEGES ON inventario_trilaleo.* TO '$appUser'@'127.0.0.1';
ALTER USER 'root'@'localhost' IDENTIFIED BY '$escapedRootPassword';
FLUSH PRIVILEGES;
"@

    $sql | & $MySql --user=root
    if ($LASTEXITCODE -ne 0) {
        throw "MySQL se instalo, pero no se pudieron crear sus usuarios."
    }

    Write-ApplicationEnv $appUser $appPassword
    $rootPassword = $null
    $escapedRootPassword = $null
    Write-Host "MySQL quedo configurado como servicio y la aplicacion tiene su propio usuario."
}

Write-Host "========================================================"
Write-Host " INSTALADOR DE REQUISITOS - INVENTARIO TRILALEO"
Write-Host "========================================================"

$script:Winget = Find-CommandPath "winget.exe"
if (-not $script:Winget) {
    throw "winget no esta disponible. Instala App Installer desde Microsoft Store y vuelve a intentarlo."
}

Write-Step "Verificando Python"
if (-not (Test-PythonVersion)) {
    Install-WingetPackage "Python.Python.3.12" "Python 3.12"
}
else {
    Write-Host "Python compatible ya esta instalado."
}

Write-Step "Verificando Node.js"
if (-not (Test-NodeVersion)) {
    Install-WingetPackage "OpenJS.NodeJS.LTS" "Node.js LTS"
}
else {
    Write-Host "Node.js compatible ya esta instalado."
}

Write-Step "Verificando MySQL Server"
$mysqlServer = Find-MySqlBinary "mysqld.exe"
if (-not $mysqlServer) {
    Install-WingetPackage "Oracle.MySQL" "MySQL Server"
    $mysqlServer = Find-MySqlBinary "mysqld.exe"
}

$mysql = Find-MySqlBinary "mysql.exe"
if (-not $mysqlServer -or -not $mysql) {
    throw "MySQL se instalo, pero no se encontraron sus ejecutables. Reinicia Windows y vuelve a ejecutar este instalador."
}

$mysqlService = Get-Service -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "MySQL*" } |
    Select-Object -First 1

if (-not $mysqlService) {
    Initialize-MySqlServer $mysql $mysqlServer
}
elseif ($mysqlService -and $mysqlService.Status -ne "Running") {
    Start-Service $mysqlService.Name
    Write-Host "Servicio $($mysqlService.Name) iniciado."
}
else {
    Write-Host "MySQL Server ya esta instalado."
}

Write-Step "Configurando el proyecto"
& (Join-Path $ProjectDir "configurar_sistema.ps1")
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " INSTALACION COMPLETA" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "El sistema ya puede iniciarse con iniciar_sistema.bat."
