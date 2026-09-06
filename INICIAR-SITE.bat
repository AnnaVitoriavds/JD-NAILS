@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ========================================
echo        JD NAILS - INICIANDO SITE
echo ========================================
echo.
node -v >nul 2>&1
if errorlevel 1 (
  echo ERRO: Node.js nao foi encontrado.
  echo Instale o Node.js e tente novamente.
  pause
  exit /b 1
)
echo Site:   http://localhost:3000
echo Admin:  http://localhost:3000/admin.html
echo Login:  jdnails
echo Senha:  jd2026
echo.
echo Para encerrar, pressione CTRL+C.
echo.
npm start
pause
