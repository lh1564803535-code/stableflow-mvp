$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173
$url = "http://127.0.0.1:$port/"

Set-Location $projectRoot

function Test-StableFlowServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $url -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (-not (Test-StableFlowServer)) {
  Start-Process -FilePath "python" `
    -ArgumentList @("-m", "http.server", "$port") `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden | Out-Null

  Start-Sleep -Seconds 2
}

Write-Host "StableFlow running at $url"

try {
  Start-Process $url | Out-Null
} catch {
  Write-Host "Browser auto-open was blocked in this environment."
  Write-Host "Open the URL manually in your browser."
}
