const mysql = require("mysql2");
require("dotenv").config();

// Create a connection to the database
const connection = mysql.createConnection({
  host: "localhost", // XAMPP server is usually localhost
  user: "root", // Default MySQL user
  password: process.env.db_password, // Your MySQL root password (leave blank if none)
  database: "healthcare", // Your database name
  port: 3306, // Default MySQL port
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    return;
  }
  console.log("Connected to the MySQL database.");
});

module.exports = connection;
