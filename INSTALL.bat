@echo off
setlocal
set "EXT_DIR=%~dp0"

echo.
echo Base44 Code Downloader - instalacja
echo ==================================
echo.
echo 1. W Chrome wlacz "Developer mode" / "Tryb dewelopera".
echo 2. Kliknij "Load unpacked" / "Zaladuj rozpakowane".
echo 3. Wybierz ten folder:
echo.
echo    %EXT_DIR%
echo.
echo Zaraz otworze chrome://extensions
echo.
pause

start chrome "chrome://extensions"

echo.
echo Po otwarciu Chrome wybierz folder:
echo %EXT_DIR%
echo.
pause
