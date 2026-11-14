@echo off
setlocal
cd /d "%~dp0"

echo ==========================================================
echo           Starting ClauseShield System
echo ==========================================================
echo.

:: Check if backend is already listening on port 8000
netstat -ano | findstr 127.0.0.1:8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Backend server is already running on port 8000.
) else (
    echo [*] Starting FastAPI backend automatically in background...
    start /min "ClauseShield Backend" cmd /c "python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000"
    timeout /t 2 /nobreak >nul
)

echo [*] Opening ClauseShield in your browser...
start http://localhost:8000

echo.
echo ==========================================================
echo [✓] ClauseShield is online at http://localhost:8000
echo ==========================================================
exit /b 0
