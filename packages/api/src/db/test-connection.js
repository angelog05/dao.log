import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mmtqjqxtqbuuelwpubbr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdHFqcXh0cWJ1dWVsd3B1YmJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY3NDgwMiwiZXhwIjoyMDg4MjUwODAyfQ.JNBZFpMBFXA08VW6s95XJ9vWaYSOW4WY9pRFJAHst_s'
)

// Test connection by trying to query the posts table
const { data, error } = await supabase
  .from('posts')
  .select('count')
  .limit(1)

if (error) {
  if (error.message.includes('relation "posts" does not exist')) {
    console.log('❌ Table "posts" does not exist yet.')
    console.log('👉 Go to: https://mmtqjqxtqbuuelwpubbr.supabase.co')
    console.log('   SQL Editor → New query → paste schema.sql → Run')
  } else {
    console.log('❌ Connection error:', error.message)
  }
} else {
  console.log('✅ Connected to Supabase! Table "posts" exists and is ready.')
}
