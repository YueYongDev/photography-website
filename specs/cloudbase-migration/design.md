# CloudBase database migration design

## Active architecture

```text
Browser
  |
  v
Vercel: Next.js public site, dashboard, Better Auth, tRPC
  |                                      |
  | server-side HTTPS SQL                    | short-lived upload token
  v                                      v
CloudBase PostgreSQL                      Qiniu Kodo
  |                                      |
  `-- photo URLs and metadata             `-- web-ready photographs
```

CloudBase is the relational database provider only. It does not host the
application or photograph objects. Qiniu serves photographs through
`https://cdn.ytools.xyz`; Vercel serves the website and server functions.

## Database boundaries

- Photography tables keep the `photo_site_` prefix.
- Drizzle uses `pg-proxy` and CloudBase `/v1/rdb/exec-pgsql`.
- `CLOUDBASE_ENV_ID` and `CLOUDBASE_API_KEY` are server-only; the free shared
  cluster has no TCP endpoint.
- RLS and revoked browser-role grants block direct access to business and
  Better Auth tables; existing protected Next.js procedures enforce app access.
- JSON arrays built inside PostgreSQL retain SELECT column order over HTTPS.
- Photo writes trigger atomic album reconciliation. Cover foreign keys are
  checked at commit, after cover replacement. UTC defaults compensate for the
  gateway session timezone (PRC).
- Interactive client-side transactions are unsupported; multi-table changes
  use database functions/triggers within one SQL call.
- Better Auth sessions and credentials remain in CloudBase PostgreSQL.
- Photograph rows store public URLs, dimensions, blur data, EXIF, location,
  visibility, and editorial copy. They never contain image binaries.

## Media boundaries

- The dashboard reads EXIF from the selected original locally in the browser.
- The browser creates a compressed web derivative before any network request.
- Vercel signs an exact, short-lived Qiniu object key; AK/SK stay server-only.
- The compressed derivative uploads directly from the browser to Qiniu.
- Camera RAW files and full-resolution originals remain outside the website in
  the photographer's separate archival and backup system.

## Migration tooling retained

`scripts/cloudbase/` retains the historical migration tools plus MySQL export,
atomic PostgreSQL import generation, field-by-field verification, and runtime
regression checks. Versioned PG schema changes live in `cloudbase/migrations/`.
The abandoned CloudBase application-hosting, static-hosting, media-gateway,
and photo-URL migration artifacts have been removed.
