const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load .env file
const JWT_SECRET = process.env.JWT_SECRET;  // Get the secret key from .env file

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  console.log("Middleware executed");  
  const token = req.cookies.token || req.headers["authorization"]?.split(" ")[1]; // Getting token from cookies or Authorization header

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Synchronous verification
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token Data:", decoded);
    req.user = decoded; // Attach user data to the request object
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
