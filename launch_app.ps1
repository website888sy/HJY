# -*- coding: utf-8 -*-
# launch_app.ps1 - HJY desktop app launcher / stopper.
#
# Starts the isolated Python server (hidden, no cmd window) and opens the app
# in its own browser window. When the last app window is closed, the server and
# all helper processes are stopped automatically.
#
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File launch_app.ps1 -Target admin
#   powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File launch_app.ps1 -Target content
#   powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File launch_app.ps1 -Target site
#   powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File launch_app.ps1 -StopOnly
#
# Runtime files (logs, browser profile, temp, pid) live in admin\.runtime and
# are safe to delete when the app is closed.

param(
  [ValidateSet('admin', 'content', 'site')][string]$Target = 'admin',
  [switch]$StopOnly
)

$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$port = 8333
$adminDir = Join-Path $root 'admin'
$runtimeDir = Join-Path $adminDir '.runtime'
$logDir = Join-Path $runtimeDir 'logs'
$tmpDir = Join-Path $runtimeDir 'tmp'
$profileDir = Join-Path $runtimeDir 'browser-profile'
$pidFile = Join-Path $runtimeDir 'server.pid'
$launcherLog = Join-Path $logDir 'launcher.log'
$serverLog = Join-Path $logDir 'server.log'
$serverErrLog = Join-Path $logDir 'server-error.log'
$setupLog = Join-Path $logDir 'setup.log'
$venvPy = Join-Path $adminDir 'venv\Scripts\python.exe'
$venvPyw = Join-Path $adminDir 'venv\Scripts\pythonw.exe'
$setupEnv = Join-Path $adminDir 'setup_env.bat'
$serverPy = Join-Path $adminDir 'server.py'

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
New-Item -ItemType Directory -Force -Path $profileDir | Out-Null

function Write-Log([string]$Message) {
  try {
    $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
    Add-Content -LiteralPath $launcherLog -Value $line -Encoding UTF8
    $info = Get-Item -LiteralPath $launcherLog
    if ($info.Length -gt 524288) {
      $tail = Get-Content -LiteralPath $launcherLog -Tail 400
      Set-Content -LiteralPath $launcherLog -Value $tail -Encoding UTF8
    }
  } catch {}
}

function Show-Message([string]$Text, [string]$Title = 'HJY Admin', [string]$Icon = 'Error') {
  try {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show(
      $Text,
      $Title,
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::$Icon
    ) | Out-Null
  } catch {}
}

function Test-Server {
  try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:$port/ping" -TimeoutSec 1
    return [bool]($r -and $r.ok)
  } catch { return $false }
}

function Get-ServerInfo {
  try { return Invoke-RestMethod -Uri "http://127.0.0.1:$port/ping" -TimeoutSec 2 } catch { return $null }
}

function Get-ServerPid {
  try {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($conn) { return [int]$conn.OwningProcess }
  } catch {}
  return 0
}

function Read-PidFile {
  try {
    if (Test-Path -LiteralPath $pidFile) {
      $raw = (Get-Content -LiteralPath $pidFile -Raw).Trim()
      if ($raw -match '^\d+$') { return [int]$raw }
    }
  } catch {}
  return 0
}

function Test-OurServerProcess([int]$ProcessId) {
  if (-not $ProcessId) { return $false }
  try {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction Stop
    return [bool]($proc.CommandLine -and $proc.CommandLine.IndexOf($serverPy, [StringComparison]::OrdinalIgnoreCase) -ge 0)
  } catch { return $false }
}

function Stop-Server {
  $pids = @()
  $listenerPid = Get-ServerPid
  if ($listenerPid) { $pids += $listenerPid }
  $savedPid = Read-PidFile
  if ($savedPid -and ($pids -notcontains $savedPid) -and (Test-OurServerProcess $savedPid)) { $pids += $savedPid }

  foreach ($serverPid in $pids) {
    & "$env:SystemRoot\System32\taskkill.exe" /PID $serverPid /T /F 2>$null | Out-Null
    Write-Log "Stopped server PID $serverPid"
  }
  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
}

function Get-AppProcesses {
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe' OR Name='msedge.exe' OR Name='brave.exe' OR Name='chromium.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($profileDir, [StringComparison]::OrdinalIgnoreCase) -ge 0 }
}

function Test-AppWindowOpen {
  foreach ($p in (Get-AppProcesses)) {
    $proc = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
    if ($proc -and $proc.MainWindowHandle -ne 0) { return $true }
  }
  return $false
}

function Stop-AppBrowser {
  foreach ($p in (Get-AppProcesses)) {
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

function Test-Venv {
  if (-not (Test-Path -LiteralPath $venvPy)) { return $false }
  & $venvPy -c "import sys" 2>$null
  return ($LASTEXITCODE -eq 0)
}

function Get-Browser {
  $candidates = @(
    (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
    (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'),
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:ProgramFiles 'BraveSoftware\Brave-Browser\Application\brave.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'BraveSoftware\Brave-Browser\Application\brave.exe')
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path -LiteralPath $c)) { return $c }
  }
  return $null
}

function Get-LogTail([string]$Path, [int]$Lines = 10) {
  try {
    if (Test-Path -LiteralPath $Path) {
      return ((Get-Content -LiteralPath $Path -Tail $Lines) -join [Environment]::NewLine)
    }
  } catch {}
  return ''
}

function Invoke-Setup {
  Write-Log 'Python environment missing or invalid. Running setup_env.bat (hidden).'
  $cmdLine = '/c ""' + $setupEnv + '" > "' + $setupLog + '" 2>&1"'
  Start-Process -FilePath $env:ComSpec -ArgumentList $cmdLine -WorkingDirectory $root -WindowStyle Hidden -Wait | Out-Null
}

# ---------------------------------------------------------------- stop mode
if ($StopOnly) {
  Write-Log 'Stop requested by user.'
  Stop-Server
  Stop-AppBrowser
  Write-Log 'Stop finished.'
  exit 0
}

# ---------------------------------------------------------------- start mode
Write-Log ('Launch requested. Target={0}' -f $Target)

if (Test-Server) {
  $info = Get-ServerInfo
  if ($info -and $info.root -and $info.root -ne $root) {
    Write-Log ('Port {0} belongs to another project: {1}' -f $port, $info.root)
    Show-Message ("Port $port is used by another program:`n$($info.root)`n`nClose it and try again.") 'HJY Admin'
    exit 1
  }
  $serverPid = Get-ServerPid
  if (-not $serverPid) { $serverPid = Read-PidFile }
  Write-Log ('Using already running server. PID={0}' -f $serverPid)
} else {
  if (-not (Test-Venv)) {
    Invoke-Setup
    if (-not (Test-Venv)) {
      Write-Log 'Setup failed: admin\venv is still invalid.'
      Show-Message ("The isolated Python environment could not be prepared.`n`nLog: $setupLog`n`n" + (Get-LogTail $setupLog 12)) 'HJY Admin'
      exit 1
    }
  }

  $env:PYTHONDONTWRITEBYTECODE = '1'
  $env:PYTHONUTF8 = '1'
  $env:PYTHONUNBUFFERED = '1'
  Remove-Item -LiteralPath $serverLog, $serverErrLog -Force -ErrorAction SilentlyContinue

  $runner = if (Test-Path -LiteralPath $venvPyw) { $venvPyw } else { $venvPy }
  $serverProc = Start-Process -FilePath $runner -ArgumentList ('"' + $serverPy + '"') `
    -WorkingDirectory $root -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput $serverLog -RedirectStandardError $serverErrLog

  if ($serverProc) {
    Set-Content -LiteralPath $pidFile -Value ([string]$serverProc.Id) -Encoding ASCII
    Write-Log ('Started hidden server. PID={0}' -f $serverProc.Id)
  }

  $ok = $false
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-Server) { $ok = $true; break }
  }

  if (-not $ok) {
    Write-Log 'Server did not answer on /ping.'
    Stop-Server
    $detail = (Get-LogTail $serverErrLog 12) + "`n" + (Get-LogTail $serverLog 12)
    Show-Message ("The local server did not start.`n`nLog: $serverErrLog`n`n" + $detail.Trim()) 'HJY Admin'
    exit 1
  }

  $serverPid = Get-ServerPid
  if (-not $serverPid) { $serverPid = Read-PidFile }
  Write-Log ('Server is ready. PID={0}' -f $serverPid)
}

$browser = Get-Browser
if (-not $browser) {
  Write-Log 'No supported browser found (Chrome/Edge/Brave).'
  Stop-Server
  Show-Message 'Chrome, Edge or Brave was not found. Install one of them, then try again.' 'HJY Admin'
  exit 1
}

if ($Target -eq 'admin') { $url = "http://localhost:$port/admin/index.html" }
elseif ($Target -eq 'content') { $url = "http://localhost:$port/admin/site.html" }
else { $url = "http://localhost:$port/index.html" }

$browserArgs = @(
  "--app=$url",
  "--user-data-dir=`"$profileDir`"",
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-background-mode',
  '--disable-session-crashed-bubble',
  '--disable-features=Translate,MediaRouter',
  '--start-maximized'
)

Start-Process -FilePath $browser -ArgumentList $browserArgs | Out-Null
Write-Log ('Opened app window: {0}' -f $url)

$windowSeen = $false
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Milliseconds 250
  if (Test-AppWindowOpen) { $windowSeen = $true; break }
}

if (-not $windowSeen) {
  Write-Log 'The app window did not appear; stopping everything.'
  Stop-AppBrowser
  Stop-Server
  Show-Message 'The app window did not open. Try again, or run admin\start_admin.bat to see the error.' 'HJY Admin'
  exit 1
}

Write-Log 'App window is open. Waiting for it to be closed...'
while (Test-AppWindowOpen) {
  Start-Sleep -Milliseconds 500
  if (-not (Test-Server)) {
    Write-Log 'Server is no longer running; closing the app window.'
    Stop-AppBrowser
    break
  }
}

Start-Sleep -Milliseconds 800
Stop-AppBrowser
Stop-Server
Write-Log 'App window closed. Server and helpers stopped.'
exit 0
