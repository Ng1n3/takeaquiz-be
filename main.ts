import express, { Application, NextFunction, Request, Response } from 'express';
import process from 'node:process';
import { config } from './src/config.ts';
import { ping, setupDb } from './src/db/index.ts';
import { NotFoundError } from './src/error/NotFoundError.ts';
import { ErrorHandler } from './src/middleware/ErrorHandler.ts';
import { userRouter } from './src/modules/users/users.router.ts';

const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

app.use('/api/users', userRouter());

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

app.use(ErrorHandler.handleError);

function startServer() {
  const port: number = config.PORT || 5000; 

  app.listen(port, () => {
    console.log(`Server is currently listening on http://localhost:${port}`);
  });
}

async function main() {

  const { db } = setupDb(config.DATABASE_URL);

  // Ping the database to check connection
  try {
    await ping(db);
    console.log('Database is up and running');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); 
  }

  // Start the Express server after the DB connection is successful
  try {
     startServer();
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1); 
  }
}

// Run the main function
main();
