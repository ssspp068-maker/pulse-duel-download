@echo off
setlocal EnableExtensions
title PULSE setup
cd /d "%~dp0"

echo.
echo ========================================
echo   PULSE - ustanovka na Windows
echo ========================================
echo.
echo Papka: %CD%
echo.

if not exist "package.json" (
  echo [OSHIBKA] Net package.json.
  echo Zapusti bat iz kornya proekta posle raspakovki ZIP.
  echo.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 goto INSTALL_NODE

echo [OK] Node nayden:
node -v
echo.
goto DO_INSTALL

:INSTALL_NODE
echo [!] Node.js ne nayden.
echo.
where winget >nul 2>nul
if errorlevel 1 (
  echo [OSHIBKA] Net winget.
  echo.
  echo 1^) Skachay Node.js LTS: https://nodejs.org/
  echo 2^) Ustanovi s galkoy "Add to PATH"
  echo 3^) Zakroy VSE okna terminala
  echo 4^) Snova zapusti etot bat
  echo.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

echo Stavlyu Node.js cherez winget...
echo ^(mozhet poprosit podtverzhdenie UAC^)
echo.
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
  echo.
  echo [OSHIBKA] winget ne smog postavit Node.
  echo Postav vruchnuyu: https://nodejs.org/
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

echo.
echo Node ustanovlen.
echo ZAKROY eto okno i SNOVA zapusti setup-windows.bat
echo ^(nuzhno chtoby PATH obnovilsya^)
echo.
pause
exit /b 0

:DO_INSTALL
echo [1/2] npm install ...
call npm install
if errorlevel 1 (
  echo.
  echo [OSHIBKA] npm install ne udalsya.
  echo Prover internet i poprobuy eshche raz.
  echo.
  pause
  exit /b 1
)

echo.
echo [2/2] Zapusk servera...
echo.
echo Otkroy v brauzere: http://127.0.0.1:4721/
echo Kompas:           http://127.0.0.1:4721/compass
echo.
echo Ne zakryvay eto okno, poka igraesh.
echo Ostanovka: Ctrl+C
echo.

timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4721/"

call npm run dev
echo.
echo Server ostanovlen.
pause
endlocal
