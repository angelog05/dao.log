@echo off
cd /d F:\Projects\personal\dao-log

REM Eliminar bat scripts temporales
del /f /q commit-fix.bat
del /f /q commit-progress.bat
del /f /q commit-docs.bat
del /f /q commit-logs.bat

REM Stage todo: archivos nuevos, modificados y eliminados
git add -A

git commit -m "feat(api): add Morgan HTTP logging and business event logger

- Add morgan middleware for HTTP request logging (method, url, status, size, ms)
- Add src/lib/logger.js with timestamp-based info/warn/error levels
- Add business event logs on all routes: listed, fetched, created, updated, deleted
- Add auth failure logging with IP in auth.js middleware
- Log DB driver on startup
- Clean up temporary .bat scripts"

git push origin main
echo Done.
