@echo off
title Configurar Sistema Inventario Trilaleo
chcp 65001 >nul

set "SCRIPT_ARGS="
if /I "%~1"=="--database" set "SCRIPT_ARGS=-ReconfigureDatabase"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0configurar_sistema.ps1" %SCRIPT_ARGS%
set "SETUP_EXIT=%ERRORLEVEL%"

if not "%SETUP_EXIT%"=="0" (
    echo.
    echo La configuracion no pudo completarse. Revisa el mensaje anterior.
)

if /I not "%~1"=="--no-pause" pause
exit /b %SETUP_EXIT%

