import express from "express";

import { verifyToken } from "../../middlewares/index.js";
import { signup, login, logout, refresh } from "./service.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/logout", verifyToken, logout);

export default router;
