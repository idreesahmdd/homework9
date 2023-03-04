const { Pool } = require("pg");
const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "movies_users",
    port: 5432,
});

module.exports = pool;
