import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucsoafldyzseqikqruza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjc29hZmxkeXpzZXFpa3FydXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjE5NDgsImV4cCI6MjA2NTk5Nzk0OH0.bn8CaGXUXx-h7B7ijo9S_CkfQAoz3rKxBVgqT6ywtbg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);