$myini = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini"
$resetSql = "D:\Sistema_Inventario_Trilaleo\reset_mysql_password.sql"
$mysql = """C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"""

# Paso 1: Leer my.ini y agregar skip-grant-tables
$content = Get-Content $myini -Raw
if ($content -notmatch "skip-grant-tables") {
    $content = $content -replace "\[mysqld\]", "[mysqld]`r`nskip-grant-tables"
    Set-Content -Path $myini -Value $content -Encoding UTF8
    Write-Host "✅ skip-grant-tables agregado al my.ini"
} else {
    Write-Host "ℹ️ skip-grant-tables ya existe"
}

# Paso 2: Reiniciar MySQL
Write-Host "🔄 Reiniciando MySQL..."
net stop MySQL80 2>&1 | Out-Null
Start-Sleep -Seconds 3
net start MySQL80 2>&1 | Out-Null
Start-Sleep -Seconds 5
Write-Host "✅ MySQL reiniciado"

# Paso 3: Cambiar password
Write-Host "🔑 Cambiando password de root..."
$sqlCmd = "UPDATE mysql.user SET authentication_string='' WHERE User='root'; FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY 'GodTracker.,$01'; FLUSH PRIVILEGES;"
echo $sqlCmd | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root 2>&1
Write-Host "✅ Password cambiado a: GodTracker.,`$01"

# Paso 4: Quitar skip-grant-tables del my.ini
$content = Get-Content $myini -Raw
$content = $content -replace "skip-grant-tables\r?\n", ""
Set-Content -Path $myini -Value $content -Encoding UTF8
Write-Host "✅ skip-grant-tables eliminado del my.ini"

# Paso 5: Reiniciar MySQL una vez más (sin skip-grant-tables)
Write-Host "🔄 Reiniciando MySQL con configuración normal..."
net stop MySQL80 2>&1 | Out-Null
Start-Sleep -Seconds 3
net start MySQL80 2>&1 | Out-Null
Start-Sleep -Seconds 5
Write-Host "✅ MySQL listo con nuevo password!"

# Paso 6: Probar conexión
Write-Host "🔍 Probando conexión..."
echo "SHOW DATABASES;" | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root "-pGodTracker.,$01" 2>&1
