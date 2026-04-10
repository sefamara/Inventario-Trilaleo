@echo off
title Deteniendo Sistema Inventario Trilaleo

echo ========================================================
echo        DETENIENDO SISTEMA INVENTARIO TRILALEO
echo ========================================================
echo.

echo [1/3] Deteniendo Backend Django (puerto 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo      Django detenido

echo [2/3] Deteniendo Frontend HTTP (puerto 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo      Frontend HTTP detenido

echo [3/3] Deteniendo Frontend HTTPS (puerto 3443)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3443" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo      Frontend HTTPS detenido

:: Cerrar las ventanas de consola del sistema
taskkill /FI "WINDOWTITLE eq Backend Django*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend HTTP*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend HTTPS*" /F >nul 2>&1

echo.
echo ========================================================
echo  Sistema detenido completamente
echo ========================================================
echo.
timeout /t 3
