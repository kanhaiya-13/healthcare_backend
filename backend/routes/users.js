const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); // Ensure this line is present
const connection = require("../db"); // Import the database connection
const bcrypt = require("bcrypt"); // For hashing the password
const mysql = require("mysql2/promise"); // Use mysql2 for async/await support
const verifyToken = require("./verifyToken"); // Import the verifyToken middleware
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET; // Secret key for JWT

const JWT_EXPIRY = "30m"; // Token expiration time

// GET all users
router.get("/", (req, res) => {
  connection.query(
    "SELECT user_id, email, role, is_active, created_at FROM Users",
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// GET a specific user by ID

//if token verified then based on the role of the user fetch the specific user details from the respective table

router.get("/verify", verifyToken, (req, res) => {
  const { user_id, role } = req.user;

  // Map role to the corresponding table name
  const roleToTableMap = {
    doctor: "doctors",
    patient: "patients",
    receptionist: "receptionists",
  };

  // Get the table name based on the role
  const tableName = roleToTableMap[role];

  if (!tableName) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Query the database
  connection.query(
    `SELECT * FROM ${tableName} WHERE user_id = ?`,
    [user_id],
    (err, results) => {
      if (err) {
        console.error(`Error fetching data for role ${role}:`, err.message);
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Format the response
      const userData = results[0]; // Assuming only one record per `user_id`

      res.status(200).json({
        isLoggedIn: true,
        user: {
          ...userData,
          role, // Include role explicitly in the response
        },
      });
    }
  );
});
// User Logout
router.post("/logout", verifyToken, (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    // Optionally, you can manually clear the session cookie if required
    res.clearCookie("connect.sid", { path: "/" });

    // Inform the client to remove the JWT token (handled client-side)
    res.status(200).json({ message: "Logout successful" });
  });
});

// CREATE a new user
router.post("/create", async (req, res) => {
  const { email, password, role } = req.body;

  // Check if email, password, and role are provided
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Email, password, and role are required" });
  }

  try {
    // Check if user already exists
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (checkErr, checkResults) => {
        if (checkErr) {
          console.error("Error in SELECT query:", checkErr.message);
          return res.status(500).json({ error: checkErr.message });
        }

        if (checkResults.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        let hashedPassword;
        try {
          const saltRounds = 10;
          hashedPassword = await bcrypt.hash(password, saltRounds);
        } catch (hashErr) {
          console.error("Error hashing password:", hashErr.message);
          return res.status(500).json({ error: "Error processing password" });
        }

        // Insert new user into the `users` table
        const query = `INSERT INTO Users (email, password, role) VALUES (?, ?, ?)`;
        const values = [email, hashedPassword, role];

        connection.query(query, values, (err, results) => {
          if (err) {
            console.error("Error in INSERT query:", err.message);
            return res.status(500).json({ error: err.message });
          }

          const userId = results.insertId; // Get the inserted user ID

          // Insert into the respective role table
          let roleQuery = "";
          const roleValues = [userId, email];

          if (role === "doctor") {
            roleQuery = `INSERT INTO doctors (user_id, email) VALUES (?, ?)`;
          } else if (role === "patient") {
            roleQuery = `INSERT INTO patients (user_id, email) VALUES (?, ?)`;
          } else if (role === "receptionist") {
            roleQuery = `INSERT INTO receptionists (user_id, email) VALUES (?, ?)`;
          } else {
            return res.status(400).json({ message: "Invalid role" });
          }

          console.log("role query: ", roleQuery);
          console.log("role values: ", roleValues);

          connection.query(roleQuery, roleValues, (roleErr) => {
            if (roleErr) {
              console.error("Error in role INSERT query:", roleErr.message);
              return res.status(500).json({ error: roleErr.message });
            }

            // Success response
            res.status(201).json({
              message: "User added successfully",
              user_id: userId,
              email: email,
              role: role,
            });
          });
        });
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE an existing user
router.put("/update", (req, res) => {
  const { user_id, email, role, is_active } = req.body;

  const query = `
    UPDATE Users 
    SET email = ?, role = ?, is_active = ?
    WHERE user_id = ?
  `;
  const values = [email, role, is_active, user_id];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json({ message: "User updated successfully" });
    }
  });
});

// DELETE a user
router.delete("/delete", (req, res) => {
  const { user_id } = req.body;

  connection.query(
    "DELETE FROM Users WHERE user_id = ?",
    [user_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json({ message: "User deleted successfully" });
      }
    }
  );
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  connection.query(
    "SELECT * FROM Users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const user = results[0];

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // session creation for doctors
      console.log(user.role);
      if (user.role == "doctor") {
        connection.query(
          "SELECT * FROM doctors where user_id=?",
          [user.user_id],
          (err, results1) => {
            if (err) {
              console.log("err in fetching doctor info");
            }
            const doctor = results1[0];
            // console.log(doctor);
            // creating session storing doctor data
            req.session.user = {
              id: user.user_id,
              role: user.role,
              doctor_id: doctor.doctor_id,
              hospital_id: doctor.hospital_id,
              name: doctor.name,
              specialization: doctor.specialization,
              qualification: doctor.qualification,
              email: doctor.email,
              hospital_id: doctor.hospital_id,
            };

            // Generate JWT
            const token = jwt.sign(
              {
                user_id: user.user_id, // Use the primary key from your database
                role: user.role, // Include user role in the token
                email: user.email,
              },
              JWT_SECRET,
              { expiresIn: JWT_EXPIRY }
            );

            // Update last login
            connection.query(
              "UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
              [user.user_id],

              (updateErr) => {
                if (updateErr) {
                  console.error("Failed to update last login:", updateErr);
                }
              }
            );

            // Determine the redirect URL based on user role
            let redirectUrl = "";
            if (user.role === "doctor") {
              redirectUrl = "/frontend/html/doctor/dashBoard.html"; // Doctor dashboard
            } else if (user.role === "patient") {
              redirectUrl = "/html/patient/dashBoard.html"; // Patient dashboard
            } else {
              return res.status(403).json({ message: "Unauthorized Role" });
            }

            res.status(200).json({
              message: "Login successful",
              user_id: user.user_id,
              email: user.email,
              token: token,
              role: user.role,
              redirectUrl: redirectUrl,
            });
          }
        );
      }
    }
  );
});

// Redirect Endpoint
// router.get("/redirect", verifyToken, (req, res) => {
//   const { role } = req.user; // Extract role from the decoded JWT token

//   console.log("Decoded user role:", role);

//   let redirectUrl = "";
//   if (role === "doctor") {
//     redirectUrl = "/html/doctor/dashBoard.html"; // Doctor dashboard
//   } else if (role === "patient") {
//     redirectUrl = "/html/patient/dashBoard.html"; // Patient dashboard
//   } else {
//     return res.status(403).json({ message: "Unauthorized Role" });
//   }

//   console.log("Redirect URL:", redirectUrl);
//   res.json({ redirectUrl }); // Send the URL back as part of the response
// });

module.exports = router;

// const bcrypt = require("bcrypt");
// const db = require("../config/database");

// // Create User
// exports.createUser = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     // Check if user already exists
//     const [existingUsers] = await db.query(
//       "SELECT * FROM Users WHERE email = ?",
//       [email]
//     );

//     if (existingUsers.length > 0) {
//       return res.status(400).json({
//         message: "User already exists",
//       });
//     }

//     // Hash password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Insert user
//     const [result] = await db.query(
//       "INSERT INTO Users (email, password, role) VALUES (?, ?, ?)",
//       [email, hashedPassword, role]
//     );

//     res.status(201).json({
//       message: "User created successfully",
//       userId: result.insertId,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error creating user",
//       error: error.message,
//     });
//   }
// };

// // Get All Users
// exports.getAllUsers = async (req, res) => {
//   try {
//     const [users] = await db.query(
//       "SELECT user_id, email, role, is_active, created_at FROM Users"
//     );
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching users",
//       error: error.message,
//     });
//   }
// };

// // Get User by ID
// exports.getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [users] = await db.query(
//       "SELECT user_id, email, role, is_active, created_at FROM Users WHERE user_id = ?",
//       [id]
//     );

//     if (users.length === 0) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     res.status(200).json(users[0]);
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching user",
//       error: error.message,
//     });
//   }
// };

// // Update User
// exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { email, role, is_active } = req.body;

//     // Check if user exists
//     const [existingUsers] = await db.query(
//       "SELECT * FROM Users WHERE user_id = ?",
//       [id]
//     );

//     if (existingUsers.length === 0) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     // Update user
//     await db.query(
//       "UPDATE Users SET email = ?, role = ?, is_active = ? WHERE user_id = ?",
//       [email, role, is_active, id]
//     );

//     res.status(200).json({
//       message: "User updated successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error updating user",
//       error: error.message,
//     });
//   }
// };

// // Delete User
// exports.deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if user exists
//     const [existingUsers] = await db.query(
//       "SELECT * FROM Users WHERE user_id = ?",
//       [id]
//     );

//     if (existingUsers.length === 0) {
//       return res.status(404).json({
//         message: "User not found",
//       });
//     }

//     // Delete user
//     await db.query("DELETE FROM Users WHERE user_id = ?", [id]);

//     res.status(200).json({
//       message: "User deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error deleting user",
//       error: error.message,
//     });
//   }
// };

// // User Login
// exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [
//       email,
//     ]);

//     if (users.length === 0) {
//       return res.status(400).json({
//         message: "Invalid credentials",
//       });
//     }

//     const user = users[0];

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({
//         message: "Invalid credentials",
//       });
//     }

//     // Update last login
//     await db.query(
//       "UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?",
//       [user.user_id]
//     );

//     res.status(200).json({
//       message: "Login successful",
//       userId: user.user_id,
//       role: user.role,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Login error",
//       error: error.message,
//     });
//   }
// };
