# CloudBase database migration design

## Active architecture

```text
Browser
  |
  v
Vercel: Next.js public site, dashboard, Better Auth, tRPC
  |                                      |
  | server-side MySQL                    | short-lived upload token
  v                                      v
CloudBase MySQL                      Qiniu Kodo
  |                                      |
  `-- photo URLs and metadata             `-- web-ready photographs
```

CloudBase is the relational database provider only. It does not host the
application or photograph objects. Qiniu serves photographs through
`https://cdn.ytools.xyz`; Vercel serves the website and server functions.

## Database boundaries

- Photography tables keep the `photo_site_` prefix.
- Drizzle uses the MySQL driver and a bounded connection pool.
- `DATABASE_URL` is server-only and must be reachable from the Vercel runtime.
- Better Auth sessions and credentials remain in CloudBase MySQL.
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

`scripts/cloudbase/` retains only the database export, schema, and import tools.
The abandoned CloudBase application-hosting, static-hosting, media-gateway,
and photo-URL migration artifacts have been removed.
