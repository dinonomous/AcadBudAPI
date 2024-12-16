import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const ConnectionString = process.env.MONGODB_CONNECTION_STRING as string;

// Type for the connection function
const createConnection = (uri: string, name: string): Connection => {
  const connection = mongoose.createConnection(uri, { autoCreate: false });

  connection.on("connected", () => {
    console.log(`MongoDB connected: ${name}`);
  });

  connection.on("error", (err) => {
    console.error(`MongoDB connection error (${name}):`, err);
  });

  connection.on("disconnected", () => {
    console.warn(`MongoDB disconnected: ${name}`);
  });

  return connection;
};

const db = createConnection(ConnectionString, "MongoDB");

// Wait for the connection to be established
const waitForConnections = async (): Promise<void> => {
  const connections = [db];

  for (const connection of connections) {
    if (connection.readyState !== 1) {
      await new Promise<void>((resolve, reject) => {
        connection.once("connected", resolve);
        connection.once("error", reject);
      });
    }
  }

  console.log("All MongoDB connections are ready.");
};

export { db, waitForConnections };
