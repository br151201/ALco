const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET ALL CUSTOMERS
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, address, email, phone FROM customers ORDER BY id DESC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("CUSTOMER FETCH ERROR:", error);
        res.status(500).json({ error: "Failed to load customers" });
    }
});


//NEW CUSTOMER

router.get("/find", async (req, res) => {
  const { name } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM customers WHERE name = $1",
      [name]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Search customers by name
router.get('/search/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const result = await pool.query(
            "SELECT id, name, email, address_line1, address_line2, city, postcode FROM customers WHERE name ILIKE $1 LIMIT 10",
            [`%${name}%`]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
