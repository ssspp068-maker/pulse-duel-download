#Requires -Version 5.1
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot
$Host.UI.RawUI.WindowTitle = 'PULSE setup'

Write-Host ''
Write-Host '========================================'
Write-Host '  PULSE - ustanovka na Windows'
Write-Host '========================================'
Write-Host "Papka: $PSScriptRoot"
Write-Host ''

if (-not (Test-Path (Join-Path $PSScriptRoot 'package.json'))) {
  Write-Host '[OSHIBKA] Net package.json. Zapusti skript iz kornya ZIP.' -ForegroundColor Red
  Read-Host 'Nazhmi Enter'
  exit 1
}

function Refresh-Path {
  $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$machinePath;$userPath"
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host '[!] Node.js ne nayden' -ForegroundColor Yellow
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) {
    Write-Host 'Otkroyu stranicu Node.js LTS. Ustanovi i zapusti skript snova.' -ForegroundColor Yellow
    Start-Process 'https://nodejs.org/'
    Read-Host 'Nazhmi Enter'
    exit 1
  }
  Write-Host 'Stavlyu Node.js cherez winget...'
  & winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) {
    Write-Host '[OSHIBKA] winget ne smog postavit Node' -ForegroundColor Red
    Start-Process 'https://nodejs.org/'
    Read-Host 'Nazhmi Enter'
    exit 1
  }
  Write-Host 'Node ustanovlen. Zakroy okno i zapusti skript SNOVA.' -ForegroundColor Green
  Read-Host 'Nazhmi Enter'
  exit 0
}

Refresh-Path
Write-Host "[OK] Node: $(node -v)"
Write-Host ''
Write-Host '[1/2] npm install ...'
& npm install
if ($LASTEXITCODE -ne 0) {
  Write-Host '[OSHIBKA] npm install' -ForegroundColor Red
  Read-Host 'Nazhmi Enter'
  exit 1
}

Write-Host ''
Write-Host '[2/2] Zapusk http://127.0.0.1:4721/'
Write-Host 'Ne zakryvay eto okno. Stop: Ctrl+C'
Write-Host ''
Start-Sleep -Seconds 1
Start-Process 'http://127.0.0.1:4721/'
& npm run dev
Read-Host 'Nazhmi Enter'
