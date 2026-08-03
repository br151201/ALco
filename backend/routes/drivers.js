const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * ---------------------------------------------------------
 * PHONE LOGIN (WEB APP)
 * ---------------------------------------------------------
 * Renamed to avoid conflict with Android email login.
 * Now the route is: POST /api/driver/login-phone
 */
router.post("/login-phone", async (req, res) => {

    console.log("PHONE LOGIN BODY RECEIVED:", req.body);

    const phone = req.body && req.body.phone;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "Phone number missing in request body"
        });
    }

    try {
        const result = await pool.query(
            "SELECT id, name, phone FROM drivers WHERE phone = $1",
            [phone]
        );

        if (result.rows.length === 0) {
            return res.json({ success: false, message: "Driver not found" });
        }

        const driver = result.rows[0];

        res.json({
            success: true,
            driver_id: driver.id,
            name: driver.name
        });

    } catch (err) {
        console.error("DRIVER PHONE LOGIN ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * ---------------------------------------------------------
 * EMAIL LOGIN (ANDROID APP)
 * ---------------------------------------------------------
 * New route: POST /api/driver/login-email
 * This avoids conflict with phone login.
 */
router.post("/login-email", async (req, res) => {

    console.log("EMAIL LOGIN BODY RECEIVED:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email or password missing"
        });
    }

    try {
        const result = await pool.query(
            "SELECT id, name, email FROM drivers WHERE email = $1 AND password_hash = $2",
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const driver = result.rows[0];

        res.json({
            success: true,
            driver_id: driver.id,
            driver_name: driver.name
        });

    } catch (err) {
        console.error("DRIVER EMAIL LOGIN ERROR:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * ---------------------------------------------------------
 * GET ALL DRIVERS (WEB APP)
 * ---------------------------------------------------------
 */
router.get("/list", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name 
             FROM drivers
             ORDER BY name ASC`
        );

        res.json({
            success: true,
            drivers: result.rows
        });

    } catch (error) {
        console.error("FETCH DRIVERS ERROR:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

module.exports = router;
    
