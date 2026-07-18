@echo off
echo =======================================================
echo            OdooHack2026 Setup & Launch Script
echo =======================================================
echo.

echo [1/5] Installing Backend dependencies...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Backend dependency installation failed.
    pause
    exit /b %errorlevel%
)
echo.

echo [2/5] Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma Client generation failed.
    pause
    exit /b %errorlevel%
)
echo.

echo [3/5] Setting up database and running seed...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Database sync failed. Make sure PostgreSQL is running on port 5432.
    pause
    exit /b %errorlevel%
)
call npm run db:seed
echo.

echo [4/5] Installing Frontend dependencies...
cd ../Frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Frontend dependency installation failed.
    pause
    exit /b %errorlevel%
)
echo.

echo [5/5] Launching Backend and Frontend servers...
cd ..
start cmd /k "title Backend Server && cd Backend && npm run dev"
start cmd /k "title Frontend Server && cd Frontend && npm run dev"

echo.
echo =======================================================
echo   Success! OdooHack2026 is setting up and starting!
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:5000
echo =======================================================
pause
