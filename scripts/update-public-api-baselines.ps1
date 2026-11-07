$ErrorActionPreference = "Stop"

& (Join-Path $PSScriptRoot "verify-public-api-baselines.ps1") -Configuration Release -UpdateBaseline
