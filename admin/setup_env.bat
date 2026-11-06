@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0.."
title HJY Admin - Setup Isolated Environment

set "VENV_DIR=%~dp0venv"
set "VENV_PY=%VENV_DIR%\Scripts\python.exe"
set "RUNTIME_DIR=%~dp0.runtime"
set "PIP_CACHE_DIR=%RUNTIME_DIR%\cache\pip"
set "TEMP=%RUNTIME_DIR%\tmp"
set "TMP=%TEMP%"
set "PYTHONDONTWRITEBYTECODE=1"
set "PYTHONUTF8=1"
set "PIP_DISABLE_PIP_VERSION_CHECK=1"
set "PIP_NO_INPUT=1"

echo ============================================
echo    HJY ADMIN - isolated Python environment
echo    Python env : admin\venv
echo    Runtime    : admin\.runtime
echo ============================================
echo.

if not exist "%RUNTIME_DIR%" mkdir "%RUNTIME_DIR%" >nul 2>&1
if not exist "%TEMP%" mkdir "%TEMP%" >nul 2>&1
if not exist "%PIP_CACHE_DIR%" mkdir "%PIP_CACHE_DIR%" >nul 2>&1

set "NEED_BUILD=1"
if exist "%VENV_PY%" (
  "%VENV_PY%" -c "import sys" >nul 2>&1
  if not errorlevel 1 set "NEED_BUILD=0"
)

if "%NEED_BUILD%"=="1" (
  if exist "%VENV_DIR%" (
    echo [INFO] The existing environment belongs to another PC or is broken.
    echo [INFO] Removing admin\venv and rebuilding it cleanly...
    rmdir /s /q "%VENV_DIR%" >nul 2>&1
    if exist "%VENV_DIR%" (
      echo [ERROR] Could not remove admin\venv. Close any program using it and retry.
      exit /b 1
    )
  )

  set "PY="
  where python >nul 2>&1
  if not errorlevel 1 set "PY=python"
  if not defined PY (
    where py >nul 2>&1
    if not errorlevel 1 set "PY=py -3"
  )
  if not defined PY (
    echo [ERROR] Python was not found on this PC.
    echo Install Python 3 from: https://www.python.org/downloads/windows/
    echo During installation, tick "Add python.exe to PATH", then run this file again.
    echo.
    exit /b 1
  )

  echo [1/3] Creating virtual environment: admin\venv
  !PY! -m venv --copies --clear "%VENV_DIR%"
  if errorlevel 1 goto fail
  if not exist "%VENV_PY%" goto fail
) else (
  echo [1/3] Existing environment is valid. Reusing it.
)

echo [2/3] Updating pip inside the isolated environment...
"%VENV_PY%" -m pip install --upgrade pip --quiet --disable-pip-version-check
if errorlevel 1 (
  echo [WARN] Could not update pip - offline? Continuing with the current pip.
)

echo [3/3] Installing admin\requirements.txt...
"%VENV_PY%" -m pip install -r "%~dp0requirements.txt" --quiet --disable-pip-version-check
if errorlevel 1 goto fail

echo.
echo [OK] Environment is ready.
echo      Nothing was installed into the system Python.
echo      Cache/temp stay inside: admin\.runtime
exit /b 0

:fail
echo.
echo [ERROR] Environment setup failed. See the messages above.
echo         If this is a network problem, connect to the internet and retry.
exit /b 1
