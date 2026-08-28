@echo off
setlocal
cd /d "%~dp0"
title HJY Admin Server
color 0B

echo ============================================
echo    HJY ADMIN - local server for the admin panel
echo    Open:  http://localhost:8333/admin/index.html
echo    To stop: press Ctrl+C in this window
echo ============================================
echo.

start "" http://localhost:8333/admin/index.html

python sync_local.py
if errorlevel 1 (
  echo.
  echo [WARN] The server may already be running on port 8333.
  echo If the panel did not open automatically, open:
  echo   http://localhost:8333/admin/index.html
  echo.
)
pause
