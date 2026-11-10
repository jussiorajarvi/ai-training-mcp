import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || 'example-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
