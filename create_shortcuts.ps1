# create_shortcuts.ps1 - creates the single HJY desktop shortcut.
# Run it again any time you move the project folder or change the icon.
#
# HJY Admin -> starts everything (isolated venv + hidden server + app window).
# Closing that app window stops the server and all helper processes automatically.
# No cmd window is shown.

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$ico = Join-Path $root 'admin\icon\app.ico'
$script = Join-Path $root 'launch_app.ps1'

if (-not (Test-Path -LiteralPath $ico)) { $ico = Join-Path $root 'admin\icons\icon-192.png' }

$name = 'HJY Admin'
$lnk = Join-Path $desktop ($name + '.lnk')
$sc = $ws.CreateShortcut($lnk)
$sc.TargetPath = $ps
$sc.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $script + '" -Target admin'
$sc.WorkingDirectory = $root
$sc.IconLocation = $ico
$sc.Description = 'HJY Admin - one shortcut: starts everything, closes everything'
$sc.Save()
Write-Output ('Created: ' + $lnk)

# Remove shortcuts created by older versions (we keep exactly one shortcut).
$legacy = @('HJY Store.lnk', 'HJY Admin - Content.lnk', 'HJY Admin - Stop.lnk')
foreach ($old in $legacy) {
  $oldPath = Join-Path $desktop $old
  if (Test-Path -LiteralPath $oldPath) {
    Remove-Item -LiteralPath $oldPath -Force
    Write-Output ('Removed old shortcut: ' + $old)
  }
}
