import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCards, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
    try {
        const rawCards = await db
            .select({
                id: identityCards.id,
                cnic_number: identityCards.cnicNumber,
                department: identityCards.department,
                created_at: identityCards.createdAt,
                isActive: identityCards.isActive,
                qr_token: identityCards.qrToken,
                mr_no: identityCards.mrNo,
                blood_group: identityCards.bloodGroup,
                user_full_name: users.fullName,
                user_email: users.email,
            })
            .from(identityCards)
            .leftJoin(users, eq(identityCards.userId, users.id))
            .orderBy(desc(identityCards.createdAt))
            .limit(100);

        const cards = rawCards.map((c) => ({
            id: c.id,
            cnic: c.cnic_number,
            department: c.department,
            created_at: c.created_at,
            isActive: c.isActive,
            qr_token: c.qr_token,
            mr_no: c.mr_no,
            blood_group: c.blood_group,
            user: {
                full_name: c.user_full_name,
                email: c.user_email,
            }
        }));

        return NextResponse.json({ cards });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
