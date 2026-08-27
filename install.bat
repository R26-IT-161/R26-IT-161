@echo off
echo ==========================================
echo Installing backend dependencies...
echo ==========================================
cd backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend installation failed!
    goto end
)
cd ..

echo.
echo ==========================================
echo Installing frontend dependencies...
echo ==========================================
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend installation failed!
    goto end
)
cd ..

echo.
echo Installation complete successfully!

:end
pause