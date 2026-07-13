import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM customers ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const c = req.body;
  db.prepare(`
    INSERT INTO customers (id, name, phone, address, email, outstandingBalance)
    VALUES (@id, @name, @phone, @address, @email, @outstandingBalance)
  `).run(c);
  res.status(201).json(c);
});

router.put('/:id', (req, res) => {
  const c = { ...req.body, id: req.params.id };
  db.prepare(`
    UPDATE customers SET name=@name, phone=@phone, address=@address,
      email=@email, outstandingBalance=@outstandingBalance
    WHERE id=@id
  `).run(c);
  res.json(c);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id=?').run(req.params.id);
  res.status(204).send();
});

export default router;
