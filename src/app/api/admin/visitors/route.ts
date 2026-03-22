import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitorManagement } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { addHours } from 'date-fns';

export async function GET() {
    try {
        const visitors = await db
            .select()
            .from(visitorManagement)
            .orderBy(desc(visitorManagement.entryTimestamp))
            .limit(100);
        return NextResponse.json({ visitors });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, cnic, houseNo, hours } = await req.json();
        const entry_time = new Date();
        const expected_exit_time = addHours(entry_time, hours);

        const [visitor] = await db.insert(visitorManagement).values({
            visitorName: name,
            visitorCnic: cnic,
            houseNo: houseNo,
            entryTimestamp: entry_time,
            expectedExitTimestamp: expected_exit_time,
            status: 'inside'
        }).returning();
        return NextResponse.json({ success: true, visitor });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { eq } = await import('drizzle-orm');
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
        }

        const [visitor] = await db.update(visitorManagement)
            .set({
                status: status,
                actualExitTimestamp: status === 'exited' ? new Date() : undefined
            })
            .where(eq(visitorManagement.id, id))
            .returning();

        return NextResponse.json({ success: true, visitor });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
