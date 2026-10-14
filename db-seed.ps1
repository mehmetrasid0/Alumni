# ============================================================================
# Alumni Tracker - Database Seeder & Factory Runner (PowerShell)
# Specification Reference: DDD.md
# ============================================================================

param (
    [switch]$Clean,
    [int]$Alumni = 10,
    [int]$Announcements = 5
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptDir\server"

$argsList = @()
if ($Clean) { $argsList += "--clean" }
if ($Alumni) { $argsList += "--alumni=$Alumni" }
if ($Announcements) { $argsList += "--announcements=$Announcements" }

node "database\seeders\DatabaseSeeder.js" $argsList
