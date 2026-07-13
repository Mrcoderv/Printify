import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (_req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE id=1').get();
  if (!row) return res.status(404).json({ error: 'Settings not found' });
  res.json(row);
});

router.put('/', (req, res) => {
  const s = req.body;
  db.prepare(`
    UPDATE settings SET name=@name, panNumber=@panNumber, vatNumber=@vatNumber,
      address=@address, contactNumber=@contactNumber, email=@email,
      logo=@logo, vatRate=@vatRate
    WHERE id=1
  `).run(s);
  res.json(s);
});

export default router;
