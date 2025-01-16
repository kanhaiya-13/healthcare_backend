// const express = require("express");
// const router = express.Router();
// const connection = require("../db"); // Import database connection
// const jwt = require("jsonwebtoken"); // Make sure to install jsonwebtoken package
// const bcrypt = require("bcrypt");

// // Secret key for JWT - Store this in environment variables in a real application

// // User Login
// router.post("/", (req, res) => {
//   const { email, password } = req.body;

//   try {
//   connection.query(
//     "SELECT * FROM Users WHERE email = ?",
//     [email],
//     async (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }

//       if (results.length === 0) {
//         return res.status(400).json({ message: "Invalid credentials" });
//       }

//       const user = results[0];
//       // Compare passwords
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (!isMatch) {
//         return res.status(400).json({ message: "Invalid credentials" });
//       }

//       //jwt token generation

//       const token = jwt.sign(
//         {
//           user_id: user.user_id,
//           email: user.email,
//           role: user.role,
//         },
//         "kanu",
//         { expiresIn: "24h" }
//       );

//       // Update last login
//       connection.query(
//         "UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
//         [user.user_id],
//         (updateErr) => {
//           if (updateErr) {
//             console.error("Failed to update last login:", updateErr);
//           }
//         }
//       );
//       res
//       .cookie("token", token, {
//         httpOnly: true,
//         secure: false, // Use true in production (requires HTTPS)
//         maxAge: 3600000, // 1 hour in milliseconds
//       })
//       .json({
//         message: "Login successful",
//         role: user.role,
//       });
//     }
//   );
// } catch (error) {
//   console.error("Error during login:", error);
//   res.status(500).json({ message: "Internal Server Error" });
// }
// });

// // User Login Route
// router.post("/", (req, res) => {
//   const { email, password } = req.body;

//   // Validate input
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   // Query to find user by email and password (INSECURE - for temporary use only)
//   const query = "SELECT * FROM users WHERE email = ? AND password = ?";

//   connection.query(query, [email, password], (err, results) => {
//     if (err) {
//       console.error("Detailed Database Error:", err);
//       return res.status(500).json({
//         error: "Database error occurred",
//         details: err.message,
//         sqlMessage: err.sqlMessage,
//         sqlState: err.sqlState,
//       });
//     }

//     // Check if user exists
//     if (results.length === 0) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const user = results[0];

//     // Generate JWT token
//     const token = jwt.sign(
//       {
//         user_id: user.user_id,
//         email: user.email,
//         role: user.role,
//       },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     // Remove sensitive information before sending response
//     const { password: omit, ...userWithoutPassword } = user;

//     // Respond with token and user info
//     res.status(200).json({
//       message: "Login successful",
//       token: token,
//       user: userWithoutPassword,
//     });
//   });
// });

// router.post("/receptionistlogin", (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   const query = "SELECT * FROM receptionists WHERE email = ? AND password = ?";

//   connection.query(query, [email, password], (err, results) => {
//     if (err) {
//       console.error("Detailed Database Error:", err);
//       return res.status(500).json({
//         error: "Database error occurred",
//         details: err.message,
//         sqlMessage: err.sqlMessage,
//         sqlState: err.sqlState,
//       });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const user = results[0];

//     const token = jwt.sign(
//       {
//         user_id: user.user_id,
//         email: user.email,
//         role: user.role,
//       },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     const { password: omit, ...userWithoutPassword } = user;

//     res.status(200).json({
//       message: "Login successful",
//       token: token,
//       user: userWithoutPassword,
//     });
//   });
// });

// router.post("/patientlogin", (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   const query = "SELECT * FROM patients WHERE email = ? AND password = ?";

//   connection.query(query, [email, password], (err, results) => {
//     if (err) {
//       console.error("Detailed Database Error:", err);
//       return res.status(500).json({
//         error: "Database error occurred",
//         details: err.message,
//         sqlMessage: err.sqlMessage,
//         sqlState: err.sqlState,
//       });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const user = results[0];

//     const token = jwt.sign(
//       {
//         user_id: user.user_id,
//         email: user.email,
//         role: user.role,
//       },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     const { password: omit, ...userWithoutPassword } = user;

//     res.status(200).json({
//       message: "Login successful",
//       token: token,
//       user: userWithoutPassword,
//     });
//   });
// });

// // Example protected route using the verification middleware
// router.get("/protected", verifyToken, (req, res) => {
//   res.json({
//     message: "This is a protected route",
//     user: req.user,
//   });
// });

module.exports = router;
