import dotenv from "dotenv";
dotenv.config();
import { Server } from "socket.io";

import app from "./app";
import http from "http";
// import db configure
import { connectToDatabase } from "./config/db.config";
import { ENV } from "./config/env.config";

connectToDatabase();
// create http server  from express app
const server = http.createServer(app);
// socket.io setup garnu paro
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});
// export io instance for controllers ko lagai
export const getIO = () => io;
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(userId);
    console.log(`👤 User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client Disconnected:", socket.id);
  });
});
// create server
const startServer = () => {
  const port = ENV.PORT || 4000;
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};
startServer();
