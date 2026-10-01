# CloudBase PostgreSQL migration — 2026-10-01

- [x] Verify the new `yueyong-photo` environment and shared-cluster restrictions.
- [x] Back up the source MySQL data and production configuration privately.
- [x] Apply versioned PostgreSQL schema, security and album-maintenance migrations.
- [x] Import all eight tables and compare every field against a fresh source export.
- [x] Preserve Better Auth accounts, password hashes, session IDs and signing secret.
- [x] Replace MySQL runtime access with the server-only CloudBase HTTPS SQL adapter.
- [x] Preserve Qiniu image URLs, direct uploads and object deletion.
- [x] Verify dates, search, dashboard SQL, row mapping and atomic album writes.
- [x] Pass TypeScript checks, production build and lint of changed application code.
- [x] Verify password login and a disposable upload/edit/delete through the browser.
- [x] Remove the temporary account, sessions, photo row and Qiniu object.
- [x] Configure production CloudBase variables and promote the tested deployment.

See [the cutover record](./postgres-cutover.md) for production verification,
backup locations, renewal information and rollback requirements.
