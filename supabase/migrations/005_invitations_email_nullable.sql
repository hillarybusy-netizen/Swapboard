-- Allow invitations without email for manual links
alter table invitations alter column email drop not null;
