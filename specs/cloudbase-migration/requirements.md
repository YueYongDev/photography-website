# CloudBase migration requirements

## Problem

The photography website currently runs its Next.js application on Vercel,
stores relational data in Supabase PostgreSQL, and stores photographs in
Cloudflare R2. Requests from mainland China experience slow public-page,
authentication, and dashboard response times. The system should reuse the
existing CloudBase environment `ytools-d8gboj3ce7caccb14` and its trial quota
while keeping the existing WealthView resources logically isolated.

## Scope

The migration covers:

- Next.js 16 App Router runtime and tRPC route handlers.
- PostgreSQL business data and Better Auth tables.
- Better Auth login and session continuity.
- Photograph object storage, upload, deletion, and public delivery.
- Existing public and Studio routes, including Travel.
- Deployment configuration, health checks, observability, rollback, and
  performance acceptance tests.

## User stories

1. As a visitor in mainland China, I want public pages to render quickly so
   that the site feels responsive even before photographs finish loading.
2. As the site administrator, I want sign-in and Studio pages to respond
   quickly so that managing photos and posts is practical.
3. As the site owner, I want the migration to stay within an explicitly
   approved monthly budget and never create surprise charges.
4. As the site owner, I want the photography website to share the existing
   CloudBase environment without changing the finance application's data or
   resources.
5. As the site owner, I want a tested rollback path so that the live site can
   return to Vercel, Supabase, and R2 if the new stack fails.

## Functional requirements

### R1. Shared-environment isolation

- The migration shall target `ytools-d8gboj3ce7caccb14` as explicitly approved
  by the site owner.
- Photography database tables, services, functions, storage paths, and other
  mutable resources shall use a `photo_site_` namespace unless a platform
  constraint requires another documented prefix.
- The migration shall not modify or delete existing `wv_*`, `sys_*`,
  `relation_data_*`, or other WealthView collections and resources.
- Before each shared-environment write, the migration shall check for a name
  collision and shall stop rather than overwrite an unexpected resource.

### R2. Cost control

- Before any paid resource is created, the migration shall show the exact
  package/resource configuration and known recurring price to the user.
- When a CloudBase operation is classified as paid, the migration shall wait
  for explicit confirmation before submitting it.
- The migration shall keep automatic overage/pay-as-you-go disabled unless the
  user explicitly approves it.
- While validating the target stack, CloudBase Run shall use scale-to-zero
  where possible; a minimum warm instance may be enabled only after the user
  accepts the latency/cost trade-off.

### R3. Runtime migration

- When the target runtime is prepared, the system shall run the existing
  Next.js App Router application as a stateless CloudBase Run container in the
  approved `ytools` environment.
- The container shall listen on the platform-provided `PORT` on `0.0.0.0`.
- The deployment shall preserve SSR, route handlers, tRPC, streaming behavior,
  static Journey assets, and custom-domain routing.
- The deployment shall expose a health endpoint that distinguishes process
  health from database connectivity.

### R4. Database migration

- The target shall use the existing READY CloudBase MySQL 8.0 instance
  `cynosdbmysql-bdjuv0ug`, whose default schema is currently empty.
- PostgreSQL UUID values, visibility enums, timestamps, indexes, uniqueness,
  and foreign-key semantics shall be preserved in MySQL-compatible form.
- PostgreSQL arrays shall be represented as typed JSON arrays. PostgreSQL-only
  expressions and `RETURNING` calls shall be replaced with MySQL-compatible
  queries.
- Physical table names shall use the `photo_site_` prefix while the Drizzle
  schema exports retain the model names expected by Better Auth.
- When data is copied, the migration shall preserve the current Better Auth
  `user`, `account`, `session`, and `verification` data and the existing
  `BETTER_AUTH_SECRET`, so credentials and valid sessions can continue to work.
- Before cutover, source and target row counts, constraints, and representative
  checksums shall match.
- Source Supabase data shall remain intact throughout the rollback window.

### R5. Authentication continuity

- When the production domain is switched, existing users shall either retain
  valid Better Auth credentials and sessions or receive an explicitly tested
  re-login path.
- Authentication secrets shall be supplied through deployment secrets or
  environment variables and shall not be committed to the repository.
- Protected tRPC procedures shall continue to reject unauthenticated access.

### R6. Photograph storage migration

- When photographs are copied from the authoritative legacy CDN, target objects
  shall use deterministic keys and be verified by size and checksum where
  supported.
- Public photograph URLs shall remain compatible with existing database rows,
  preferably by preserving `cdn.yueyong.fun` and switching its origin.
- Upload and delete operations shall be authorized server-side and shall not
  expose permanent storage credentials to the browser.
- Source R2 objects shall remain intact throughout the rollback window.

### R7. Cutover and rollback

- Before DNS changes, the complete site shall pass tests on a staging URL.
- When the final cutover begins, administrator writes shall be paused before
  the final database and storage delta sync.
- If critical smoke tests fail, DNS and application configuration shall be
  restorable to Vercel, Supabase, and R2 without target-to-source data repair.
- Source services shall remain available for at least seven days after a
  successful cutover unless the user approves earlier removal.

### R8. Performance acceptance

- Under an agreed mainland-China test location, when a cached public page is
  requested, the target p75 TTFB shall be at most 700 ms.
- When the administrator submits valid credentials, useful Dashboard content
  shall appear within 2 seconds under the agreed test profile.
- When the Travel page loads, its archive structure and primary copy shall be
  present in the initial server response rather than waiting for a client-side
  data waterfall.
- Performance shall be measured before and after migration with the same
  browser, network profile, and cache conditions.

## Security requirements

- No Tencent Cloud API key, database password, Better Auth secret, storage
  secret, or third-party AI key shall be committed to source control.
- The hard-coded third-party AI key currently present in the photo procedure
  shall be removed and rotated before a production deployment.
- Production database access shall use a private VPC path when the selected
  architecture uses a TCP PostgreSQL connection.
- Storage and database access shall follow least privilege.

## Constraints and known facts

- `ytools-d8gboj3ce7caccb14` is a CloudBase trial environment with no
  PostgreSQL, but it has NoSQL and an existing READY CloudBase MySQL 8.0
  instance. The MySQL default schema currently contains no tables.
- The environment has 16 existing NoSQL collections, primarily `wv_*`; the
  photography migration does not need to touch them.
- The trial package expires on 2027-02-02, is not marked always-free, has
  overrun disabled, and currently reports normal usage. No paid package change
  is authorized by this specification.
- The source PostgreSQL data is small: 260 rows across eight tables. Public
  business data is about 237 KB as uncompressed JSON; protected auth data is
  expected to add only a small amount.
- Source row counts at discovery time are: photos 178, city sets 55, posts 1,
  categories 0, users 1, sessions 24, accounts 1, and verifications 0.
- Photograph binaries are stored in Cloudflare R2 rather than Supabase and must
  be inventoried separately before the storage cutover is estimated.
- Mainland custom-domain availability may depend on ICP filing status.

## Non-goals

- Migrating or changing WealthView data and behavior.
- Deleting or downgrading any source service during implementation.
- Rewriting the visual design completed for the public site and Travel archive.
- Introducing a multi-user CMS or new public registration flow.
- Enabling paid overage without explicit user approval.

## Confirmed decisions

1. Reuse `ytools-d8gboj3ce7caccb14` instead of buying a second environment.
2. Use the existing CloudBase MySQL instance rather than rewriting the site
   against NoSQL.
3. Export and migrate the small Supabase dataset with repeatable scripts.
4. Serve migrated photographs from CloudBase static hosting because the trial
   package cannot make the regular storage bucket public.

## Decisions still requiring confirmation before production cutover

1. Whether `p.yueyong.fun` has a valid mainland ICP filing.
2. Whether scale-to-zero cold starts are acceptable after production launch.
3. Whether the one unrecoverable legacy 404 photograph should be re-uploaded or
   its database row removed.
