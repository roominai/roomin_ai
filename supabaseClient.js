// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jyxkboiztqnrtorwkowp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eGtib2l6dHFucnRvcndrb3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzAxODAsImV4cCI6MjA2MDk0NjE4MH0.B3uu6HayJJu7OtX13UMHSKh3mQJaxqCsFD8Yvtc5zYY';

export const supabase = createClient(supabaseUrl, supabaseKey);
