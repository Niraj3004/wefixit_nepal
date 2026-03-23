import express, { Router } from "express";
import * as chatbotAIController from "../controllers/chatbotAI.controller";

import { validateZod } from "../middlewares/validationzod";
import { chatQuerySchema } from "../validations/chatbotAI.validation";

const router: Router = express.Router();

router.route("/query")
  .post(validateZod(chatQuerySchema), chatbotAIController.handleChatQuery);

export default router;
