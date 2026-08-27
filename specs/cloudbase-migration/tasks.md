# CloudBase database migration task plan

## Completed

- [x] Convert the photography schema and queries to CloudBase MySQL.
- [x] Preserve Better Auth and photograph metadata during database migration.
- [x] Keep the public application and dashboard deployable on Vercel.
- [x] Remove CloudBase Static Hosting and media-gateway runtime dependencies.
- [x] Restore browser-direct uploads to Qiniu with server-signed tokens.
- [x] Restore Qiniu object deletion and storage health checks.
- [x] Document the active Vercel + CloudBase MySQL + Qiniu architecture.

## Deployment configuration

- [ ] Configure a CloudBase MySQL URL reachable from Vercel.
- [ ] Configure `QINIU_ACCESS_KEY`, `QINIU_SECRET_KEY`, `QINIU_BUCKET`, and
  `QINIU_PUBLIC_URL` in Vercel.
- [ ] Confirm the Qiniu bucket CORS policy permits uploads from the production
  and intended preview origins.
- [ ] Upload one disposable compressed photograph through the dashboard.
- [ ] Verify the database row points to `cdn.ytools.xyz` and the image accepts
  `imageView2` transformations.
- [ ] Delete the disposable photograph and verify both row and object removal.
