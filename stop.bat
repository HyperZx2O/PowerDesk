@echo off
title PowerDesk Stopper

echo Stopping PowerDesk services...
echo.

:: Kill by window title (cleaner than killing all node)
taskkill /fi "WINDOWTITLE eq PowerDesk Backend*"   /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq PowerDesk Dashboard*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq PowerDesk Bot*"       /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq PowerDesk Register*"  /f >nul 2>&1

:: Kill any remaining node processes related to this project
for /f "tokens=2 delims=," %%a in ('tasklist /fi "IMAGENAME eq node.exe" /fo csv /nh 2^>nul') do (
    taskkill /pid %%~a /f >nul 2>&1
)

echo All PowerDesk services stopped.
timeout /t 2 /nobreak >nul
