const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const JWT_SECRET = "super_secret_key_change_this";

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // TEMPORARY: plain text compare (because your DB has plain passwords)
        if (password !== user.password_hash) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

module.exports = router;
