# CloudBase migration task plan

## 1. Discovery and secure export

- [x] Confirm `ytools-d8gboj3ce7caccb14` package, expiry, overrun status, and
  current resource usage.
- [x] Confirm MySQL 8.0 is READY, empty, private-only, and resolve its real VPC
  and subnet IDs.
- [x] Inventory Supabase row counts and business-data size.
- [x] Export all eight tables to a Git-ignored, permission-restricted snapshot
  with hashes.
- [x] Inventory the configured R2 bucket and the actual CDN URLs referenced by
  the database; record the source mismatch, reachable bytes, and one 404.

## 2. MySQL compatibility implementation

- [x] Convert Drizzle schemas from PostgreSQL to namespaced MySQL tables.
- [x] Replace the database client with a bounded `mysql2` pool.
- [x] Change Better Auth's Drizzle provider from `pg` to `mysql`.
- [x] Replace PostgreSQL-only `RETURNING`, upsert, array, date, and count SQL.
- [x] Add process and database health endpoints.
- [x] Remove the hard-coded AI-key fallback and document key rotation.

## 3. Target schema and data

- [x] Recheck that no `photo_site_*` tables exist.
- [x] Create all eight tables, constraints, and indexes with `_openid` columns
  required by the legacy CloudBase MySQL management model.
- [x] Import the secure snapshot in dependency order and normalize the 105 null
  photo update timestamps.
- [x] Create a least-privilege application database user for only the eight
  photography tables.
- [x] Verify counts, referential integrity, visibility totals, and checksums.

## 4. Local and staging verification

- [ ] Install/lock the MySQL driver and remove unused Supabase/PostgreSQL runtime
  dependencies after the rollback window decision.
- [x] Run TypeScript, formatting checks, production build, and CloudBase code
  review.
- [x] Add a production Dockerfile that listens on the injected `PORT`.
- [x] Deploy the VPC-attached `photo-site-web-direct` release candidate with
  PUBLIC-only ingress, secret environment variables, and scale-to-zero.
- [x] Verify CloudBase service detail, build logs, health endpoints, database
  connectivity, auth, and all primary routes.

## 5. Cutover

- [ ] Measure staging performance from the agreed mainland-China test profile.
- [x] Run the final idempotent export and prove the first/final snapshots are
  byte-for-byte identical before the URL cutover.
- [ ] Bind/switch `p.yueyong.fun` after confirming ICP/domain prerequisites.
- [ ] Run post-cutover smoke tests and watch error/latency metrics.
- [ ] Keep Vercel, Supabase, and R2 intact for at least seven days.

## 6. Storage phase

- [x] Copy the 176 reachable authoritative CDN objects to
  `photo-site/photos/` in CloudBase static hosting and verify size plus sampled
  SHA-256 values. Record the one source object that was already 404.
- [x] Transactionally switch 177 photo rows to CloudBase URLs while preserving
  all metadata, visibility/favorite totals, and cover references.
- [x] Exercise unauthorized access, authenticated upload, public read,
  checksum, delete, and source-object removal using disposable objects.
- [ ] Retire R2 only after the rollback window and explicit owner approval.
