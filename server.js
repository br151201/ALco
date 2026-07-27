const express = require('express');
const cors = require('cors');

// ROUTES (declare each ONLY once)
const deliveriesRoute = require('./routes/orders');
const driversRoute = require('./routes/drivers');
const customerRoute = require("./routes/customers");
const signatureRoute = require("./routes/signature");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTE MOUNTING (each ONLY once)
app.use("/api/orders", require("./routes/orders"));
app.use('/api/deliveries', deliveriesRoute);
app.use('/api/drivers', driversRoute);
app.use('/api/customers', customerRoute);
app.use('/api/drivers', signatureRoute);   // signature belongs to drivers

// ROOT CHECK
app.get('/', (req, res) => {
    res.send('API is running...');
});

// START SERVER
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});
