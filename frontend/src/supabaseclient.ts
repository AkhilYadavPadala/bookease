import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mjltqdzxrpfqzsyhufid.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbHRxZHp4cnBmcXpzeWh1ZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NzIwNDcsImV4cCI6MjA3NTU0ODA0N30.ss0z0w4BHcagztjU0JRfrr_rBHQLnwBHhUEtPc7TcNk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
