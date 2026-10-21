Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  SURAKSHA-CITY: Smart City Cyber Defense Center" -ForegroundColor Yellow
Write-Host "  Organized by Adani University & Demmisto Technologies" -ForegroundColor White
Write-Host "  Cyber Samvad Hackathon 2026 - Problem Statement 4" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Launching SURAKSHA-CITY SOC on http://127.0.0.1:5000..." -ForegroundColor Gray

# Start browser with 1 second delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 1
    Start-Process "http://127.0.0.1:5000"
} | Out-Null

python app.py
