import express from "express";
import { getProductList } from "./service.js";

const router = express.Router();

router.get("/", getProductList);
// router.get("/:id", getProduct);
// router.post("/", createProduct);
// router.patch("/:id", updateProduct);
// router.delete("/:id", deleteProduct);

// router.post("/:id/favorite", addLikes);
// router.delete("/:id/favorite", deleteLikes);

export default router;
