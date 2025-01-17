import express from "express";
import { verifyToken } from "../../middlewares/index.js";
import {
  getProductList,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./service.js";

const router = express.Router();

router.get("/", verifyToken, getProductList);
router.get("/:id", verifyToken, getProduct);
router.post("/", verifyToken, createProduct);
router.patch("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

export default router;
