import { Router } from "express";
import { getConversation } from "../controllers/chat.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Get the entire chat history with a specific user
router.get("/:partnerId", AuthMiddleware.isAuthenticated, getConversation);

export default router;
