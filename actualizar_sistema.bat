@echo off
title Actualizar Sistema Inventario Trilaleo
chcp 65001 >nul

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0actualizar_sistema.ps1"
set "UPDATE_EXIT=%ERRORLEVEL%"

if not "%UPDATE_EXIT%"=="0" (
    echo.
    echo La actualizacion fue cancelada. Revisa el mensaje anterior.
    pause
)

exit /b %UPDATE_EXIT%

