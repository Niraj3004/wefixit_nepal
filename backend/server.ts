import app from "./src/app";

import http from "http";
// import db configure
import { connectToDatabase } from "./src/config/db.config";
import { ENV } from "./src/config/env.config";

connectToDatabase();
// create http server  from express app
const server = http.createServer(app);



// ecport io instance for controllers ko lagai


// create server
const startServer = () => {
  const port = ENV.PORT || 5000;
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};
startServer();