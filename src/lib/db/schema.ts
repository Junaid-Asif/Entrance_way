import { pgTable, text, uuid, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Enums (Optional, matching Check constraints)
export const roleEnum = pgEnum('role', ['admin', 'user', 'security']);
export const statusEnum = pgEnum('status', ['inside', 'exited', 'overstayed']);

// 2. USERS TABLE
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').unique().notNull(),
    fullName: text('full_name').notNull(),
    role: text('role').default('user'), // Or use roleEnum('role').default('user') if matching Supabase strictly
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 3. PERMANENT CARDS TABLE
export const identityCards = pgTable('identity_cards', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    cnicNumber: text('cnic_number').unique().notNull(),
    department: text('department'),
    qrToken: uuid('qr_token').unique().defaultRandom(),
    photoUrl: text('photo_url'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    mrNo: text('mr_no').unique(), // Carrying over your new fields just in case
    relation: text('relation'),
    relationName: text('relation_name'),
    rank: text('rank'),
    bloodGroup: text('blood_group'),
});

// 4. VISITOR LOGS TABLE
export const visitorManagement = pgTable('visitor_management', {
    id: uuid('id').primaryKey().defaultRandom(),
    visitorName: text('visitor_name').notNull(),
    visitorCnic: text('visitor_cnic').notNull(),
    contactNumber: text('contact_number'),
    visitPurpose: text('visit_purpose'),
    cnicHeldAtGate: boolean('cnic_held_at_gate').default(true),
    entryTimestamp: timestamp('entry_timestamp', { withTimezone: true }).defaultNow(),
    expectedExitTimestamp: timestamp('expected_exit_timestamp', { withTimezone: true }).notNull(),
    actualExitTimestamp: timestamp('actual_exit_timestamp', { withTimezone: true }),
    status: text('status').default('inside'),
    notifiedOfExpiry: boolean('notified_of_expiry').default(false),
    houseNo: text('house_no'),
});

// 5. ACCESS CONTROL LOGS
export const accessLogs = pgTable('access_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    cardId: uuid('card_id').references(() => identityCards.id),
    locationName: text('location_name').notNull(),
    accessGranted: boolean('access_granted').notNull(),
    scannedAt: timestamp('scanned_at', { withTimezone: true }).defaultNow(),
});

// Relations Setup (for Drizzle ORM `.query` capabilities)
export const usersRelations = relations(users, ({ one, many }) => ({
    identityCards: many(identityCards),
}));

export const identityCardsRelations = relations(identityCards, ({ one, many }) => ({
    user: one(users, {
        fields: [identityCards.userId],
        references: [users.id],
    }),
    accessLogs: many(accessLogs),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
    identityCard: one(identityCards, {
        fields: [accessLogs.cardId],
        references: [identityCards.id],
    }),
}));
