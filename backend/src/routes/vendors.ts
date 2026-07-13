import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM vendors ORDER BY name').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const v = req.body;
  db.prepare(`
    INSERT INTO vendors (id, name, phone, address, panNumber, outstandingBalance)
    VALUES (@id, @name, @phone, @address, @panNumber, @outstandingBalance)
  `).run(v);
  res.status(201).json(v);
});

router.put('/:id', (req, res) => {
  const v = { ...req.body, id: req.params.id };
  db.prepare(`
    UPDATE vendors SET name=@name, phone=@phone, address=@address,
      panNumber=@panNumber, outstandingBalance=@outstandingBalance
    WHERE id=@id
  `).run(v);
  res.json(v);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM vendors WHERE id=?').run(req.params.id);
  res.status(204).send();
});

export default router;
