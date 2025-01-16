const express = require("express");
const router = express.Router();
const connection = require("../db"); // Import database connection
const jwt = require("jsonwebtoken");
const verifyToken = require("./verifyToken").default;

// GET all receptionists
router.get("/", (req, res) => {
  connection.query("SELECT * FROM receptionists", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET a specific receptionist by ID (Pass receptionist_id in body)
router.get("/get", (req, res) => {
  const { receptionist_id } = req.body;

  connection.query(
    "SELECT * FROM receptionists WHERE receptionist_id = ?",
    [receptionist_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Receptionist not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// CREATE a new receptionist
router.post("/create", (req, res) => {
  const {
    first_name,
    last_name,
    email,
    contact_number,
    username,
    password,
    hospital_id,
    doctor_id,
    shift_timing,
  } = req.body;

  const query = `
    INSERT INTO receptionists (
      first_name, 
      last_name, 
      email, 
      contact_number, 
      username, 
      password, 
      hospital_id, 
      doctor_id, 
      shift_timing
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name,
    last_name,
    email,
    contact_number,
    username,
    password,
    hospital_id,
    doctor_id,
    shift_timing,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Receptionist added successfully",
        receptionist_id: results.insertId,
      });
    }
  });
});

// UPDATE an existing receptionist (Pass receptionist_id and fields to update in body)
router.put("/update", (req, res) => {
  const {
    receptionist_id,
    first_name,
    last_name,
    email,
    contact_number,
    username,
    password,
    hospital_id,
    doctor_id,
    shift_timing,
  } = req.body;

  const query = `
    UPDATE receptionists 
    SET 
      first_name = ?, 
      last_name = ?, 
      email = ?, 
      contact_number = ?, 
      username = ?, 
      password = ?, 
      hospital_id = ?, 
      doctor_id = ?, 
      shift_timing = ?
    WHERE receptionist_id = ?
  `;
  const values = [
    first_name,
    last_name,
    email,
    contact_number,
    username,
    password,
    hospital_id,
    doctor_id,
    shift_timing,
    receptionist_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Receptionist not found" });
    } else {
      res.status(200).json({ message: "Receptionist updated successfully" });
    }
  });
});

// DELETE a receptionist (Pass receptionist_id in body)
router.delete("/delete", (req, res) => {
  const { receptionist_id } = req.body;

  connection.query(
    "DELETE FROM receptionists WHERE receptionist_id = ?",
    [receptionist_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Receptionist not found" });
      } else {
        res.status(200).json({ message: "Receptionist deleted successfully" });
      }
    }
  );
});

module.exports = router;
