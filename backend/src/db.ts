import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(__dirname, '../../data/printing.db');
export const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    phone             TEXT NOT NULL,
    address           TEXT NOT NULL,
    email             TEXT,
    outstandingBalance REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    category      TEXT NOT NULL,
    unit          TEXT NOT NULL,
    quantity      REAL NOT NULL DEFAULT 0,
    purchasePrice REAL NOT NULL DEFAULT 0,
    vendor        TEXT NOT NULL,
    status        TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vendors (
    id                 TEXT PRIMARY KEY,
    name               TEXT NOT NULL,
    phone              TEXT NOT NULL,
    address            TEXT NOT NULL,
    panNumber          TEXT NOT NULL,
    outstandingBalance REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id       TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    amount   REAL NOT NULL,
    reason   TEXT NOT NULL,
    date     TEXT NOT NULL,
    addedBy  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bills (
    id         TEXT PRIMARY KEY,
    billNumber TEXT NOT NULL,
    date       TEXT NOT NULL,
    customer   TEXT NOT NULL,
    items      TEXT NOT NULL,
    subtotal   REAL NOT NULL,
    discount   REAL NOT NULL,
    vat        REAL NOT NULL,
    grandTotal REAL NOT NULL,
    status     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id            INTEGER PRIMARY KEY CHECK (id = 1),
    name          TEXT,
    panNumber     TEXT,
    vatNumber     TEXT,
    address       TEXT,
    contactNumber TEXT,
    email         TEXT,
    logo          TEXT,
    vatRate       REAL
  );
`);

// ── Seed data (only if tables are empty) ────────────────────────────────────
function seedIfEmpty() {
  const customerCount = (db.prepare('SELECT COUNT(*) as n FROM customers').get() as { n: number }).n;
  if (customerCount > 0) return; // already seeded

  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, phone, address, email, outstandingBalance)
    VALUES (@id, @name, @phone, @address, @email, @outstandingBalance)
  `);
  const insertInventory = db.prepare(`
    INSERT INTO inventory (id, name, category, unit, quantity, purchasePrice, vendor, status)
    VALUES (@id, @name, @category, @unit, @quantity, @purchasePrice, @vendor, @status)
  `);
  const insertVendor = db.prepare(`
    INSERT INTO vendors (id, name, phone, address, panNumber, outstandingBalance)
    VALUES (@id, @name, @phone, @address, @panNumber, @outstandingBalance)
  `);
  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, category, amount, reason, date, addedBy)
    VALUES (@id, @category, @amount, @reason, @date, @addedBy)
  `);
  const insertBill = db.prepare(`
    INSERT INTO bills (id, billNumber, date, customer, items, subtotal, discount, vat, grandTotal, status)
    VALUES (@id, @billNumber, @date, @customer, @items, @subtotal, @discount, @vat, @grandTotal, @status)
  `);
  const insertSettings = db.prepare(`
    INSERT INTO settings (id, name, panNumber, vatNumber, address, contactNumber, email, logo, vatRate)
    VALUES (1, @name, @panNumber, @vatNumber, @address, @contactNumber, @email, @logo, @vatRate)
  `);

  const seedAll = db.transaction(() => {
    insertCustomer.run({ id: 'c1', name: 'Rahul Sharma', phone: '9841234567', address: 'Kathmandu, Nepal', email: 'rahul@email.com', outstandingBalance: 4500 });
    insertCustomer.run({ id: 'c2', name: 'Priya Patel', phone: '9861234567', address: 'Pokhara, Nepal', email: 'priya@email.com', outstandingBalance: 2300 });

    insertInventory.run({ id: 'i1', name: 'A4 Paper', category: 'Paper', unit: 'Ream', quantity: 45, purchasePrice: 450, vendor: 'Paper Mart', status: 'In Stock' });
    insertInventory.run({ id: 'i2', name: 'Black Ink', category: 'Ink', unit: 'Liter', quantity: 8, purchasePrice: 1200, vendor: 'Ink Suppliers', status: 'Low Stock' });

    insertVendor.run({ id: 'v1', name: 'Paper Mart', phone: '9851234567', address: 'Biratnagar', panNumber: 'PAN123456', outstandingBalance: 15000 });

    insertExpense.run({ id: 'e1', category: 'Rent', amount: 25000, reason: 'Monthly office rent', date: '2026-07-01', addedBy: 'Admin' });

    const customer1 = JSON.stringify({ id: 'c1', name: 'Rahul Sharma', phone: '9841234567', address: 'Kathmandu, Nepal', email: 'rahul@email.com', outstandingBalance: 4500 });
    const items1 = JSON.stringify([{ id: 'bi1', name: 'Visiting Cards', quantity: 1000, unitPrice: 2.5, discount: 0 }]);
    insertBill.run({ id: 'b1', billNumber: 'BILL-0001', date: '2026-07-05', customer: customer1, items: items1, subtotal: 2500, discount: 0, vat: 325, grandTotal: 2825, status: 'Paid' });

    insertSettings.run({ name: 'Shree Printing Press', panNumber: 'PAN987654', vatNumber: 'VAT123456', address: 'New Road, Kathmandu, Nepal', contactNumber: '01-4567890', email: 'info@shreeprint.com', logo: '/logo.png', vatRate: 13 });
  });

  seedAll();
  console.log('✅ Database seeded with initial data');
}

seedIfEmpty();
