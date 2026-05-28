import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { startDate: 'desc' },
  });
  return res.json(tasks);
});

router.post('/', async (req, res) => {
  const { title, minutesAmount } = req.body;
  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Título da tarefa é obrigatório.' });
  }
  if (typeof minutesAmount !== 'number' || minutesAmount <= 0) {
    return res.status(400).json({ error: 'Duração deve ser um número válido.' });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      minutesAmount,
      startDate: new Date(),
    },
  });

  return res.status(201).json(task);
});

router.patch('/:id/complete', async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return res.status(404).json({ error: 'Task não encontrada.' });
  }
  if (task.finishedDate || task.interruptedDate) {
    return res.status(400).json({ error: 'Task já foi finalizada.' });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { finishedDate: new Date() },
  });

  return res.json(updated);
});

router.patch('/:id/interrupt', async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    return res.status(404).json({ error: 'Task não encontrada.' });
  }
  if (task.finishedDate || task.interruptedDate) {
    return res.status(400).json({ error: 'Task já foi finalizada.' });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { interruptedDate: new Date() },
  });

  return res.json(updated);
});

router.delete('/', async (req, res) => {
  await prisma.task.deleteMany();
  return res.status(204).send();
});

export default router;
