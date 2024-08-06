import express from "express";

const router = express.Router();

// /tenants
router.post("/", (req, res) => {
    res.status(201).json()
})
export default router;