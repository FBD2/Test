@echo off
echo ========================================
echo   Voice Call System Launcher
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Voice Call Server...
start "Voice Call Server" cmd /k "npm start"

echo Waiting for server to initialize...
timeout /t 4 /nobreak >nul

echo Starting Cloudflare Tunnel...
start "Cloudflare Tunnel - YOUR PUBLIC URL HERE" cmd /k "cloudflared tunnel --url http://localhost:3000"

echo.
echo ========================================
echo   Voice Call System Started!
echo ========================================
echo.
echo Check the "Cloudflare Tunnel" window
echo for your public URL to share!
echo.
echo Keep both windows open while using the app.
echo Press Ctrl+C in each window to stop.
echo.
pause
