[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $ProjectDir "Frontend"
$VenvPython = Join-Path $ProjectDir "django_entorno\Scripts\python.exe"
$Requirements = Join-Path $ProjectDir "Backend\requirements.txt"
$ManagePy = Join-Path $ProjectDir "Backend\inventario\manage.py"
$EnvFile = Join-Path $ProjectDir "Backend\.env"
$BackupDir = Join-Path $ProjectDir "Backups"

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

function Find-MySqlDump {
    $dump = Find-CommandPath "mysqldump.exe"
    if ($dump) {
        return $dump
    }

    $roots = @()
    if ($env:ProgramFiles) {
        $roots += Join-Path $env:ProgramFiles "MySQL"
    }
    if (${env:ProgramFiles(x86)}) {
        $roots += Join-Path ${env:ProgramFiles(x86)} "MySQL"
    }

    foreach ($root in ($roots | Where-Object { Test-Path $_ })) {
        $match = Get-ChildItem $root -Recurse -Filter "mysqldump.exe" -File -ErrorAction SilentlyContinue |
            Sort-Object FullName -Descending |
            Select-Object -First 1
        if ($match) {
            return $match.FullName
        }
    }
    return $null
}

function Read-EnvFile([string]$Path) {
    $values = @{}
    foreach ($line in Get-Content $Path) {
        if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) {
            continue
        }
        $parts = $line.Split('=', 2)
        if ($parts.Count -eq 2) {
            $values[$parts[0].Trim()] = $parts[1]
        }
    }
    return $values
}

function Backup-Database {
    if (-not (Test-Path $EnvFile)) {
        throw "No existe Backend\.env. Ejecuta primero configurar_sistema.bat."
    }

    $mysqldump = Find-MySqlDump
    if (-not $mysqldump) {
        throw "No se encontro mysqldump.exe; no es seguro actualizar sin respaldo."
    }

    $database = Read-EnvFile $EnvFile
    foreach ($key in @('DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT')) {
        if (-not $database.ContainsKey($key)) {
            throw "Falta $key en Backend\.env."
        }
    }

    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupFile = Join-Path $BackupDir "inventario_trilaleo-$timestamp.sql"
    $arguments = @(
        "--host=$($database.DB_HOST)",
        "--port=$($database.DB_PORT)",
        "--user=$($database.DB_USER)",
        "--single-transaction",
        "--triggers",
        "--no-tablespaces",
        "--default-character-set=utf8mb4",
        $database.DB_NAME
    )

    $env:MYSQL_PWD = $database.DB_PASSWORD
    try {
        $process = Start-Process $mysqldump -ArgumentList $arguments -NoNewWindow -Wait -PassThru -RedirectStandardOutput $backupFile
        if ($process.ExitCode -ne 0 -or -not (Test-Path $backupFile) -or (Get-Item $backupFile).Length -eq 0) {
            Remove-Item $backupFile -Force -ErrorAction SilentlyContinue
            throw "No se pudo crear el respaldo de MySQL. La actualizacion fue cancelada."
        }
    }
    finally {
        Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    }

    Get-ChildItem $BackupDir -Filter "inventario_trilaleo-*.sql" -File |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip 10 |
        Remove-Item -Force

    Write-Host "Respaldo creado: $backupFile"
}

Write-Host "========================================================"
Write-Host " ACTUALIZADOR - INVENTARIO TRILALEO"
Write-Host "========================================================"

$git = Find-CommandPath "git.exe"
if (-not $git) {
    throw "Git no esta instalado. Ejecuta instalar_requisitos.bat."
}
if (-not (Test-Path (Join-Path $ProjectDir ".git"))) {
    throw "Esta carpeta fue descargada como ZIP y no puede actualizarse automaticamente. Clona el repositorio con Git."
}

Push-Location $ProjectDir
try {
    $trackedChanges = & $git status --porcelain --untracked-files=no
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo revisar el estado del repositorio."
    }
    if ($trackedChanges) {
        throw "Hay cambios locales sin guardar. Confirma o descarta esos cambios antes de actualizar."
    }

    Write-Step "Deteniendo los servicios"
    & (Join-Path $ProjectDir "detener_sistema.bat")

    Write-Step "Respaldando la base de datos"
    Backup-Database

    Write-Step "Descargando la ultima version"
    Invoke-Checked $git @("pull", "--ff-only") "No se pudo descargar la actualizacion. No se modificaron las dependencias ni la base de datos."

    if (-not (Test-Path $VenvPython)) {
        throw "Falta el entorno de Python. Ejecuta instalar_requisitos.bat."
    }

    Write-Step "Actualizando dependencias de Python"
    Invoke-Checked $VenvPython @("-m", "pip", "install", "-r", $Requirements) "No se pudieron actualizar las dependencias de Python."

    $npm = Find-CommandPath "npm.cmd"
    if (-not $npm) {
        throw "No se encontro npm. Ejecuta instalar_requisitos.bat."
    }

    Write-Step "Actualizando dependencias de Next.js"
    Push-Location $FrontendDir
    try {
        Invoke-Checked $npm @("ci") "No se pudieron actualizar las dependencias de Next.js."

        Write-Step "Compilando el frontend"
        Invoke-Checked $npm @("run", "build") "La nueva version del frontend no pudo compilarse."
    }
    finally {
        Pop-Location
    }

    Write-Step "Aplicando migraciones"
    Invoke-Checked $VenvPython @($ManagePy, "migrate", "--noinput") "No se pudieron aplicar las migraciones. El respaldo permanece en la carpeta Backups."
}
finally {
    Pop-Location
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host " ACTUALIZACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Iniciando el sistema actualizado..."
$startScript = Join-Path $ProjectDir "iniciar_sistema.bat"
Start-Process cmd.exe -ArgumentList @("/c", "`"$startScript`" --skip-build")
