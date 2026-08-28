@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title HJY Admin Server
color 0B

echo ============================================
echo    HJY ADMIN - الخادم المحلي للوحة الإدارة
echo    فتح اللوحة:  http://localhost:8333/admin/index.html
echo    للإيقاف:  اضغط Ctrl+C في هذه النافذة
echo ============================================
echo.

start "" http://localhost:8333/admin/index.html

python sync_local.py
if errorlevel 1 (
  echo.
  echo [تنبيه] يبدو أن الخادم يعمل بالفعل على المنفذ 8333.
  echo إن لم تفتح اللوحة تلقائياً افتح: http://localhost:8333/admin/index.html
  echo.
)
pause
