# CloudBase database migration requirements

## Responsibilities

- Vercel shall host the public site, dashboard, authentication, and API routes.
- CloudBase shall provide MySQL only.
- Qiniu Kodo shall store and deliver web-ready photographs.
- CloudBase Static Hosting and CloudBase Run shall not be part of the active
  web or media delivery path.

## Security

- Database credentials, Qiniu AK/SK, and Better Auth secrets are server-only.
- A signed Qiniu upload token shall target one generated object key, expire
  quickly, reject unsupported MIME types, and enforce the compressed size cap.
- The browser shall never receive permanent storage credentials.
- Object deletion shall only run for URLs on the configured Qiniu public
  origin and under the `photos/` prefix.

## Data integrity

- MySQL IDs, relationships, visibility, favorite state, EXIF, and location data
  must survive the database migration.
- Uploading an object and creating its database row remain separate observable
  operations so a failed database write can be diagnosed and cleaned up.
- Removing a photo row should attempt Qiniu object deletion without allowing a
  storage outage to corrupt relational cleanup.

## Operations

- Vercel must receive `DATABASE_URL`, Better Auth variables, and `QINIU_*`
  variables in the intended Preview and Production environments.
- `p.yueyong.fun` points to Vercel; `cdn.ytools.xyz` points to Qiniu.
- Health endpoints report database and Qiniu reachability independently.
