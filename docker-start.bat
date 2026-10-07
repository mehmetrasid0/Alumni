@echo off
setlocal enabledelayedexpansion

echo ============================================================================
echo   Alumni Tracker - Docker Container Auto-Starter
echo   Istanbul University - Management Information Systems (YBS)
echo   Author: Mehmet Rasid Unluel
echo ============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Docker daemon status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] Docker Desktop is not running. Launching Docker Desktop...
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    ) else (
        echo [x] Docker Desktop executable not found in default path.
        echo Please ensure Docker Desktop is installed and started.
        pause
        exit /b 1
    )

    echo [*] Waiting for Docker engine to become ready...
    :wait_docker
    timeout /t 3 /nobreak >nul
    docker info >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo     Still waiting for Docker daemon...
        goto wait_docker
    )
    echo [v] Docker daemon is ready!
) else (
    echo [v] Docker daemon is already active.
)

echo.
echo [2/3] Starting Alumni Tracker Docker Container...
docker compose up -d

echo.
echo [3/3] Checking running container status...
docker ps --filter "name=alumni"

echo.
echo ============================================================================
echo   Alumni Tracker is running inside Docker!
echo ============================================================================
echo   Portal Home:         http://localhost:5000/
echo   Announcements UI:    http://localhost:5000/announcements
echo   Alumni Directory:    http://localhost:5000/users
echo   Swagger OpenAPI:     http://localhost:5000/api/swagger
echo   Health Diagnostics:  http://localhost:5000/api/health
echo ============================================================================
echo.
pause
