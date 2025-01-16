const express = require("express");
const router = express.Router();
const connection = require("../db"); // Import database connection

// GET all patients
router.get("/", (req, res) => {
  connection.query("SELECT * FROM Patients", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET a specific patient by ID
router.get("/get", (req, res) => {
  const { patient_id } = req.body;

  connection.query(
    "SELECT * FROM Patients WHERE patient_id = ?",
    [patient_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Patient not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// CREATE a new patient
router.post("/create", (req, res) => {
  const {
    name,
    age,
    gender,
    contact_number,
    email,
    address,
    medical_history,
    current_medication,
    doctor_id,
    hospital_id,
  } = req.body;

  const query = `
    INSERT INTO Patients (name, age, gender, contact_number, email, address, medical_history, current_medication, doctor_id, hospital_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    name,
    age,
    gender,
    contact_number,
    email,
    address,
    medical_history,
    current_medication,
    doctor_id || null,
    hospital_id || null,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Patient added successfully",
        patient_id: results.insertId,
      });
    }
  });
});

// UPDATE an existing patient
router.put("/update", (req, res) => {
  const {
    patient_id,
    name,
    age,
    gender,
    contact_number,
    email,
    address,
    medical_history,
    current_medication,
    doctor_id,
    hospital_id,
  } = req.body;

  const query = `
    UPDATE Patients 
    SET name = ?, age = ?, gender = ?, contact_number = ?, email = ?, address = ?, 
    medical_history = ?, current_medication = ?, doctor_id = ?, hospital_id = ?
    WHERE patient_id = ?
  `;
  const values = [
    name,
    age,
    gender,
    contact_number,
    email,
    address,
    medical_history,
    current_medication,
    doctor_id || null,
    hospital_id || null,
    patient_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Patient not found" });
    } else {
      res.status(200).json({ message: "Patient updated successfully" });
    }
  });
});

// DELETE a patient
router.delete("/delete", (req, res) => {
  const { patient_id } = req.body;

  connection.query(
    "DELETE FROM Patients WHERE patient_id = ?",
    [patient_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Patient not found" });
      } else {
        res.status(200).json({ message: "Patient deleted successfully" });
      }
    }
  );
});

// Additional route: GET patients by doctor
router.get("/by-doctor", (req, res) => {
  const { doctor_id } = req.body;

  connection.query(
    "SELECT * FROM Patients WHERE doctor_id = ?",
    [doctor_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// Additional route: GET patients by hospital
router.get("/by-hospital", (req, res) => {
  const { hospital_id } = req.body;

  connection.query(
    "SELECT * FROM Patients WHERE hospital_id = ?",
    [hospital_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

module.exports = router;
