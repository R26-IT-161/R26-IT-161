@echo off
REM Start backend and frontend servers

REM Start backend in a new window
cd backend
call venv\Scripts\activate.bat
start cmd /k python app.py

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Start frontend in a new window
cd ..\frontend
start cmd /k npm run dev

echo.
echo Backend and Frontend servers started!
echo Backend: running in separate window
echo Frontend: running in separate window
pause
