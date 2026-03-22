# Entrance Way — Unified Security Platform

A full-stack web application for managing building/premises security through two integrated modules: **Digital Identity Cards** with QR-based access and **Visitor Management** with real-time time-tracking.

---

## Project Overview

Entrance Way is designed for gated communities, corporate offices, and restricted-area premises. It replaces traditional paper-based entry logs with a digital system that generates QR-coded identity cards, validates them at sensor terminals, and tracks visitor entry/exit with automated overstay detection.

---

## Module 1 — Identity & Access Card System

This module handles the registration of individuals and the generation of digital security cards.

### Registration Categories
- **Company Staff**: Registers employees with their company name, department, and designation.
- **Prohibited Area Personnel**: Registers individuals requiring clearance for restricted zones, with clearance levels (Level 1 – Restricted, Level 2 – Supervised, Level 3 – Escorted) and MR No / Protocol identifiers.

### Registration Form Fields
Each card captures:
- Full Name, CNIC, Email
- Blood Group
- Photo (uploaded from file or captured via laptop webcam in real-time)
- Dependent Reference (optional — reference name + relation)
- Category-specific fields (Company/Department/Designation for staff, or Clearance Level/MR No/Zone for prohibited area)

### Card Generation
- Upon form submission, the system creates a user record in the database and generates a unique **UUID-based QR token**.
- The QR code is embedded into a professionally designed digital identity card displayed on screen.
- The QR payload contains the UUID token (not personal data directly), which is mapped to the database record — preventing forgery.
- Cards can be downloaded as **PNG** or **PDF** for physical printing.

---

## Module 2 — Visitor Management

This module logs visitors entering the premises with time-bound tracking.

### Visitor Entry Logging
- Admin registers a visitor with: Full Name, CNIC, House Number being visited, and expected duration of stay (1–12 hours).
- The system automatically calculates the **expected exit timestamp** based on the duration.

### Live Tracking (Live Inside Tab)
- Displays all visitors currently inside the premises in a live table.
- Each entry shows: Visitor name, CNIC, entry time, expected exit time, and current status.
- Visitors whose time has expired are flagged with a pulsing **"EXPIRED"** badge.
- Admins can manually mark visitors as **"Exited"** when they leave.

### Overstay Notifications
- A **cron API endpoint** (`/api/cron/notify`) checks for visitors who are still marked as "inside" but whose expected exit time has passed.
- Overstaying visitors are flagged with status `overstayed` and marked as `notifiedOfExpiry: true`.
- The notification system is designed to integrate with external services (Twilio, Supabase Edge Functions) for WhatsApp/push alerts.
- On the landing page, real-time **toast-style notifications** appear for any expired visitors, visible to all users.

---

## Module 3 — QR Scanner Terminal (Hardware Sensor)

The scan page simulates a gate-mounted hardware scanner terminal.

### How It Works
- Uses the device's **webcam** to scan QR codes in real-time via the `html5-qrcode` library.
- When a QR code is scanned, the embedded UUID token is sent to the server for validation.
- The server looks up the QR token in the `identity_cards` table, verifies the card is active, and retrieves the associated user.
- **Access Granted**: Displays a green confirmation overlay with the cardholder's name.
- **Access Denied**: Displays a red denial overlay if the QR is invalid, inactive, or unrecognized.
- Every scan (granted or denied) is logged in the `access_logs` table with the location name and timestamp.
- The scanner automatically resets after 4 seconds and resumes scanning.

---

## Admin Dashboard

A centralized dashboard for security personnel with four main tabs:

### 1. Live Inside
- Real-time table of all visitors currently on premises.
- Shows entry time, expected exit, and status (Inside / Expired).
- One-click "Mark Exited" action per visitor.

### 2. Register Visitor
- Form to log new visitor entries with name, CNIC, house number, and expected stay duration.

### 3. Access History
- **Generated Cards**: Table of all identity cards ever created, showing the QR code thumbnail (clickable for full-size preview), cardholder name, CNIC, department, and creation timestamp.
- **Visitor Records**: Complete log of all visitor entries with entry/exit timestamps and manual checkout option.

### 4. Sensor Records
- Full log of every QR scan attempt from the hardware sensor terminal.
- Shows access status (Granted/Denied), cardholder identity, gate terminal name, and scan timestamp.

The dashboard features a sidebar navigation on desktop and a **bottom navigation bar** on mobile for responsive access.

---

## Database Schema

The system uses four core tables:

| Table | Purpose |
|---|---|
| `users` | Stores registered individuals (email, full name, role). Roles: admin, user, security. |
| `identity_cards` | Links to a user. Stores CNIC, department, QR token (UUID), photo URL, MR No, rank, blood group, relation info. Each card has an `is_active` flag. |
| `visitor_management` | Logs each visitor entry with name, CNIC, house number, entry/expected-exit/actual-exit timestamps, status (inside/exited/overstayed), and notification flag. |
| `access_logs` | Records every scan event with card reference, location name, access granted status, and scan timestamp. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4.0 + Shadcn UI |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Railway) |
| Auth & Backend | Supabase |
| QR Generation | `qrcode.react` (SVG-based, error correction level H) |
| QR Scanning | `html5-qrcode` (webcam-based real-time scanning) |
| Card Export | `html-to-image` (PNG) + `jsPDF` (PDF) |
| Icons | Lucide React |
| Date Utilities | date-fns |

---

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/register` | Register a new user and generate an identity card with QR token |
| POST | `/api/scan` | Validate a scanned QR code and log the access attempt |
| GET | `/api/cron/notify` | Check for overstaying visitors and trigger notifications |
| GET | `/api/admin/visitors` | Fetch all visitor records |
| POST | `/api/admin/visitors` | Log a new visitor entry |
| PUT | `/api/admin/visitors` | Update visitor status (mark as exited) |
| GET | `/api/admin/scans` | Fetch all sensor scan records |
| GET | `/api/admin/cards` | Fetch all generated identity cards |
