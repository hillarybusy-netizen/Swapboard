import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // use service role to bypass RLS for debugging
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkShifts() {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Recent shifts:");
    console.table(data.map(s => ({
      title: s.title,
      status: s.status,
      assigned_to: s.assigned_to,
      department_id: s.department_id,
      deleted_at: s.deleted_at
    })));
  }
}

checkShifts();
