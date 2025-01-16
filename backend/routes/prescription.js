const express = require("express");
const router = express.Router();
const connection = require("../db");

router.get("/", (req, res) => {
  connection.query("SELECT * FROM Prescriptions", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

router.get("/get", (req, res) => {
  const { prescription_id } = req.body;

  connection.query(
    "SELECT * FROM Prescriptions WHERE prescription_id = ?",
    [prescription_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Prescription not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

router.post("/create", (req, res) => {
  const { patient_id, doctor_id, prescribed_medicines, dosage_instructions } =
    req.body;

  const query = `
    INSERT INTO Prescriptions (patient_id, doctor_id, prescribed_medicines, dosage_instructions)
    VALUES (?, ?, ?, ?)
  `;
  const values = [
    patient_id,
    doctor_id,
    prescribed_medicines,
    dosage_instructions || null,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Prescription added successfully",
        prescription_id: results.insertId,
      });
    }
  });
});

router.put("/update", (req, res) => {
  const {
    prescription_id,
    patient_id,
    doctor_id,
    prescribed_medicines,
    dosage_instructions,
  } = req.body;

  const query = `
    UPDATE Prescriptions 
    SET patient_id = ?, doctor_id = ?, prescribed_medicines = ?, dosage_instructions = ?
    WHERE prescription_id = ?
  `;
  const values = [
    patient_id,
    doctor_id,
    prescribed_medicines,
    dosage_instructions || null,
    prescription_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Prescription not found" });
    } else {
      res.status(200).json({ message: "Prescription updated successfully" });
    }
  });
});

router.delete("/delete", (req, res) => {
  const { prescription_id } = req.body;

  connection.query(
    "DELETE FROM Prescriptions WHERE prescription_id = ?",
    [prescription_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Prescription not found" });
      } else {
        res.status(200).json({ message: "Prescription deleted successfully" });
      }
    }
  );
});

router.get("/by-patient", (req, res) => {
  const { patient_id } = req.body;

  connection.query(
    "SELECT * FROM Prescriptions WHERE patient_id = ?",
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
    "SELECT * FROM Prescriptions WHERE doctor_id = ?",
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
