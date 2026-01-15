import { Router } from "express";
import { registerUser, getUsers } from "../controllers/user.controller";

const router = Router();

// Route: /api/auth/register
router.route("/register").post(registerUser);
router.get("/", getUsers);

export default router;