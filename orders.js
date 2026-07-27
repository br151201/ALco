const express = require("express");
const router = express.Router();
const pool = require("../db");

// CREATE NEW ORDER
router.post("/create", async (req, res) => {
    const {
        order_id,
        order_date,
        order_time,
        customer_name,
        address,
        email,
        product_desc,
        quantity
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO sales_orders 
             (order_id, order_date, order_time, customer_name, address, email, product_desc, quantity)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [order_id, order_date, order_time, customer_name, address, email, product_desc, quantity]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("ORDER CREATE ERROR:", err);
        res.status(500).json({ success: false, error: "Failed to create order" });
    }
});

module.exports = router;
