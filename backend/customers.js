const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ---------------------------------------------------------
   SEARCH CUSTOMERS BY NAME (Auto-suggest)
--------------------------------------------------------- */
router.get("/search", async (req, res) => {
    const name = req.query.name;

    if (!name || name.trim() === "") {
        return res.json([]);
    }

    try {
        const result = await pool.query(
            `SELECT customer_name 
             FROM customers 
             WHERE customer_name ILIKE $1 
             LIMIT 10`,
            [`%${name}%`]
        );

        res.json(result.rows);

    } catch (error) {
        console.error("CUSTOMER SEARCH ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search customers",
            error: error.message
        });
    }
});

module.exports = router;
