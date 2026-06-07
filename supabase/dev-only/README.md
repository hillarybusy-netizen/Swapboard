# Dev-only SQL scripts

**Never run these against production.** They delete data.

- `009_trash_migration.sql` — backs up then deletes all organizations and invitations
- `010_delete_last_10_users.sql` — deletes the last 10 auth users
