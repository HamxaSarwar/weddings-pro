import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qwathrlbfbsbvymxzbqo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YXRocmxiZmJzYnZ5bXh6YnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTU5MzYsImV4cCI6MjA3MDc3MTkzNn0.6E1WC_c8Oz6sw4tm_pG8WnMLw-e9o-Nt7rqqQiOTUWc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)