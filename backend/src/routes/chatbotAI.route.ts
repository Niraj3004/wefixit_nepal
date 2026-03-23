import express, { Router } from "express";
import * as chatbotAIController from "../controllers/chatbotAI.controller";

const router: Router = express.Router();

router.route("/query")
  .post(chatbotAIController.handleChatQuery);

export default router;
