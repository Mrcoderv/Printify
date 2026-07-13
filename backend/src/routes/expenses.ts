import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const e = req.body;
  db.prepare(`
    INSERT INTO expenses (id, category, amount, reason, date, addedBy)
    VALUES (@id, @category, @amount, @reason, @date, @addedBy)
  `).run(e);
  res.status(201).json(e);
});

router.put('/:id', (req, res) => {
  const e = { ...req.body, id: req.params.id };
  db.prepare(`
    UPDATE expenses SET category=@category, amount=@amount,
      reason=@reason, date=@date, addedBy=@addedBy
    WHERE id=@id
  `).run(e);
  res.json(e);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id=?').run(req.params.id);
  res.status(204).send();
});

export default router;
