@echo off
echo ========================================================
echo  Real Estate Agent - Daily Automated Cron Scheduler
echo ========================================================
echo Running local cron scheduler at 08:35 AM KST...
node --env-file=.env.local scripts/start_local_cron.js
pause
