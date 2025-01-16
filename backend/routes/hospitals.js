const express = require("express");
const router = express.Router();
const connection = require("../db"); // Import database connection

// GET all hospitals
router.get("/", (req, res) => {
  connection.query("SELECT * FROM Hospitals", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET a specific hospital by ID
router.get("/get", (req, res) => {
  const { hospital_id } = req.body;

  connection.query(
    "SELECT * FROM Hospitals WHERE hospital_id = ?",
    [hospital_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Hospital not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// CREATE a new hospital
router.post("/create", (req, res) => {
  const {
    name,
    location,
    contact_number,
    email,
    specializations_offered,
    total_beds,
    available_beds,
    hospital_type,
  } = req.body;

  const query = `
    INSERT INTO Hospitals (name, location, contact_number, email, specializations_offered, total_beds, available_beds, hospital_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    name,
    location,
    contact_number,
    email,
    specializations_offered,
    total_beds,
    available_beds,
    hospital_type,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Hospital added successfully",
        hospital_id: results.insertId,
      });
    }
  });
});

// UPDATE an existing hospital
router.put("/update", (req, res) => {
  const {
    hospital_id,
    name,
    location,
    contact_number,
    email,
    specializations_offered,
    total_beds,
    available_beds,
    hospital_type,
  } = req.body;

  const query = `
    UPDATE Hospitals 
    SET name = ?, location = ?, contact_number = ?, email = ?, specializations_offered = ?, total_beds = ?, available_beds = ?, hospital_type = ?
    WHERE hospital_id = ?
  `;
  const values = [
    name,
    location,
    contact_number,
    email,
    specializations_offered,
    total_beds,
    available_beds,
    hospital_type,
    hospital_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Hospital not found" });
    } else {
      res.status(200).json({ message: "Hospital updated successfully" });
    }
  });
});

// DELETE a hospital
router.delete("/delete", (req, res) => {
  const { hospital_id } = req.body;

  connection.query(
    "DELETE FROM Hospitals WHERE hospital_id = ?",
    [hospital_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Hospital not found" });
      } else {
        res.status(200).json({ message: "Hospital deleted successfully" });
      }
    }
  );
});

module.exports = router;
