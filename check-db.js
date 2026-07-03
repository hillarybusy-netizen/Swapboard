const fs = require('fs');
const dotenv = fs.readFileSync('.env.local', 'utf8');
const url = dotenv.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = dotenv.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

async function check() {
  const res = await fetch(`${url}/rest/v1/departments?select=*`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const depts = await res.json();
  console.log("Departments:", depts);

  const res2 = await fetch(`${url}/rest/v1/shifts?select=*,department:departments(name)&order=created_at.desc&limit=5`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const shifts = await res2.json();
  console.log("Recent shifts:", JSON.stringify(shifts, null, 2));
}

check();
