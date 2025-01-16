import express from "express";

import { isLoggedIn, isNotLoggedIn } from "../../middlewares/index.js";
import { join, login, logout } from "./service.js";

const router = express.Router();

router.post("/join", isNotLoggedIn, join);
router.post("/login", isNotLoggedIn, login);
router.get("/logout", isLoggedIn, logout);

export default router;
