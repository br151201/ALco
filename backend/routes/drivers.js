const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

const SECRET = "ALCO_DRIVER_SECRET";

/* ---------------------------------------------------------
   DRIVER LOGIN
--------------------------------------------------------- */
router.post("/login", async (req, res) => {
    const { name, password } = req.body;

    console.log("LOGIN REQUEST BODY:", req.body);

    try {
        const result = await pool.query(
            "SELECT * FROM drivers WHERE name = $1 AND password_hash = $2",
            [name, password]
        );

        if (result.rows.length === 0) {
            return res.json({ success: false });
        }

        const token = jwt.sign({ driver: name }, SECRET);
        res.json({ success: true, token });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

/* ---------------------------------------------------------
   GET DRIVER ORDERS
--------------------------------------------------------- */
router.get("/orders", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "No token" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        const driverName = decoded.driver;

        const result = await pool.query(
            `SELECT delivery_note, customer_name, address
             FROM delivery_notes
             WHERE driver_name = $1`,
            [driverName]
        );

        res.json(result.rows);

    } catch (err) {
        console.error("ORDER ERROR:", err);
        res.status(401).json({ error: "Invalid token" });
    }
});

module.exports = router;
