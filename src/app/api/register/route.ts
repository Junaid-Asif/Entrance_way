import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, identityCards } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const cnic = formData.get('cnic') as string;
        const department = formData.get('department') as string;

        const mrNo = formData.get('mrNo') as string;
        const relation = formData.get('relation') as string;
        const relationName = formData.get('relationName') as string;
        const rank = formData.get('rank') as string;
        const bloodGroup = formData.get('bloodGroup') as string;

        const photo = formData.get('photo') as File | null;

        if (!fullName || !email || !cnic || !mrNo) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let photoUrl = "";
        if (photo && photo.size > 0) {
            const bytes = await photo.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = join(process.cwd(), 'public', 'uploads');
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch (e) {
                // ignore
            }

            const fileName = `${uuidv4()}-${photo.name.replace(/\s+/g, '_')}`;
            const filePath = join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            photoUrl = `/uploads/${fileName}`;
        }

        // Generate a unique token for the QR so the QR doesn't hold personal data.
        const qrCodeId = uuidv4();

        // Use Drizzle Transaction for inserting parent-child correctly
        const result = await db.transaction(async (tx) => {
            let [newUser] = await tx.select().from(users).where(eq(users.email, email)).limit(1);

            if (!newUser) {
                [newUser] = await tx.insert(users).values({
                    email: email,
                    fullName: fullName,
                    role: 'user',
                }).returning();
            }

            const [newCard] = await tx.insert(identityCards).values({
                userId: newUser.id,
                cnicNumber: cnic,
                department: department || null,
                qrToken: qrCodeId as string,
                photoUrl: photoUrl || null,
                isActive: true,
                mrNo: mrNo,
                relation: relation || null,
                relationName: relationName || null,
                rank: rank || null,
                bloodGroup: bloodGroup || null,
            }).returning();

            return { newUser, newCard };
        });

        return NextResponse.json({
            success: true,
            user: result.newUser,
            card: {
                qrCodeId: qrCodeId,
                name: fullName,
                cnic: cnic,
                mrNo: mrNo,
                relation: relation,
                relationName: relationName,
                rank: rank,
                bloodGroup: bloodGroup,
                department: department,
                photoUrl: photoUrl
            }
        });
    } catch (error: any) {
        console.error('Registration Error:', error);
        // Postgres error code 23505 for unique constraint
        const errCode = error.code || error.cause?.code;
        const errMsg = error.message || '';

        // Postgres error code 23505 for unique constraint
        if (errCode === 'P2002' || String(errCode) === '23505' || errMsg.includes('duplicate key value')) {
            return NextResponse.json({ error: 'CNIC, MR No, or Email is already registered with another card.' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
