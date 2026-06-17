-- Enable realtime for tables
alter publication supabase_realtime add table shifts;
alter publication supabase_realtime add table swap_requests;
alter publication supabase_realtime add table audit_logs;
