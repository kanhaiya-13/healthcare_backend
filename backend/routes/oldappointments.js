const express = require("express");
const router = express.Router();
const connection = require("../db"); // Import database connection
const verifyToken = require("./verifyToken");

const jwt = require("jsonwebtoken"); // Add this import

// Apply verifyToken middleware to all routes
router.use(verifyToken);
// GET all appointments
router.get("/", (req, res) => {
  connection.query("SELECT * FROM Appointments", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET a specific appointment by ID
router.get("/get", (req, res) => {
  const { appointment_id } = req.body;

  connection.query(
    "SELECT * FROM Appointments WHERE appointment_id = ?",
    [appointment_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Appointment not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// CREATE a new appointment
router.post("/create", (req, res) => {
  const { patient_id, doctor_id, hospital_id, date_time, status, notes } =
    req.body;

  const query = `
    INSERT INTO Appointments (patient_id, doctor_id, hospital_id, date_time, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    patient_id,
    doctor_id,
    hospital_id || null,
    date_time,
    status || "Scheduled",
    notes || null,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Appointment added successfully",
        appointment_id: results.insertId,
      });
    }
  });
});

// UPDATE an existing appointment
router.put("/update", (req, res) => {
  const {
    appointment_id,
    patient_id,
    doctor_id,
    hospital_id,
    date_time,
    status,
    notes,
  } = req.body;

  const query = `
    UPDATE Appointments 
    SET patient_id = ?, doctor_id = ?, hospital_id = ?, date_time = ?, status = ?, notes = ?
    WHERE appointment_id = ?
  `;
  const values = [
    patient_id,
    doctor_id,
    hospital_id || null,
    date_time,
    status || "Scheduled",
    notes || null,
    appointment_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Appointment not found" });
    } else {
      res.status(200).json({ message: "Appointment updated successfully" });
    }
  });
});

// DELETE an appointment
router.delete("/delete", (req, res) => {
  const { appointment_id } = req.body;

  connection.query(
    "DELETE FROM Appointments WHERE appointment_id = ?",
    [appointment_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Appointment not found" });
      } else {
        res.status(200).json({ message: "Appointment deleted successfully" });
      }
    }
  );
});

// Additional route: GET appointments by patient
router.get("/by-patient", (req, res) => {
  const { patient_id } = req.body;

  connection.query(
    "SELECT * FROM Appointments WHERE patient_id = ?",
    [patient_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// Additional route: GET appointments by doctor
router.get("/by-doctor", (req, res) => {
  const { doctor_id } = req.body;

  connection.query(
    "SELECT * FROM Appointments WHERE doctor_id = ?",
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

// Additional route: GET appointments by status
router.get("/by-status", (req, res) => {
  const { status } = req.body;

  connection.query(
    "SELECT * FROM Appointments WHERE status = ?",
    [status],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

// Additional route: GET appointments by date range
router.get("/by-date-range", (req, res) => {
  const { start_date, end_date } = req.body;

  connection.query(
    "SELECT * FROM Appointments WHERE date_time BETWEEN ? AND ?",
    [start_date, end_date],
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
