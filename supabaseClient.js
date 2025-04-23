// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jyxkboiztqnrtorwkowp.supabase.co';
const supabaseKey = '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';

export const supabase = createClient(supabaseUrl, supabaseKey);
