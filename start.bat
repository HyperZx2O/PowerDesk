@echo off
title PowerDesk Launcher
cd /d "%~dp0"

echo ====================================
echo   PowerDesk - Office Device Monitor
echo ====================================
echo.

:: ── Dependencies ──────────────────────────────────────────────
if not exist "node_modules" (
    echo [1/4] Installing backend dependencies...
    call npm install --silent
    if errorlevel 1 (
        echo ERROR: Backend install failed
        pause
        exit /b 1
    )
) else (
    echo [1/4] Backend dependencies ready
)

if not exist "discord-bot\node_modules" (
    echo [2/4] Installing bot dependencies...
    pushd discord-bot
    call npm install --silent
    if errorlevel 1 (
        echo ERROR: Bot install failed
        pause
        exit /b 1
    )
    popd
) else (
    echo [2/4] Bot dependencies ready
)

:: ── Register Slash Commands ───────────────────────────────────
echo [3/4] Registering slash commands...
pushd "%~dp0discord-bot"
start "PowerDesk Register" cmd /c "npx tsx scripts/registerCommands.ts"
popd
echo.

:: ── Launch Services ───────────────────────────────────────────
echo [4/4] Launching services...
echo.

start "PowerDesk Backend"   cmd /c "node src\index.js"
ping -n 3 127.0.0.1 >nul

start "PowerDesk Dashboard" cmd /c "npx vite --host"
ping -n 3 127.0.0.1 >nul

start "PowerDesk Bot"       cmd /c "pushd discord-bot && npx tsx src\index.ts"

:: ── Open Browser ──────────────────────────────────────────────
ping -n 5 127.0.0.1 >nul
start http://localhost:5173

echo.
echo === PowerDesk is up and running! ===
echo  - Backend:   http://localhost:5000
echo  - Dashboard: http://localhost:5173
echo  - WebSocket: ws://localhost:8080
echo  - Discord:   PowerDesk#5127 (if bot env is set)
echo.
echo Close each window individually to stop a service.
echo.
ping -n 6 127.0.0.1 >nul
