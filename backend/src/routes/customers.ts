import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';

const router = Router();

/**
 * outstandingBalance is NOT stored in the customers table.
 * It is computed on-the-fly as the sum of grandTotal for all Pending bills
 * whose embedded customer JSON matches this customer's id.
 */
const LIST_SQL = `
  SELECT
    c.id,
    c.name,
    c.phone,
    c.address,
    c.email,
    COALESCE(
      (SELECT SUM(b.grandTotal)
       FROM   bills b
       WHERE  json_extract(b.customer, '$.id') = c.id
         AND  b.status = 'Pending'),
      0
    ) AS outstandingBalance
  FROM customers c
  ORDER BY c.name
`;

router.get('/', (_req, res) => {
  res.json(db.prepare(LIST_SQL).all());
});

router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, phone, address, email = null } = req.body;
    if (!id || !name || !phone || !address) {
      res.status(400).json({ error: 'id, name, phone, and address are required' });
      return;
    }
    db.prepare(`
      INSERT INTO customers (id, name, phone, address, email)
      VALUES (@id, @name, @phone, @address, @email)
    `).run({ id, name, phone, address, email });

    // Return with computed balance (0 for a brand-new customer)
    const created = db.prepare(LIST_SQL + ' LIMIT 1').all().find((r: unknown) => (r as { id: string }).id === id) ??
      { id, name, phone, address, email, outstandingBalance: 0 };
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phone, address, email = null } = req.body;
    db.prepare(`
      UPDATE customers
      SET name=@name, phone=@phone, address=@address, email=@email
      WHERE id=@id
    `).run({ id: req.params.id, name, phone, address, email });

    // Return the updated row with freshly computed balance
    const updated = (db.prepare(LIST_SQL).all() as Array<{ id: string }>)
      .find((r) => r.id === req.params.id);
    res.json(updated ?? { id: req.params.id, name, phone, address, email, outstandingBalance: 0 });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id=?').run(req.params.id);
  res.status(204).send();
});

export default router;
