@echo off
setlocal EnableExtensions
cd /d "%~dp0.."
title HJY Admin - Data Health Check

set "VENV_PY=%~dp0venv\Scripts\python.exe"

echo ============================================
echo    HJY ADMIN - data health check
echo    No files will be modified.
echo ============================================
echo.

if not exist "%VENV_PY%" call "%~dp0setup_env.bat"
if not exist "%VENV_PY%" (
  echo [ERROR] admin\venv is not available.
  pause
  exit /b 1
)

"%VENV_PY%" "%~dp0check_data.py"
echo.
pause
exit /b %errorlevel%
