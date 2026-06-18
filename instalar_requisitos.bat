@echo off
title Instalar Requisitos - Inventario Trilaleo
chcp 65001 >nul

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar_requisitos.ps1"
set "INSTALL_EXIT=%ERRORLEVEL%"

if not "%INSTALL_EXIT%"=="0" (
    echo.
    echo La instalacion no pudo completarse. Revisa el mensaje anterior.
)

if /I not "%~1"=="--no-pause" pause
exit /b %INSTALL_EXIT%

