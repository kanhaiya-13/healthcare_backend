const express = require("express");
const router = express.Router();
const connection = require("../db"); // Import database connection
const verifyToken = require("./verifyToken");

// JWT Secret - Ensure this matches the secret in your login route

// Apply verifyToken middleware to all routes
// router.use(verifyToken);

// GET all doctors
router.get("/", verifyToken, (req, res) => {
  console.log(userId);
  console.log(role);
  connection.query("SELECT * FROM doctors", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET a specific doctor by ID (Pass doctor_id in body)
router.get("/get", (req, res) => {
  const doctor_id = req.body;
  connection.query(
    "SELECT * FROM Doctors WHERE user_id = ?",
    [doctor_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Doctor not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// CREATE a new doctor
router.post("/create", (req, res) => {
  const {
    name,
    specialization,
    qualification,
    experience_years,
    contact_number,
    email,
    hospital_id,
    availability,
    consultation_fee,
    rating,
  } = req.body;

  const query = `
    INSERT INTO Doctors (name, specialization, qualification, experience_years, contact_number, email, hospital_id, availability, consultation_fee, rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    name,
    specialization,
    qualification,
    experience_years,
    contact_number,
    email,
    hospital_id,
    availability,
    consultation_fee,
    rating,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Doctor added successfully",
        doctor_id: results.insertId,
      });
    }
  });
});

// UPDATE an existing doctor (Pass doctor_id and fields to update in body)
router.put("/update", (req, res) => {
  const {
    doctor_id,
    name,
    specialization,
    qualification,
    experience_years,
    contact_number,
    email,
    hospital_id,
    availability,
    consultation_fee,
    rating,
  } = req.body;

  const query = `
    UPDATE Doctors 
    SET name = ?, specialization = ?, qualification = ?, experience_years = ?, contact_number = ?, email = ?, hospital_id = ?, availability = ?, consultation_fee = ?, rating = ?
    WHERE doctor_id = ?
  `;
  const values = [
    name,
    specialization,
    qualification,
    experience_years,
    contact_number,
    email,
    hospital_id,
    availability,
    consultation_fee,
    rating,
    doctor_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Doctor not found" });
    } else {
      res.status(200).json({ message: "Doctor updated successfully" });
    }
  });
});

// DELETE a doctor (Pass doctor_id in body)
router.delete("/delete", (req, res) => {
  const { doctor_id } = req.body;

  connection.query(
    "DELETE FROM Doctors WHERE doctor_id = ?",
    [doctor_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Doctor not found" });
      } else {
        res.status(200).json({ message: "Doctor deleted successfully" });
      }
    }
  );
});

module.exports = router;
