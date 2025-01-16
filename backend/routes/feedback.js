const express = require("express");
const router = express.Router();
const connection = require("../db");

router.get("/", (req, res) => {
  connection.query("SELECT * FROM Feedback", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

router.get("/get", (req, res) => {
  const { feedback_id } = req.body;

  connection.query(
    "SELECT * FROM Feedback WHERE feedback_id = ?",
    [feedback_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Feedback not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

router.post("/create", (req, res) => {
  const { patient_id, doctor_id, rating, comments } = req.body;

  const query = `
    INSERT INTO Feedback (patient_id, doctor_id, rating, comments)
    VALUES (?, ?, ?, ?)
  `;
  const values = [patient_id, doctor_id, rating, comments || null];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Feedback added successfully",
        feedback_id: results.insertId,
      });
    }
  });
});

router.put("/update", (req, res) => {
  const { feedback_id, patient_id, doctor_id, rating, comments } = req.body;

  const query = `
    UPDATE Feedback 
    SET patient_id = ?, doctor_id = ?, rating = ?, comments = ?
    WHERE feedback_id = ?
  `;
  const values = [patient_id, doctor_id, rating, comments || null, feedback_id];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Feedback not found" });
    } else {
      res.status(200).json({ message: "Feedback updated successfully" });
    }
  });
});

router.delete("/delete", (req, res) => {
  const { feedback_id } = req.body;

  connection.query(
    "DELETE FROM Feedback WHERE feedback_id = ?",
    [feedback_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Feedback not found" });
      } else {
        res.status(200).json({ message: "Feedback deleted successfully" });
      }
    }
  );
});

router.get("/by-patient", (req, res) => {
  const { patient_id } = req.body;

  connection.query(
    "SELECT * FROM Feedback WHERE patient_id = ?",
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

router.get("/by-doctor", (req, res) => {
  const { doctor_id } = req.body;

  connection.query(
    "SELECT * FROM Feedback WHERE doctor_id = ?",
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

module.exports = router;
