import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import 'express-async-errors';
import settingsRoutes from './routes/settings.routes.js';
import tasksRoutes from './routes/tasks.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
  return res.json({ status: 'ok' });
});
app.use('/settings', settingsRoutes);
app.use('/tasks', tasksRoutes);
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  return res.status(500).json({ error: 'Erro interno no servidor' });
});

export default app;
