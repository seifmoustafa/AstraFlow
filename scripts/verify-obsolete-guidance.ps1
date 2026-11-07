param(
    [string]$SourceRoot = (Join-Path (Split-Path -Parent $PSScriptRoot) "src")
)

$ErrorActionPreference = "Stop"
$invalid = [System.Collections.Generic.List[string]]::new()
$attributePattern = [regex]'\[Obsolete(?:Attribute)?\s*\((?<arguments>[^)]*)\)\]'
$messagePattern = [regex]'^(?:\s*"(?<message>(?:[^"\\]|\\.)*)"|\s*nameof\s*\()'

foreach ($sourceFile in Get-ChildItem -LiteralPath $SourceRoot -Filter "*.cs" -Recurse | Sort-Object FullName) {
    $source = Get-Content -LiteralPath $sourceFile.FullName -Raw
    foreach ($match in $attributePattern.Matches($source)) {
        $message = $messagePattern.Match($match.Groups["arguments"].Value)
        if (-not $message.Success -or $message.Groups["message"].Value -notmatch '(?i)\buse\b.{1,120}\b(instead|replacement|replace)\b') {
            $relativePath = [System.IO.Path]::GetRelativePath((Resolve-Path -LiteralPath $SourceRoot).Path, $sourceFile.FullName).Replace('\', '/')
            $invalid.Add("$relativePath has an Obsolete attribute without actionable replacement guidance.")
        }
    }
}

if ($invalid.Count -gt 0) {
    throw "Obsolete API guidance verification failed:`n$($invalid -join "`n")`nUse a message such as 'Use NewApi instead.'"
}

Write-Host "All Obsolete attributes include actionable replacement guidance."
