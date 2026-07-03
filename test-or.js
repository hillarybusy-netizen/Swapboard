const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const url = dotenv.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = dotenv.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(url, key);

async function check() {
  const orgId = "1f670560-4750-4f00-b36a-615deec03d12";
  const deptId = "218db2a7-b044-4a89-b545-d2bb01ec6fe5"; // a specific department ID
  
  const { data, error } = await supabase
    .from("shifts")
    .select("*")
    .is("assigned_to", null)
    .eq("status", "not_started")
    .is("deleted_at", null)
    .eq("organization_id", orgId)
    .or(`department_id.eq.${deptId},department_id.is.null`);
    
  console.log("With .or:", data ? data.length : error);

  const { data: data2 } = await supabase
    .from("shifts")
    .select("*")
    .is("assigned_to", null)
    .eq("status", "not_started")
    .is("deleted_at", null)
    .eq("organization_id", orgId)

  console.log("Without .or:", data2 ? data2.length : "error");
}

check();
