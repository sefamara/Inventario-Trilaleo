@echo off
title Sistema Inventario Trilaleo
chcp 65001 >nul

echo ========================================================
echo        SISTEMA DE INVENTARIO TRILALEO
echo        Iniciando todos los servicios...
echo ========================================================
echo.

:: Obtener la ruta donde esta este script
set "PROJECT_DIR=%~dp0"

:: Detectar IP local para exponer servidor
echo Detectando direccion IP de la red local...
for /f "delims=" %%i in ('powershell -NoProfile -Command "$ip=(Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' -and $_.IPv4Address } | Select-Object -First 1 -ExpandProperty IPv4Address).IPAddress; if (-not $ip) { $ip=(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { -not $_.IPAddress.StartsWith('127.') -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1 -ExpandProperty IPAddress }; $ip"') do set LOCAL_IP=%%i
if "%LOCAL_IP%"=="" set LOCAL_IP=127.0.0.1
echo IP Local detectada: %LOCAL_IP%
echo.

echo Verificando regla de Firewall para el puerto 3443...
netsh advfirewall firewall add rule name="Sistema Inventario Trilaleo HTTPS 3443" dir=in action=allow protocol=TCP localport=3443 >nul 2>nul
if errorlevel 1 (
    echo     No se pudo crear la regla automaticamente. Si el celular no conecta,
    echo     permite Node.js en Windows Firewall o abre manualmente el puerto 3443.
) else (
    echo     Regla de Firewall lista para el puerto 3443.
)
echo.

:: --------------------------------------------------------
:: 1. Iniciar Backend Django
:: --------------------------------------------------------
echo [1/3] Iniciando Backend Django (puerto 8000)...
start "Backend Django - Trilaleo" cmd /k "cd /d %PROJECT_DIR%Backend\inventario && call %PROJECT_DIR%django_entorno\Scripts\activate.bat && set ALLOWED_HOSTS=*&& python manage.py runserver 0.0.0.0:8000"

timeout /t 3 /nobreak >nul

:: --------------------------------------------------------
:: 2. Iniciar Frontend Next.js en modo desarrollo (HTTP)
::    Para uso en este PC
:: --------------------------------------------------------
echo [2/3] Iniciando Frontend HTTP para este PC (puerto 3000)...
start "Frontend HTTP - Trilaleo" cmd /k "cd /d %PROJECT_DIR%Frontend && npm run dev -- -H 0.0.0.0"

:: --------------------------------------------------------
:: 3. Preparar y lanzar Frontend HTTPS (para camara movil)
:: --------------------------------------------------------
echo [3/3] Preparando servidor HTTPS para movil (puerto 3443)...

:: Compilar siempre el frontend estatico que usa el servidor HTTPS movil
echo.
echo     Compilando frontend para el servidor HTTPS movil...
echo     Esto asegura que el celular vea la ultima version del sistema.
echo.
cd /d "%PROJECT_DIR%Frontend"
call npm run build
echo.

:: Generar certificado SSL si no existe (solo la primera vez)
echo     Verificando certificado SSL para la IP %LOCAL_IP%...
cd /d "%PROJECT_DIR%Frontend"
node generar-cert.js %LOCAL_IP%

:: Lanzar servidor HTTPS
start "Frontend HTTPS Movil - Trilaleo" cmd /k "cd /d %PROJECT_DIR%Frontend && node serve-https.js"

timeout /t 6 /nobreak >nul

:: --------------------------------------------------------
:: 4. Abrir navegador en el PC (usa el HTTP normal)
:: --------------------------------------------------------
start http://localhost:3000

echo.
echo ========================================================
echo   SISTEMA INICIADO CORRECTAMENTE
echo ========================================================
echo.
echo   En este PC:         http://localhost:3000
echo.
echo   Desde el celular ^(WiFi^):
echo   https://%LOCAL_IP%:3443
echo.
echo   Al entrar por primera vez desde el celular,
echo   el navegador mostrara una advertencia de seguridad.
echo   Toca "Avanzado" y luego "Continuar de todos modos".
echo   Solo tienes que hacerlo UNA vez.
echo.
echo ========================================================
echo.
pause
