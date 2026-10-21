@echo off
setlocal enabledelayedexpansion

echo ============================================================================
echo   Alumni Tracker - Database Migration Runner (DDD Spec)
echo   Istanbul University - Management Information Systems (YBS)
echo ============================================================================
echo.

cd /d "%~dp0\server"

node database\migrate.js %*

echo.
pause
