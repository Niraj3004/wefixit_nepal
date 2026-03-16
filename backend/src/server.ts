import dotenv from "dotenv";
dotenv.config();

import app from "./app";

import http from "http";
// import db configure
import { connectToDatabase } from "./config/db.config";
import { ENV } from "./config/env.config";


connectToDatabase();
// create http server  from express app
const server = http.createServer(app);

// ecport io instance for controllers ko lagai

// create server
const startServer = () => {
  const port = ENV.PORT || 4000;
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};
startServer();
