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
        items,
        comments
    } = req.body;

    const safeComments = comments || null;

    try {
        const result = await pool.query(
            `INSERT INTO orders 
             (order_id, order_date, order_time, customer_name, email, address, items, comments, status, driver_name)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Order Created', NULL)
             RETURNING order_id`,
            [
                order_id,
                order_date,
                order_time,
                customer_name,
                email,
                address,
                JSON.stringify(items),
                safeComments
            ]
        );

        await pool.query(
            `INSERT INTO customers (name, address, email, phone)
             VALUES ($1, $2, $3, '')
             ON CONFLICT DO NOTHING`,
            [customer_name, address, email]
        );

        res.json({ success: true, order_id: result.rows[0].order_id });

    } catch (err) {
        console.error("ORDER CREATE ERROR:", err);
        res.status(500).json({ success: false, error: "Failed to create order" });
    }
});


// AUTO-FILL CUSTOMER DETAILS
router.get("/find", async (req, res) => {
    const { name } = req.query;

    try {
        const orderResult = await pool.query(
            `SELECT customer_name, address, email
             FROM orders
             WHERE LOWER(customer_name) LIKE LOWER($1 || '%')
             ORDER BY order_id DESC
             LIMIT 1`,
            [name]
        );

        if (orderResult.rows.length > 0) {
            return res.json(orderResult.rows[0]);
        }

        const customerResult = await pool.query(
            `SELECT name AS customer_name, address, email
             FROM customers
             WHERE LOWER(name) LIKE LOWER($1 || '%')
             LIMIT 1`,
            [name]
        );

        if (customerResult.rows.length > 0) {
            return res.json(customerResult.rows[0]);
        }

        res.json(null);

    } catch (err) {
        console.error("ORDER FIND ERROR:", err);
        res.status(500).json({ error: "Failed to fetch customer details" });
    }
});


// GET ALL CUSTOMERS
router.get("/customers", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM customers ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("CUSTOMER FETCH ERROR:", err);
        res.status(500).json({ error: "Failed to load customers" });
    }
});


// GET PRODUCTS
router.get("/products", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products ORDER BY description ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("PRODUCT FETCH ERROR:", err);
        res.status(500).json({ error: "Failed to load products" });
    }
});


// NEXT ORDER ID
router.get("/next-id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT nextval('orders_order_id_seq') AS next_id"
        );
        res.json({ order_id: result.rows[0].next_id });
    } catch (err) {
        console.error("NEXT ID ERROR:", err);
        res.status(500).json({ error: "Failed to get next order ID" });
    }
});


// GET ONE ORDER
router.get("/:order_id", async (req, res) => {
    const { order_id } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM orders WHERE order_id = $1",
            [order_id]
        );

        if (result.rows.length === 0) {
            return res.json(null);
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("ORDER FETCH ERROR:", err);
        res.status(500).json({ error: "Failed to fetch order" });
    }
});


// GET ALL ORDERS
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM orders ORDER BY order_id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


// UPDATE ORDER STATUS
router.put("/status/:order_id", async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;

    try {
        await pool.query(
            `UPDATE orders SET status = $1 WHERE order_id = $2`,
            [status, order_id]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
});


// CONFIRM ORDER + CREATE DELIVERY NOTE
router.post("/confirm/:order_id", async (req, res) => {
    let { order_id } = req.params;
    const { driver_name, items } = req.body;

    order_id = parseInt(order_id);

    if (!order_id) {
        return res.status(400).json({ error: "Invalid order ID" });
    }

    if (!driver_name) {
        return res.status(400).json({ error: "Driver name is required" });
    }

    try {
        const orderRes = await pool.query(
            `SELECT * FROM orders WHERE order_id = $1`,
            [order_id]
        );

        if (orderRes.rows.length === 0) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = orderRes.rows[0];

        // Update order status + assign driver
        await pool.query(
            `UPDATE orders SET status = 'Out for Delivery', driver_name = $2 WHERE order_id = $1`,
            [order_id, driver_name]
        );

        // Insert delivery note (FIXED)
        await pool.query(
            `INSERT INTO delivery_notes 
            (order_id, customer_name, customer_email, address, items, driver_name, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
                order.order_id,
                order.customer_name,
                order.email,
                order.address,
                JSON.stringify(items),
                driver_name   // ⭐ FIXED — was order.comments before
            ]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("CONFIRM ORDER ERROR:", err);
        res.status(500).json({ success: false });
    }
});


// ⭐ DRIVER ORDERS ROUTE (USED BY DRIVER DASHBOARD)
router.get("/driver/:driverName", async (req, res) => {
    const { driverName } = req.params;

    try {
        const result = await pool.query(
            `SELECT order_id, customer_name, address, comments, status
             FROM orders
             WHERE driver_name = $1
             ORDER BY order_id DESC`,
            [driverName]
        );

        res.json(result.rows);

    } catch (err) {
        console.error("DRIVER ORDERS ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// ⭐ Duplicate route kept (because you asked NOT to delete anything)
router.get("/driver/:driverName", async (req, res) => {
    const { driverName } = req.params;

    try {
        const result = await pool.query(
            "SELECT * FROM orders WHERE driver_name = $1",
            [driverName]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
