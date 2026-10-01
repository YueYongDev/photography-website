# CloudBase PostgreSQL cutover — 2026-10-01

## Destination and access

- Old: `ytools-d8gboj3ce7caccb14`, MySQL, still readable during migration.
- New: `yueyong-photo-d6gm6308c8838e9e7`, PostgreSQL 17.11,
  shared instance `postgres-4zmbfaju`.
- Console plan: free trial (`baas_trial`), expires 2027-04-01. It is not an
  unlimited permanent free tier; the console offers a free-renewal task flow.
- This shared cluster cannot enable a public TCP connection. The server calls
  the documented `POST /v1/rdb/exec-pgsql` API with parameter binding and an
  environment-scoped API key. Neither this key nor a generic SQL route is
  exposed to the browser. CloudBase Auth is not used for website login.
- Preserve the existing `BETTER_AUTH_SECRET`, site URL and Qiniu settings.
  Runtime variables are `CLOUDBASE_ENV_ID` and `CLOUDBASE_API_KEY`; the old
  `DATABASE_URL`/pool settings are not consumed by the new application.

## Backup and import

Private artifacts are in ignored `.migration/cloudbase-pg-20261001/` (directory
mode 0700; credential/data files 0600). Never commit that directory. The original
local and Vercel production configurations are backed up alongside a consistent
MySQL snapshot. It includes password hashes and session tokens.

Source snapshot: 203 photos, 71 city albums, 1 post, 1 user, 1 credential account,
27 sessions, 0 categories and 0 verification records. IDs and image URLs remain
unchanged. Photographs remain in Qiniu; no existing image objects are migrated.

`migrate-mysql-to-pg.mjs` supports:

- `export <snapshot.json>`: consistent read-only MySQL snapshot, refuses to
  overwrite an existing backup. Select source configuration via
  `MIGRATION_ENV_FILE`.
- `build-import <snapshot.json> <import.sql>`: an atomic import which refuses
  nonempty destinations. Apply this private SQL with CloudBase MCP
  `managePgDatabase(action=execute, envId=..., confirm=true)`.
- `verify <snapshot.json>`: compare every field of every table in PostgreSQL,
  normalizing only timestamp representation, JSON and MySQL boolean encoding.

Schema changes use the versioned SQL in `cloudbase/migrations/`, applied through
`managePgDatabase(action=applyMigration)` with the matching version/name, followed
by task status and migration history verification. Historical Supabase SQL under
`src/db/migrations` is not this database's migration history. `db:generate` only
produces reviewable Drizzle SQL in `src/db/pg-migrations`; it does not apply it.

## Compatibility requirements

- Drizzle receives positional row arrays assembled with `json_each(row_to_json())`
  in PostgreSQL. Gateway JSON object key order cannot be trusted.
- Non-returning writes append `RETURNING 1`, preserving Better Auth affected-row
  counts for session revocation. Queries use bound parameters, never SQL string
  interpolation of input values. Requests are not retried automatically.
- No interactive transaction may span independent HTTP requests. Photo writes
  reconcile city albums in database triggers within the same transaction.
  An advisory lock serializes photo/album edits; the cover FK is checked at
  transaction end. Japan/Taiwan use the region as the album place.
- All business tables enable RLS and revoke access from CloudBase's browser
  roles. The existing authenticated Next.js/tRPC boundary controls mutations.
  Database functions are not executable by public/anonymous/authenticated roles.
- The gateway's database session timezone is PRC. Timestamp-without-time-zone
  defaults explicitly use UTC, matching Drizzle and the preserved source values.
- Dashboard year aggregation uses PostgreSQL intervals with capture timezone
  offsets. Photo searches use `ILIKE` to preserve case-insensitive search.

## Validation and cutover

Before switching production:

1. Run `npm run db:verify -- --write-test`. This verifies positional mapping,
   relations, dates/booleans, real writes, album moves, cover replacement,
   Japanese region selection, affected rows and rollback. Temporary photos are
   removed without touching their shared Qiniu URL.
2. Run typecheck/build and browser checks for public pages and the Studio,
   actual password login, temporary photo upload, editing and deletion.
3. Remove temporary accounts, sessions, records and uploaded media. Export a
   fresh source snapshot and compare the target again before promoting.
4. Build the Vercel production candidate without assigning the live domain,
   verify the candidate, then promote it and recheck `p.yueyong.fun` and health
   endpoints. Preserve the prior deployment URL for rollback.

## Completed production verification

The tested deployment `dpl_EHeMorN5swGWAQSwxFajLbvQrnnC`
(`photography-website-lr1ozzr96-yueyongs-projects.vercel.app`) was promoted to
`https://p.yueyong.fun` on 2026-10-01. Production database and Qiniu health
endpoints returned HTTP 200 / reachable. Work rendered 165 public photographs,
63 places and years 2020–2026; places, map and the Georgia journey returned
HTTP 200 without application errors.

The candidate passed an actual browser password login, direct Qiniu upload,
metadata edit/reopen, and deletion. The test photo row was absent and its
Qiniu transformation URL returned 404 after deletion. The temporary account
and all of its sessions were removed. All eight tables then matched every
field of `mysql-final-cutover.json`, exported immediately before promotion
(SHA-256 `e51d7b6bc78884ba5c62832fbf74f05da75a5be374bf936e9306f2d26d0c79c5`).

TypeScript, the production build, changed-code ESLint checks and the real
PostgreSQL regression suite passed. The repository's legacy `next lint`
command is incompatible with its current Next.js version; verification used
ESLint directly with equivalent Next.js/TypeScript configuration. No runtime
error logs were returned for the tested candidate.

The previous deployment is
`photography-website-kk1o717mj-yueyongs-projects.vercel.app`
(`dpl_EDeVa9XtrxaQj3Tyy4bWDyed3ouN`). The source resource and existing Qiniu
photographs were left intact. Sensitive backups remain local and ignored.

## Rollback

Keep the old MySQL resource and credentials intact during acceptance. The old
application expects MySQL; the new application expects the HTTPS PG settings.
Rollback must restore the matching application **and** environment settings,
using the saved Vercel configuration and the previous deployment. After accepting
new writes in PG, export and reconcile those writes before reverting to MySQL;
a domain rollback alone would discard their visibility. Never destroy the old
resource or remove the private backups as part of this migration.
