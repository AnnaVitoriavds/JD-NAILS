@echo off
chcp 65001 >nul
cd /d "%~dp0"
where code >nul 2>&1
if errorlevel 1 (
  echo O comando "code" nao foi encontrado.
  echo Abra o VS Code e escolha Arquivo ^> Abrir Pasta, selecionando esta pasta.
  pause
  exit /b 1
)
code .
