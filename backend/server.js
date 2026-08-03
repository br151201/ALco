const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static("../customer-tracking"));

// ROUTES
const orderRoutes = require("./routes/orders");
const driverRoutes = require("./routes/drivers");
const customersRoute = require('./routes/customers');
const deliveriesRoute = require('./routes/deliveryNotes');
const deliveryNotesRoutes = require("./routes/deliveryNotes");
const loginRoute = require("./routes/login");

// ⭐ Mount login route FIRST
app.use("/api/driver", loginRoute);

// ⭐ Mount other driver routes
app.use("/api/driver", driverRoutes);

// Other routes
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customersRoute);
app.use("/api/delivery-notes", deliveryNotesRoutes);
app.use("/api/delivery-notes", deliveriesRoute);

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(4000, "0.0.0.0", () => {
    console.log("Server running on all interfaces");
});
