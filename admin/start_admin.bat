@echo off
setlocal
cd /d "%~dp0.."
title HJY Admin Server
color 0B

set "VENV_PY=%~dp0venv\Scripts\python.exe"
set "SERVER=%~dp0server.py"
set "PYTHONDONTWRITEBYTECODE=1"
set "PYTHONUTF8=1"

echo ============================================
echo    HJY ADMIN - local server for the admin panel
echo    Open:  http://localhost:8333/admin/index.html
echo    To stop: press Ctrl+C in this window
echo ============================================
echo.

if not exist "%VENV_PY%" goto setup
"%VENV_PY%" -c "import sys" >nul 2>&1
if errorlevel 1 goto setup
goto run

:setup
echo [INFO] Preparing the isolated environment (admin\venv)...
call "%~dp0setup_env.bat"
if errorlevel 1 (
  echo.
  echo [ERROR] Could not prepare admin\venv. Fix the errors above and try again.
  pause
  exit /b 1
)

:run
start "" http://localhost:8333/admin/index.html
"%VENV_PY%" "%SERVER%"
if errorlevel 1 (
  echo.
  echo [WARN] The server may already be running on port 8333.
  echo If the panel did not open automatically, open:
  echo   http://localhost:8333/admin/index.html
  echo.
)
pause
