@echo off
cd /d F:\Projects\personal\dao-log\packages\api

echo.
echo [1] POST /api/posts - crear primer post
curl -s -X POST http://localhost:3001/api/posts ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer dev-secret-123" ^
  -d "{\"title\":\"Ten Hours with OpenClaw\",\"content\":\"# Ten Hours with OpenClaw\n\nI didn't plan to spend ten hours on this.\n\nI sat down that Saturday morning with a simple goal: explore OpenClaw...\",\"excerpt\":\"I spent a full workday setting up OpenClaw and ended up building a custom prompt injection defense middleware from scratch.\",\"tags\":[\"openclaw\",\"agents\",\"security\"],\"date\":\"2026-03-01\"}"

echo.
echo.
echo [2] GET /api/posts - listar todos los posts
curl -s http://localhost:3001/api/posts

echo.
echo.
echo [3] GET /api/posts/:slug - leer post por slug
curl -s http://localhost:3001/api/posts/ten-hours-with-openclaw

echo.
