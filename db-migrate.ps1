# ============================================================================
# Alumni Tracker - Database Migration Runner (PowerShell)
# Specification Reference: DDD.md
# ============================================================================

param (
    [switch]$Status
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\server"

$argsList = @()
if ($Status) { $argsList += "--status" }

node "database\migrate.js" $argsList
