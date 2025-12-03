import express, { Request, Response } from 'express';

import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok', message: 'Montefiore Pizza Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
