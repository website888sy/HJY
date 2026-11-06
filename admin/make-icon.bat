@echo off
setlocal
cd /d "%~dp0.."
set "VENV_PY=%~dp0venv\Scripts\python.exe"

echo ============================================
echo    Generate HJY Admin icon from admin/icon
echo    Put your image in admin/icon, then run
echo ============================================
echo.

if not exist "%VENV_PY%" call "%~dp0setup_env.bat"
if errorlevel 1 goto fail

"%VENV_PY%" "%~dp0make_icon.py"
echo.
pause
exit /b 0

:fail
echo [ERROR] Could not prepare admin\venv.
pause
exit /b 1
