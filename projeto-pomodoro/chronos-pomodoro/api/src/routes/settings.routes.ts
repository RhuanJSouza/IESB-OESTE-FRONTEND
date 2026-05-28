import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const defaultSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

router.get('/', async (req, res) => {
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    return res.json(defaultSettings);
  }
  return res.json(settings);
});

router.put('/', async (req, res) => {
  const { workMinutes, shortBreakMinutes, longBreakMinutes } = req.body;
  if (
    typeof workMinutes !== 'number' ||
    typeof shortBreakMinutes !== 'number' ||
    typeof longBreakMinutes !== 'number'
  ) {
    return res.status(400).json({ error: 'Os valores devem ser numéricos.' });
  }
  if (workMinutes <= 0 || shortBreakMinutes <= 0 || longBreakMinutes <= 0) {
    return res.status(400).json({ error: 'Todos os valores devem ser maiores que zero.' });
  }

  const existing = await prisma.settings.findFirst();
  const settings = existing
    ? await prisma.settings.update({
        where: { id: existing.id },
        data: {
          workMinutes,
          shortBreakMinutes,
          longBreakMinutes,
        },
      })
    : await prisma.settings.create({
        data: {
          workMinutes,
          shortBreakMinutes,
          longBreakMinutes,
        },
      });

  return res.json(settings);
});

export default router;
