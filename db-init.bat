@echo off
setlocal enabledelayedexpansion

echo ============================================================================
echo   Alumni Tracker - PostgreSQL Database Initializer (DDD Spec)
echo   Istanbul University - Management Information Systems (YBS)
echo ============================================================================
echo.

cd /d "%~dp0"

echo [*] Checking if alumni-postgres container is running...
docker ps --filter "name=alumni-postgres" --format "{{.Names}}" | findstr /i "alumni-postgres" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] alumni-postgres container is not running. Starting Docker Compose...
    docker compose up -d db
    echo [*] Waiting 6 seconds for PostgreSQL to be ready...
    timeout /t 6 /nobreak >nul
)

echo [*] Executing database/init.sql inside alumni-postgres...
docker exec -i alumni-postgres psql -U postgres -d alumni_db < database\init.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [v] Database successfully generated and seeded according to DDD.md!
    echo.
    echo Verifying record counts:
    docker exec alumni-postgres psql -U postgres -d alumni_db -c "SELECT count(*) AS total_users FROM users; SELECT count(*) AS total_profiles FROM alumni_profiles; SELECT count(*) AS total_announcements FROM announcements;"
) else (
    echo.
    echo [x] Database initialization encountered an error.
)

echo.
pause
