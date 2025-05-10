// src/index.ts
import express from 'express';
import cors from 'cors';
import authRouter from './auth';
import historyRouter from './history';

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/', (_req, res) => {
  res.send('Hit & Blow API running');
});

// ルーター登録
app.use('/api/auth', authRouter);
app.use('/api/history', historyRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
