#Requires -Version 5.1
<#
  Пульс-дуэль — установка и запуск на Windows (один файл).
  Дважды кликни или: powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1
#>
$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Ensure-Node {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) {
    $version = & node -v
    Write-Host "Node найден: $version"
    return
  }

  Write-Step "Node.js не найден — ставлю LTS через winget"
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if (-not $winget) {
    Write-Host @"

Node.js не установлен, и winget недоступен.
1) Скачай Node.js 22 LTS: https://nodejs.org/
2) Установи с галкой Add to PATH
3) Закрой и снова открой этот скрипт

"@ -ForegroundColor Yellow
    throw "Нужен Node.js 22+"
  }

  & winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) {
    throw "winget не смог поставить Node.js (код $LASTEXITCODE)"
  }

  # Обновляем PATH текущей сессии
  $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = "$machinePath;$userPath"

  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) {
    throw "Node установился, но не виден в PATH. Закрой окно и запусти setup-windows.ps1 ещё раз."
  }
  Write-Host "Node установлен: $(node -v)"
}

Write-Host "Пульс-дуэль · автоустановка" -ForegroundColor Green
Write-Host "Папка: $PSScriptRoot"

if (-not (Test-Path -Path (Join-Path $PSScriptRoot 'package.json'))) {
  throw "Запусти скрипт из корня проекта (рядом с package.json)."
}

Ensure-Node

Write-Step "npm install"
& npm install
if ($LASTEXITCODE -ne 0) { throw "npm install завершился с ошибкой" }

Write-Step "Проверка сборки"
& npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build завершился с ошибкой" }

Write-Step "Запуск dev-сервера на http://127.0.0.1:4721"
Write-Host "Игра:  http://127.0.0.1:4721/?play=1"
Write-Host "Стоп:  Ctrl+C"
Write-Host ""

Start-Process "http://127.0.0.1:4721/?play=1"
& npm run dev
