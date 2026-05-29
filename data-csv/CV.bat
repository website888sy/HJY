@echo off
:: ضبط ترميز النظام لدعم جميع اللغات والرموز العالمية بشكل صحيح
chcp 65001 > nul

:: تشغيل أمر PowerShell لمعالجة أسماء كافة الملفات ونسخها مرتبة سطر بسطر مباشرة إلى الحافظة
powershell -NoProfile -Command ^
    "$files = Get-ChildItem -File | Sort-Object Name | ForEach-Object { $_.BaseName }; " ^
    "if ($files) { [string]::Join([Environment]::NewLine, $files) | Set-Clipboard }"

:: الخروج الفوري والنظيف دون ترك أي أثر في واجهة المستخدم
exit