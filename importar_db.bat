@echo off
SET MYSQL="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
SET DB=inventario_trilaleo
SET DIR=D:\Sistema_Inventario_Trilaleo\DB_Trilaleo
SET PW=-pGodTracker.,$01

echo ============================================
echo  Importando base de datos Trilaleo...
echo ============================================

echo [1/16] auth_permission...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_auth_permission.sql"

echo [2/16] auth_group...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_auth_group.sql"

echo [3/16] auth_group_permissions...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_auth_group_permissions.sql"

echo [4/16] auth_user...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_auth_user.sql"

echo [5/16] auth_user_groups...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_auth_user_groups.sql"

echo [6/16] auth_user_user_permissions...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_auth_user_user_permissions.sql"

echo [7/16] django_content_type...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_django_content_type.sql"

echo [8/16] django_migrations...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_django_migrations.sql"

echo [9/16] django_session...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_django_session.sql"

echo [10/16] django_admin_log...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_django_admin_log.sql"

echo [11/16] categorias...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_categorias.sql"

echo [12/16] productos...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_productos.sql"

echo [13/16] presentaciones_producto...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_presentaciones_producto.sql"

echo [14/16] ventas...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_ventas.sql"

echo [15/16] detalle_venta...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_detalle_venta.sql"

echo [16/16] merma...
%MYSQL% -u root %PW% %DB% < "%DIR%\inventario_trilaleo_merma.sql"

echo.
echo ============================================
echo  Verificando tablas importadas...
echo ============================================
%MYSQL% -u root %PW% %DB% -e "SHOW TABLES;"

echo.
echo ============================================
echo  LISTO! Base de datos importada.
echo  Ahora ejecuta iniciar_sistema.bat
echo ============================================
pause
