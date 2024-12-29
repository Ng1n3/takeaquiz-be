import express, { Application } from 'express';
import { config } from './src/config.ts';
import { ping, setupDb } from './src/db/index.ts';
import process from "node:process";

const app: Application = express();

// Middleware to parse JSON
app.use(express.json());

// Function to start the Express server
function startServer() {
  const port: number = config.PORT || 5000; // Explicitly define the port as number

  // Start the server and return the listen function
  app.listen(port, () => {
    console.log(`Server is currently listening on http://localhost:${port}`);
  });
}

// Main function to initialize the app and database
async function main() {
  // Set up the database
  const { db } = setupDb(config.DATABASE_URL);

  // Ping the database to check connection
  try {
    await ping(db);
    console.log('Database is up and running');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit process if DB connection fails
  }

  // Start the Express server after the DB connection is successful
  try {
    await startServer();
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1); // Exit if server startup fails
  }
}

// Run the main function
main();