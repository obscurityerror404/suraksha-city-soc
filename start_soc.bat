@echo off
title SURAKSHA-CITY Smart City Cyber SOC
echo =======================================================
echo   SURAKSHA-CITY: Smart City Cyber Defense Center
echo   Organized by Adani University ^& Demmisto Technologies
echo   Cyber Samvad Hackathon 2026 - Problem Statement 4
echo =======================================================
echo.
echo Starting SURAKSHA-CITY SOC server...
echo Access in your browser at: http://127.0.0.1:5000
echo.
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://127.0.0.1:5000"
python app.py
pause
