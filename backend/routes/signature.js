const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

const SECRET = "ALCO_DRIVER_SECRET";

/* ---------------------------------------------------------
   COMPLETE DELIVERY + SAVE SIGNATURE
--------------------------------------------------------- */
router.post("/complete", async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: "No token" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        const driverName = decoded.driver;

        const { orderId, signature } = req.body;

        await pool.query(
            `UPDATE delivery_notes
             SET signature = $1, status = 'Delivered'
             WHERE delivery_note = $2 AND driver_name = $3`,
            [signature, orderId, driverName]
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to complete delivery" });
    }
});

module.exports = router;
