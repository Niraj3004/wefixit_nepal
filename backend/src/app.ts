import express from "express";
// import router from "./router/index";

import router from './router/user.route'
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth",router);
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
