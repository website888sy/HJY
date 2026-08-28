@echo off
cd /d "%~dp0"
echo ============================================
echo    Generate HJY Admin icon from admin/icon
echo    Put your image in admin/icon, then run
echo ============================================
echo.
python make_icon.py
echo.
pause
