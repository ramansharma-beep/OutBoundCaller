require('dotenv').config();
const mysql = require('mysql2/promise');

let dbPassword = process.env.DB_PASSWORD || '';
if (dbPassword && ((dbPassword.startsWith('"') && dbPassword.endsWith('"')) || 
    (dbPassword.startsWith("'") && dbPassword.endsWith("'")))) {
  dbPassword = dbPassword.slice(1, -1);
}



const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: dbPassword,
    database: process.env.DB_NAME || 'outbound_caller',
    connectionLimit: 10, 
    queueLimit: 0,
    waitForConnections: true,
    connectTimeout: 10000,
    port: process.env.DB_PORT || 3306,
}

const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
    .then((connection) => {
        console.log("Connected to the database");
        connection.release();
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error.message);
        console.error("Please check your database configuration in .env file");
        // Don't exit the process, but log the error
    });

module.exports = pool;

