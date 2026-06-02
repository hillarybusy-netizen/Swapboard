-- Create "logos" bucket
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- Allow public read access
create policy "Logos are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'logos' );

-- Allow authenticated users to upload logos
create policy "Authenticated users can upload logos"
  on storage.objects for insert
  with check ( bucket_id = 'logos' and auth.role() = 'authenticated' );

-- Allow authenticated users to update logos
create policy "Authenticated users can update logos"
  on storage.objects for update
  using ( bucket_id = 'logos' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete logos
create policy "Authenticated users can delete logos"
  on storage.objects for delete
  using ( bucket_id = 'logos' and auth.role() = 'authenticated' );
