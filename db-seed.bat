@echo off
setlocal enabledelayedexpansion

echo ============================================================================
echo   Alumni Tracker - Database Seeder & Factory Runner (DDD Spec)
echo   Istanbul University - Management Information Systems (YBS)
echo ============================================================================
echo.

cd /d "%~dp0server"

echo [*] Running DatabaseSeeder...
node database\seeders\DatabaseSeeder.js %*

echo.
pause
