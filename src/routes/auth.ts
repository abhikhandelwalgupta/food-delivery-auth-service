import express from "express";
import { AuthController } from "../controllter/AuthController";

const router = express.Router();
const authControlloer = new AuthController();

router.post("/register", (req, res) => authControlloer.register(req, res));

export default router;
