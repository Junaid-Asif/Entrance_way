# Unified Security Platform

This platform manages two distinct modules:
1. **Identity & Access Card System**: QR-based security cards dynamically mapped to UUIDs preventing forgery.
2. **Visitor Management**: Detailed entry/exit logging with live tracking and an automatic cron check API to catch overstaying visitors.

## Tech Stack
- **Next.js 15 (App Router)**
- **Tailwind CSS 4.0 & Shadcn UI** for a pristine, intermediate blue professional theme.
- **Prisma ORM** mapping directly to your provided Railway PostgreSQL database.
- **Supabase** acting as a headless backend API mock map interface.

## How to Initialize

1. Connects to the Railway Database. Ensure `.env.local` contains:
```env
DATABASE_URL="postgresql://postgres:SimDqEyRmjnDULTvjgBnKCmrYhXEYeGv@interchange.proxy.rlwy.net:25571/railway"
```

2. Push the schema to Railway Postgres Database:
```sh
npx prisma db push
```

3. Generate the Prisma Client locally:
```sh
npx prisma generate
```

4. Start the Application:
```sh
npm run dev
```

## Workflows Included
- **Landing Page**: http://localhost:3000/
- **Card Registration**: http://localhost:3000/register
- **Hardware Sensor (Scanner)**: http://localhost:3000/scan 
  - (Will use webcam if allowed, simulating the hardware scanner terminal unlocking when a valid QR UUID matches a DB record constraint)
- **Admin Dashboard**: http://localhost:3000/admin

## Cron Triggers
To check for overstaying visitors, standardly trigger:
- `GET http://localhost:3000/api/cron/notify` 
- We recommend mapping this URL using an external webhook periodically or configuring it within Supabase Edge functions schedule triggers.
