# Photography Blog 📸

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ECarry/photography-website)

A modern, open-source photography blog platform built with the latest web technologies. Share your photography journey with style and efficiency.

## ✨ Features

- 📱 Responsive design for all devices
- 🖼️ Automatic EXIF data extraction from photos
- 🔐 Secure authentication with Better Auth
- ☁️ Qiniu Kodo object storage with browser-direct uploads
- 🎨 Beautiful UI with Shadcn/ui components
- 🚀 Lightning-fast performance
- 📍 Location-based photo organization
- 🌐 SEO optimized
- 🎯 API powered by tRPC

## 📸 Screenshots

<img src="https://github.com/ECarry/photography-website/blob/main/docs/screen/home.png?raw=true" alt="page">
<img src="https://github.com/ECarry/photography-website/blob/main/docs/screen/travel.png?raw=true" alt="page">
<img src="https://github.com/ECarry/photography-website/blob/main/docs/screen/discover.png?raw=true" alt="page">
<img src="https://github.com/ECarry/photography-website/blob/main/docs/screen/about.png?raw=true" alt="page">
<img src="https://github.com/ECarry/photography-website/blob/main/docs/screen/photograph.png?raw=true" alt="page">

## 🌈 Support Theme

- 🌈 Dark
- 🌈 Light

<img src="https://github.com/ECarry/photography-website/blob/main/screen/theme.png?raw=true" alt="page">

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/)
- **Database:** CloudBase MySQL 8.0
- **ORM:** [Drizzle](https://orm.drizzle.team/)
- **Authentication:** [Better Auth](https://better-auth.com/)
- **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
- **API Layer:** [tRPC](https://trpc.io/)
- **Storage:** Qiniu Kodo, delivered through `cdn.ytools.xyz`
- **Deployment:** Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- bun (recommended) or npm
- A CloudBase MySQL database reachable from Vercel
- A Qiniu Kodo bucket and CDN domain
- [Mapbox Account](https://console.mapbox.com/)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# CloudBase MySQL connection URL reachable from Vercel
DATABASE_URL=mysql://photo_site_app:password@database-host:3306/database
DATABASE_POOL_SIZE=4

# Optional database migration tooling
CLOUDBASE_ENV_ID=ytools-d8gboj3ce7caccb14
CLOUDBASE_REGION=ap-shanghai

# Qiniu Kodo photo storage
QINIU_ACCESS_KEY=
QINIU_SECRET_KEY=
QINIU_BUCKET=
QINIU_PUBLIC_URL=https://cdn.ytools.xyz

# Auth
# You can generate a random secret using `openssl rand -base64 32`
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000 #Base URL of your app
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000

NEXT_PUBLIC_APP_URL='http://localhost:3000'

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

### Production architecture

The Next.js application, dashboard, authentication routes, and tRPC API run on
Vercel. CloudBase is used only for MySQL. Browser uploads are compressed before
the server boundary, receive a short-lived upload token from Vercel, and go
directly to Qiniu Kodo. The database stores the resulting public URL and photo
metadata; it never stores image binaries.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/photography-website.git
cd photography-website
```

2. Install dependencies:

```bash
bun install
```

3. Set up the database:

```bash
bun db:push
```

4. Start the development server:

```bash
bun run dev
```

### Initial User Registration

When you first deploy the application, you'll need to create an admin user. You can do this by visiting:

```
http://localhost:3000/sign-up
```

Note: After the first admin user is created, the `/sign-up` route will be disabled for security purposes. Any subsequent attempts to access the sign-up page will automatically redirect to the sign-in page (`/sign-in`).

### Qiniu image delivery

`image-loader.ts` uses Qiniu's `imageView2` transformation on
`cdn.ytools.xyz`, so the bucket only needs one web-ready master per photograph.
Camera RAW files and full-resolution originals remain in the photographer's
separate archive and are not uploaded by the dashboard.

Visit `http://localhost:3000` to see your application.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 💖 Support

If you find this project helpful, please give it a ⭐️ on GitHub!

## ⭐️ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=ECarry/photography-website&type=Date)](https://star-history.com/#ECarry/photography-website&Date)

## 📝 Changelog

- 2025-02-13: tRPC instead of Hono.js
- 2025-01-12: Better Auth instead of Next Auth

## 🏃‍♂️ Todo

- [x] Home page with tRPC
- [x] Discover page with tRPC
- [x] Dashboard photos & photo id page with tRPC
- [x] Blog page with tRPC
- [x] Travel page with tRPC
