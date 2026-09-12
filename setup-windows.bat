@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo Пульс-дуэль — установка (Windows)
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js не найден. Пробую поставить через winget...
  where winget >nul 2>nul
  if errorlevel 1 (
    echo.
    echo Поставь Node.js 22 LTS вручную: https://nodejs.org/
    echo Потом снова запусти setup-windows.bat
    echo.
    pause
    exit /b 1
  )
  winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  if errorlevel 1 (
    echo Не удалось поставить Node через winget.
    pause
    exit /b 1
  )
  echo.
  echo Node установлен. Закрой это окно и СНОВА запусти setup-windows.bat
  pause
  exit /b 0
)

echo Node: 
node -v
echo.

call npm install
if errorlevel 1 (
  echo npm install не удался
  pause
  exit /b 1
)

echo.
echo Запускаю http://127.0.0.1:4721/?play=1
start "" "http://127.0.0.1:4721/?play=1"
call npm run dev
pause
