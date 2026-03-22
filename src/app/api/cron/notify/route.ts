import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitorManagement } from '@/lib/db/schema';
import { eq, lt, and, inArray } from 'drizzle-orm';

export async function GET() {
    try {
        const now = new Date();
        // Find visitors still inside whose expected_exit_time has passed
        const overstayingVisitors = await db
            .select()
            .from(visitorManagement)
            .where(
                and(
                    eq(visitorManagement.status, 'inside'),
                    lt(visitorManagement.expectedExitTimestamp, now),
                    eq(visitorManagement.notifiedOfExpiry, false)
                )
            );

        if (overstayingVisitors.length === 0) {
            return NextResponse.json({ message: 'No overstaying visitors.' });
        }

        // Simulate sending notifications (WhatsApp/Push)
        const notifications = overstayingVisitors.map((v: any) => {
            // Here you would integrate Twilio or Supabase Edge trigger.
            return `ALERT: Visitor ${v.visitorName} (CNIC: ${v.visitorCnic}) has overstayed their allocated time.`;
        });

        console.log("=== AUTOMATED NOTIFICATIONS ===");
        notifications.forEach((log: any) => console.log(log));

        // Let the UI know that notification has been pushed, update tracker
        await db
            .update(visitorManagement)
            .set({
                notifiedOfExpiry: true,
                status: 'overstayed'
            })
            .where(inArray(visitorManagement.id, overstayingVisitors.map((v: any) => v.id)));

        return NextResponse.json({ success: true, notified: notifications.length, messages: notifications });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
