require('dotenv').config();
const postgres = require('postgres');
const url = process.env.DIRECT_URL || process.env.DATABASE_URL.replace('6543', '5432');
const sql = postgres(url);

sql`ALTER TABLE visitor_management ADD COLUMN house_no text`.then(() => {
    console.log('Column added successfully');
    process.exit(0);
}).catch(e => {
    console.error('Error adding column:', e);
    process.exit(1);
});
