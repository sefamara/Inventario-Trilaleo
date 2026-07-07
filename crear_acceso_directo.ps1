$ErrorActionPreference = "Stop"
$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ShortcutName = "Sistema Inventario Trilaleo.lnk"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath $ShortcutName

if (-not (Test-Path $ShortcutPath)) {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = Join-Path $ProjectDir "iniciar_sistema.bat"
    $Shortcut.WorkingDirectory = $ProjectDir
    $Shortcut.IconLocation = "$env:SystemRoot\System32\imageres.dll,109"
    $Shortcut.Description = "Iniciar Sistema de Inventario Trilaleo"
    $Shortcut.WindowStyle = 1
    $Shortcut.Save()
    Write-Host "Acceso directo creado en el escritorio."
}
