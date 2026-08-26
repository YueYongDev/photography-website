# CloudBase migration design

## Outcome

Move the photography site's application database and runtime from
Vercel/Supabase to the existing CloudBase trial environment without changing
the WealthView application. Keep the current visual/performance work, Better
Auth credentials, and public URLs intact.

## Target architecture

```text
Browser
  |
  | HTTPS (p.yueyong.fun)
  v
CloudBase Run release candidate: photo-site-web-direct
  |-- Next.js 16 App Router + tRPC
  |-- Better Auth (same secret and cookie domain)
  |-- Drizzle ORM + mysql2 pool
  |
  | private TCP, VPC vpc-c1gqmpya / subnet-16im3eqj
  v
CloudBase MySQL 8.0: cynosdbmysql-bdjuv0ug
  |-- photo_site_user
  |-- photo_site_account
  |-- photo_site_session
  |-- photo_site_verification
  |-- photo_site_photos
  |-- photo_site_city_sets
  |-- photo_site_posts
  `-- photo_site_categories

CloudBase HTTP Function: photo-site-media (shared-secret internal write gateway)
  |
  v
CloudBase static hosting: photo-site/photos/
```

The MySQL cluster is already READY, has no tables in its default schema, and
has private address `172.17.0.16:3306`. The CloudBase Run service must attach to
the real VPC/subnet shown above; public ingress and private database egress are
separate settings.

## Why MySQL instead of NoSQL

- `ytools` has no PostgreSQL but already includes an empty MySQL 8.0 instance.
- Drizzle and Better Auth both support MySQL, so credentials and sessions can
  be preserved instead of replacing the authentication system.
- The source contains relational constraints and indexed query patterns that
  would require manual denormalization and consistency logic in NoSQL.
- The data is only 260 rows, making a deterministic PostgreSQL-to-MySQL
  conversion safer than an application-wide persistence rewrite.

## Shared-environment boundaries

- All photography tables and runtime resources use the `photo_site_` prefix.
- Existing NoSQL collections (`wv_*`, `sys_*`, and `relation_data_*`) are never
  read by application code and are not mutated by migration scripts.
- The application receives a dedicated MySQL user with CRUD privileges only on
  the eight photography tables. Schema management stays with the migration
  tooling.
- The production candidate is `photo-site-web-direct`; this is the service whose
  VPC attachment remained intact across image releases. It does not reuse an
  existing finance function or application service.

## Data mapping

| PostgreSQL source | MySQL target | Rows | Compatibility notes |
| --- | --- | ---: | --- |
| `user` | `photo_site_user` | 1 | Better Auth model export remains `user` |
| `account` | `photo_site_account` | 1 | Password hash is copied byte-for-byte |
| `session` | `photo_site_session` | 24 | Existing token and expiry values retained |
| `verification` | `photo_site_verification` | 0 | Empty table still created |
| `photos` | `photo_site_photos` | 178 | UUID stored as `varchar(36)`; enum becomes MySQL enum |
| `city_sets` | `photo_site_city_sets` | 55 | Cover-photo FK and country/city uniqueness retained |
| `posts` | `photo_site_posts` | 1 | `tags text[]` becomes a JSON string array |
| `categories` | `photo_site_categories` | 0 | Post FK retained |

General conversions:

- PostgreSQL UUIDs become `varchar(36)` without changing their values.
- Better Auth text IDs and tokens use bounded `varchar` columns sized above
  the current maximums; large OAuth tokens and password hashes remain `text`.
- Timestamps become `datetime(3)` and are interpreted as UTC by the MySQL
  connection.
- Booleans become `boolean`/`tinyint(1)`.
- Floating-point photo metadata becomes `double`.
- PostgreSQL `RETURNING` is replaced by a write followed by a primary-key
  select; upserts use MySQL duplicate-key semantics.
- PostgreSQL `EXTRACT` and cast expressions use MySQL `YEAR()` and integer
  counts.

### Source repair recorded during import

The source has 105 `photos.updated_at = null` rows even though the application
schema declares the field non-null. The import normalizes only those values to
the same row's `created_at`, preserving deterministic pagination and allowing a
non-null target constraint. The migration manifest records this transform.

## Export and import

1. Export all eight Supabase tables through the service-role REST API into a
   mode-0700 `.migration/` directory. Individual JSON files are mode 0600 and
   contain secrets, so the directory is ignored by Git.
2. Record per-table row counts, byte sizes, and SHA-256 hashes in
   `manifest.json` without storing any API key.
3. Initialize the eight namespaced MySQL tables and indexes in dependency
   order.
4. Transform snake_case REST rows to the target schema, normalize the 105 null
   photo timestamps, and insert in bounded batches.
5. Verify exact counts, FK orphans, unique keys, public/private/favorite photo
   totals, and stable per-table canonical checksums.
6. Re-run a final delta export/import during cutover after Studio writes are
   paused. Upserts make the operation repeatable.

## Runtime database integration

- Replace `drizzle-orm/postgres-js` and `postgres` with
  `drizzle-orm/mysql2` and `mysql2`.
- Use one module-level MySQL pool per CloudBase Run instance, a low connection
  limit, UTC timezone, short connection timeout, and no browser exposure.
- Set `DATABASE_URL` only in CloudBase Run environment variables. It points to
  the private endpoint and uses the dedicated application user.
- Add `/api/health` for process health and `/api/health/database` for a bounded
  `SELECT 1` readiness check.
- Configure `VpcConf` with `vpc-c1gqmpya` and `subnet-16im3eqj` on the first
  deployment and verify it from CloudBase service detail afterward.

## Authentication continuity

- Keep Better Auth and set the adapter provider to `mysql`.
- Preserve the four Better Auth tables, password hash, account ID, and the
  production `BETTER_AUTH_SECRET`.
- Keep the production origin/domain in Better Auth configuration. Existing
  signed cookie-cache entries remain verifiable; database-backed sessions are
  present in MySQL.
- No CloudBase Auth provider is enabled or changed in this migration.

## Storage migration

The database stores photograph metadata and CDN URLs; image binaries are not in
Supabase. The 178 rows contain 177 unique `cdn.ytools.xyz` URLs. A read-only
HEAD inventory found 176 reachable originals totalling 606,825,247 bytes
(0.565 GiB) and one 404.

The legacy R2 credentials present during discovery pointed to
`cdn.yueyong.fun` and a 59-object, 468.52 MiB bucket, but only one of its keys
matches the 177 database URLs. It is therefore not safe to treat that bucket as
the authoritative source. The migration downloaded the 176 reachable originals
from their actual public URLs, verified 606,825,247 bytes, and uploaded them to
CloudBase static hosting under `photo-site/photos/`. Three representative
small/medium/large objects were downloaded again and matched SHA-256 exactly.

One source URL (`DSC09911-1757431030018.JPG`) was already HTTP 404 and had no
matching R2/local copy, so that single database row remains on the old URL for
manual recovery. A transactional cutover updated the other 177 rows. Before
and after totals remained 178 photos, 174 public, 4 private, and 106 favorites,
with zero broken cover references.

The trial plan does not allow changing the regular CloudBase storage bucket's
ACL. Those private duplicate objects remain untouched pending explicit deletion
approval. Public delivery therefore uses static hosting. New writes pass
through the protected Next.js upload route and a narrow HTTP function using
temporary runtime credentials; browsers never receive Tencent Cloud keys.

## Security

- Migration exports, password hashes, session tokens, MySQL passwords, and API
  keys are never committed or printed.
- The MySQL application principal receives no access to non-photography tables
  or schema-management privileges.
- Database traffic stays on the Shanghai VPC path; the database public endpoint
  remains disabled.
- Public tRPC procedures must filter `visibility = 'public'`; private photo and
  dashboard procedures remain protected server-side.
- The existing hard-coded third-party AI key fallback must be removed and the
  key rotated before production deployment.

## Cutover and rollback

1. Deploy to a CloudBase staging URL while Vercel/Supabase/R2 remain live.
2. Run read, login, upload-metadata, edit, and delete-metadata smoke tests on
   staging; test storage deletion against a disposable object only.
3. Pause Studio writes, perform the final idempotent import, and compare source
   and target manifests.
4. Switch `p.yueyong.fun` only after the staging checks pass.
5. If smoke tests fail, restore DNS to Vercel. Supabase and R2 remain untouched,
   so rollback requires no reverse data migration before new writes are enabled.

## Acceptance checks

- Source and target each contain 260 rows with the expected per-table counts.
- The target has zero missing user, category, and cover-photo references.
- The target retains 174 public photos, 4 private photos, 106 favorites, and
  city-set photo counts summing to 170.
- Existing administrator credentials can sign in and protected routes reject
  anonymous requests.
- Home, Travel, Discover, Blog, Dashboard, Photos, Posts, and Profile render on
  the staging URL without Supabase network calls.
- A mainland test shows cached public p75 TTFB at or below 700 ms and useful
  dashboard content within 2 seconds under the agreed test profile.
