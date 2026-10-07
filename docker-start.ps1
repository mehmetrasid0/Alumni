# ============================================================================
# Alumni Tracker - Docker Container Auto-Starter (PowerShell)
# Istanbul University - Management Information Systems (YBS)
# Author: Mehmet Raşid Ünlüel
# ============================================================================

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Alumni Tracker - Docker Auto-Starter" -ForegroundColor Cyan
Write-Host "  Istanbul University - Management Information Systems (YBS)" -ForegroundColor DarkGray
Write-Host "  Author: Mehmet Rasid Unluel" -ForegroundColor DarkGray
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[1/3] Checking Docker daemon status..." -ForegroundColor Yellow
$dockerReady = $false

docker info *>$null
if ($LASTEXITCODE -eq 0) {
    $dockerReady = $true
    Write-Host "[v] Docker daemon is already active." -ForegroundColor Green
} else {
    Write-Host "[!] Docker Desktop is not running. Launching Docker Desktop..." -ForegroundColor Yellow
    $dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerExe) {
        Start-Process $dockerExe
    } else {
        Write-Host "[x] Docker Desktop executable not found at default location." -ForegroundColor Red
        exit 1
    }

    Write-Host "[*] Waiting for Docker daemon to become responsive..." -ForegroundColor Yellow
    $retries = 0
    while (-not $dockerReady -and $retries -lt 30) {
        Start-Sleep -Seconds 3
        docker info *>$null
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "[v] Docker daemon is ready!" -ForegroundColor Green
            break
        }
        $retries++
        Write-Host "    Waiting for engine... ($($retries * 3)s)" -ForegroundColor DarkGray
    }

    if (-not $dockerReady) {
        Write-Host "[x] Timed out waiting for Docker Desktop to start." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[2/3] Spinning up container via docker compose..." -ForegroundColor Yellow
docker compose up -d

Write-Host ""
Write-Host "[3/3] Verifying container state..." -ForegroundColor Yellow
docker ps --filter "name=alumni"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  Alumni Tracker is active inside Docker Container!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "  Portal Home:         http://localhost:5000/" -ForegroundColor Cyan
Write-Host "  Announcements UI:    http://localhost:5000/announcements" -ForegroundColor Cyan
Write-Host "  Alumni Directory:    http://localhost:5000/users" -ForegroundColor Cyan
Write-Host "  Swagger OpenAPI:     http://localhost:5000/api/swagger" -ForegroundColor Cyan
Write-Host "  Health Diagnostics:  http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Green
