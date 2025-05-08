import express from 'express';
import cors from 'cors';
import authRouter from './auth';
import historyRouter from './history';

const app = express();
app.use(cors(), express.json());
app.use('/api/auth', authRouter);
app.use('/api/history', historyRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
