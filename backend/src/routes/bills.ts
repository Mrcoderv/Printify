import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Bills store customer & items as JSON strings in SQLite
const rowToBill = (row: Record<string, unknown>) => ({
  ...row,
  customer: JSON.parse(row.customer as string),
  items: JSON.parse(row.items as string),
});

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM bills ORDER BY date DESC').all() as Record<string, unknown>[];
  res.json(rows.map(rowToBill));
});

router.post('/', (req, res) => {
  const bill = req.body;
  db.prepare(`
    INSERT INTO bills (id, billNumber, date, customer, items, subtotal, discount, vat, grandTotal, status)
    VALUES (@id, @billNumber, @date, @customer, @items, @subtotal, @discount, @vat, @grandTotal, @status)
  `).run({
    ...bill,
    customer: JSON.stringify(bill.customer),
    items: JSON.stringify(bill.items),
  });
  res.status(201).json(bill);
});

router.put('/:id', (req, res) => {
  const bill = { ...req.body, id: req.params.id };
  db.prepare(`
    UPDATE bills SET billNumber=@billNumber, date=@date, customer=@customer,
      items=@items, subtotal=@subtotal, discount=@discount, vat=@vat,
      grandTotal=@grandTotal, status=@status
    WHERE id=@id
  `).run({
    ...bill,
    customer: JSON.stringify(bill.customer),
    items: JSON.stringify(bill.items),
  });
  res.json(bill);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM bills WHERE id=?').run(req.params.id);
  res.status(204).send();
});

export default router;
