import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db';
import env from './utils/env';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic route
app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({ status: 'ok', message: 'Montefiore Pizza Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
