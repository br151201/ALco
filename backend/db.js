const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'delivery_app',
  password: '1512',
  port: 5432,
});

module.exports = pool;
