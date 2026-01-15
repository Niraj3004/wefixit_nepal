import mongoose from "mongoose";
import { ENV } from "./env.config"; 

export async function connectToDatabase(): Promise<void> {
  try {
    // FIX: Add '!' after ENV.MONGO_URI and ENV.DATABASE_NAME
    // This tells TypeScript: "I promise these are not undefined"
    const conn = await mongoose.connect(ENV.MONGO_URI!, { 
      dbName: ENV.DATABASE_NAME! 
    });

    console.log(`🔌 Connected to ${ENV.DB_TYPE} MongoDB: ${conn.connection.host}`);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`😭 Mongoose connection error: ${err.message}`);
    } else {
      console.error("😭 Unknown Mongoose connection error", err);
    }
    process.exit(1);
  }
}