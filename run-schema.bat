@echo off
cd /d F:\Projects\personal\dao-log\packages\api
curl -s -X POST "https://mmtqjqxtqbuuelwpubbr.supabase.co/rest/v1/rpc/exec_sql" ^
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdHFqcXh0cWJ1dWVsd3B1YmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY3NDgwMiwiZXhwIjoyMDg4MjUwODAyfQ.JNBZFpMBFXA08VW6s95XJ9vWaYSOW4WY9pRFJAHst_s" ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdHFqcXh0cWJ1dWVsd3B1YmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY3NDgwMiwiZXhwIjoyMDg4MjUwODAyfQ.JNBZFpMBFXA08VW6s95XJ9vWaYSOW4WY9pRFJAHst_s" ^
  -H "Content-Type: application/json"
