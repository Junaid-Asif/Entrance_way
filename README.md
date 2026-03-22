# Unified Security Platform

This platform manages two distinct modules:
1. **Identity & Access Card System**: QR-based security cards dynamically mapped to UUIDs preventing forgery.
2. **Visitor Management**: Detailed entry/exit logging with live tracking and an automatic cron check API to catch overstaying visitors.

## Tech Stack
- **Next.js 16 (App Router)**
- **Tailwind CSS 4.0 & Shadcn UI** for a pristine, intermediate blue professional theme.
- **Drizzle ORM** with PostgreSQL (hosted on Railway).
- **Supabase** for authentication and backend services.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- A PostgreSQL database (e.g., Railway, Supabase, or local)

### 1. Install Dependencies
```sh
npm install
```

### 2. Configure Environment Variables

Create a `.env` file (or `.env.local`) in the project root and add the following:

```env
DATABASE_URL="your-database-connection-string-here"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url-here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
```

> ⚠️ **Never commit your `.env` file.** Make sure it is listed in `.gitignore`.

### 3. Push the Schema to the Database
```sh
npx drizzle-kit push
```

### 4. Start the Application
```sh
npm run dev
```

The app will be available at `http://localhost:3000`.

## Pages & Workflows
| Route | Description |
|---|---|
| `/` | Landing Page |
| `/register` | Card Registration |
| `/scan` | Hardware Sensor (Scanner) — uses webcam to simulate a hardware scanner terminal, unlocking when a valid QR UUID matches a DB record |
| `/admin` | Admin Dashboard |

## Cron Triggers
To check for overstaying visitors, periodically trigger:
```
GET /api/cron/notify
```
We recommend mapping this URL using an external webhook scheduler or configuring it within Supabase Edge Functions schedule triggers.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License
This project is private.
