import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, identityCards, accessLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { qrCodeId } = await req.json();

        if (!qrCodeId) {
            return NextResponse.json({ error: 'Missing QR Code ID' }, { status: 400 });
        }

        // Drizzle Query equivalent
        const [idCard] = await db
            .select({
                id: identityCards.id,
                isActive: identityCards.isActive,
                user: {
                    id: users.id,
                    email: users.email,
                    fullName: users.fullName,
                    role: users.role
                }
            })
            .from(identityCards)
            .leftJoin(users, eq(identityCards.userId, users.id))
            .where(eq(identityCards.qrToken, qrCodeId as string))
            .limit(1);

        if (!idCard || !idCard.isActive || !idCard.user) {
            return NextResponse.json({ success: false, error: 'Invalid ID. Access Denied.' }, { status: 403 });
        }

        // Insert access history
        await db.insert(accessLogs).values({
            cardId: idCard.id,
            accessGranted: true,
            locationName: 'Main Gate',
        });

        return NextResponse.json({ success: true, user: idCard.user });
    } catch (error: any) {
        console.error('Scan Validation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
