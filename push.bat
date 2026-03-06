@echo off
cd /d F:\Projects\personal\dao-log
git init
git add .
git commit -m "feat: initial monorepo — API + Astro web + GitHub Actions deploy"
git branch -M main
git remote add origin https://github.com/angelog05/dao.log.git
git pull origin main --allow-unrelated-histories -X ours --no-edit
git push -u origin main
echo Done.
