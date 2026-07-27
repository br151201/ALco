const express = require("express");
const router = express.Router();
const pool = require("../db");

/* ---------------------------------------------------------
   GET NEXT AUTO-INCREMENT DELIVERY NOTE NUMBER
--------------------------------------------------------- */
router.get("/next-id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT delivery_note FROM delivery_notes ORDER BY id DESC LIMIT 1"
        );

        let nextId = 1;

        if (result.rows.length > 0) {
            const lastId = parseInt(result.rows[0].delivery_note, 10);
            nextId = lastId + 1;
        }

        res.json({ next_id: nextId });

    } catch (error) {
        console.error("AUTO-ID ERROR:", error);
        res.status(500).json({ error: "Failed to generate next tracking ID" });
    }
});

/* ---------------------------------------------------------
   CREATE NEW DELIVERY NOTE
--------------------------------------------------------- */
router.post("/", async (req, res) => {
    const {
        delivery_note_number,
        customer_name,
        address,
        driver_name,
        items,
        total_price
    } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO delivery_notes
            (delivery_note, customer_name, address, driver_name, items, total_price)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                delivery_note_number,
                customer_name,
                address,
                driver_name,
                JSON.stringify(items),
                total_price ? parseInt(total_price, 10) : 0
            ]
        );

        res.json({
            success: true,
            message: "Delivery Note Created!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("DB ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Database insert failed",
            error: error.message
        });
    }
});

module.exports = router;
