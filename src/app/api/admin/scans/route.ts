import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { accessLogs, identityCards, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const rawScans = await db
      .select({
        id: accessLogs.id,
        location_name: accessLogs.locationName,
        access_granted: accessLogs.accessGranted,
        scanned_at: accessLogs.scannedAt,
        cnic_number: identityCards.cnicNumber,
        user_full_name: users.fullName,
        user_email: users.email
      })
      .from(accessLogs)
      .leftJoin(identityCards, eq(accessLogs.cardId, identityCards.id))
      .leftJoin(users, eq(identityCards.userId, users.id))
      .orderBy(desc(accessLogs.scannedAt))
      .limit(100);

    const scansData = rawScans.map((scan) => ({
      id: scan.id,
      location_name: scan.location_name,
      access_granted: scan.access_granted,
      scanned_at: scan.scanned_at,
      identity_cards: {
        cnic_number: scan.cnic_number,
        users: {
          full_name: scan.user_full_name,
          email: scan.user_email
        }
      }
    }));

    return NextResponse.json({ scans: scansData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

