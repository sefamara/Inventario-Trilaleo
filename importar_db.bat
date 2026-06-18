@echo off
setlocal
SET "DIR=%~dp0DB_Trilaleo"

for /f "delims=" %%i in ('powershell -NoProfile -Command "$cmd=Get-Command mysql.exe -ErrorAction SilentlyContinue; if($cmd){$cmd.Source}else{Get-ChildItem $env:ProgramFiles\MySQL -Recurse -Filter mysql.exe -File -ErrorAction SilentlyContinue ^| Sort-Object FullName -Descending ^| Select-Object -First 1 -ExpandProperty FullName}"') do SET "MYSQL=%%i"

if not defined MYSQL (
    echo ERROR: No se encontro mysql.exe.
    pause
    exit /b 1
)

if not exist "%~dp0Backend\.env" (
    echo ERROR: Primero ejecuta configurar_sistema.bat.
    pause
    exit /b 1
)

for /f "usebackq tokens=1,* delims==" %%a in ("%~dp0Backend\.env") do (
    if /I "%%a"=="DB_NAME" SET "DB=%%b"
    if /I "%%a"=="DB_USER" SET "DB_USER=%%b"
    if /I "%%a"=="DB_PASSWORD" SET "MYSQL_PWD=%%b"
)

echo ============================================
echo  Importando base de datos Trilaleo...
echo ============================================

echo [1/16] auth_permission...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_auth_permission.sql"

echo [2/16] auth_group...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_auth_group.sql"

echo [3/16] auth_group_permissions...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_auth_group_permissions.sql"

echo [4/16] auth_user...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_auth_user.sql"

echo [5/16] auth_user_groups...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_auth_user_groups.sql"

echo [6/16] auth_user_user_permissions...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_auth_user_user_permissions.sql"

echo [7/16] django_content_type...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_django_content_type.sql"

echo [8/16] django_migrations...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_django_migrations.sql"

echo [9/16] django_session...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_django_session.sql"

echo [10/16] django_admin_log...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_django_admin_log.sql"

echo [11/16] categorias...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_categorias.sql"

echo [12/16] productos...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_productos.sql"

echo [13/16] presentaciones_producto...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_presentaciones_producto.sql"

echo [14/16] ventas...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_ventas.sql"

echo [15/16] detalle_venta...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_detalle_venta.sql"

echo [16/16] merma...
"%MYSQL%" -u "%DB_USER%" "%DB%" < "%DIR%\inventario_trilaleo_merma.sql"

echo.
echo ============================================
echo  Verificando tablas importadas...
echo ============================================
"%MYSQL%" -u "%DB_USER%" "%DB%" -e "SHOW TABLES;"

echo.
echo ============================================
echo  LISTO! Base de datos importada.
echo  Ahora ejecuta iniciar_sistema.bat
echo ============================================
set "MYSQL_PWD="
pause
endlocal
