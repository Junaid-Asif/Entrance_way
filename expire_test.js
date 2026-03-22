require('dotenv').config();
const postgres = require('postgres');
const url = process.env.DIRECT_URL || process.env.DATABASE_URL.replace('6543', '5432');
const sql = postgres(url);

sql`UPDATE visitor_management SET expected_exit_timestamp = NOW() - INTERVAL '1 hour' WHERE status = 'inside'`.then(() => {
    console.log('Visitors expired successfully');
    process.exit(0);
}).catch(e => {
    console.error('Error expiring:', e);
    process.exit(1);
});
