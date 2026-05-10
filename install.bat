@echo off
REM Install backend and frontend dependencies

cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt

cd ..\frontend
call npm i

echo.
echo Installation complete!
pause
