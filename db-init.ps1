# ============================================================================
# Alumni Tracker - PostgreSQL Database Initializer (PowerShell)
# Specification Reference: DDD.md
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  Alumni Tracker - PostgreSQL Database Initializer (DDD Spec)" -ForegroundColor Cyan
Write-Host "  Istanbul University - Management Information Systems (YBS)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if alumni-postgres container is running
$pgStatus = docker ps --filter "name=alumni-postgres" --format "{{.Names}}"
if (-not $pgStatus -or -not ($pgStatus -match "alumni-postgres")) {
    Write-Host "[!] alumni-postgres container is not running. Starting Docker Compose..." -ForegroundColor Yellow
    docker compose up -d db
    Write-Host "[*] Waiting 6 seconds for PostgreSQL to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 6
}

Write-Host "[*] Executing database/init.sql inside alumni-postgres..." -ForegroundColor Green
Get-Content "$scriptDir\database\init.sql" -Raw | docker exec -i alumni-postgres psql -U postgres -d alumni_db

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[v] Database successfully generated and seeded according to DDD.md!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current Database Summary:" -ForegroundColor Yellow
    docker exec alumni-postgres psql -U postgres -d alumni_db -c "SELECT count(*) AS total_users FROM users; SELECT count(*) AS total_profiles FROM alumni_profiles; SELECT count(*) AS total_announcements FROM announcements;"
} else {
    Write-Host "[x] Database initialization failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
