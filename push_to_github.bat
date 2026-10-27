@echo off
title Push Digital Literacy Bridge to GitHub
color 0b
echo ================================================================
echo   Pushing Digital Literacy Bridge to GitHub Repository
echo   Repo URL: https://github.com/karthikeyan745/Digital-Literacy-bridge.git
echo ================================================================
echo.
cd /d "c:\Users\ELCOT\Desktop\collage project 2026\Digital Literacy bridge"

echo Checking remote configuration...
git remote -v
echo.

echo Running git push...
git push -u origin main --force

echo.
if %errorlevel% equ 0 (
    echo ================================================================
    echo   SUCCESS! All code has been pushed to GitHub!
    echo   View online: https://github.com/karthikeyan745/Digital-Literacy-bridge
    echo ================================================================
) else (
    echo ================================================================
    echo   Authentication required or failed.
    echo   If prompted, sign in with your GitHub account (karthikeyan745).
    echo ================================================================
)

pause
