const express = require("express");
const router = express.Router();
const connection = require("../db");

// 📌 Get all prescriptions
// router.get("/", (req, res) => {
//   connection.query("SELECT * FROM Prescriptions", (err, results) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(200).json(results);
//     }
//   });
// });

// 📌 Get a specific prescription by ID
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

// 📌 Create a new prescription
router.post("/", (req, res) => {
  const hospital_id = req.session.user.hospital_id;
  const {
    patient_id,
    doctor_id,
    prescription_date,
    patient_name,
    patient_age,
    patient_gender,
    patient_contact,
    bp_reading,
    pulse_rate,
    weight,
    spo2,
    diagnosis,
    system_examination,
    patient_complaints,
    referring_doctor, // Added field
    prescribing_doctor_name,
    doctor_qualifications,
    doctor_registration_number,
    notes,
    follow_up_date,
  } = req.body;

  const query = `
    INSERT INTO Prescriptions (
      patient_id, doctor_id, hospital_id, prescription_date, patient_name, 
      patient_age, patient_gender, patient_contact, bp_reading, pulse_rate, 
      weight, spo2, diagnosis, system_examination, patient_complaints, 
      referring_doctor, prescribing_doctor_name, doctor_qualifications, doctor_registration_number, 
      notes, follow_up_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
  `;

  const values = [
    patient_id,
    doctor_id,
    hospital_id || null,
    prescription_date,
    patient_name,
    patient_age,
    patient_gender,
    patient_contact,
    bp_reading,
    pulse_rate,
    weight,
    spo2,
    diagnosis,
    system_examination,
    patient_complaints,
    referring_doctor,
    prescribing_doctor_name,
    doctor_qualifications,
    doctor_registration_number,
    notes,
    follow_up_date,
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

// 📌 Update an existing prescription
router.put("/update", (req, res) => {
  const {
    prescription_id,
    patient_id,
    doctor_id,
    hospital_id,
    prescription_date,
    patient_name,
    patient_age,
    patient_gender,
    patient_contact,
    bp_reading,
    pulse_rate,
    weight,
    spo2,
    diagnosis,
    system_examination,
    patient_complaints,
    prescribing_doctor_name,
    doctor_qualifications,
    doctor_registration_number,
    notes,
    follow_up_date,
  } = req.body;

  const query = `
    UPDATE Prescriptions SET 
      patient_id = ?, doctor_id = ?, hospital_id = ?, prescription_date = ?, 
      patient_name = ?, patient_age = ?, patient_gender = ?, patient_contact = ?, 
      bp_reading = ?, pulse_rate = ?, weight = ?, spo2 = ?, diagnosis = ?, 
      system_examination = ?, patient_complaints = ?, prescribing_doctor_name = ?, 
      doctor_qualifications = ?, doctor_registration_number = ?, notes = ?, 
      follow_up_date = ? 
    WHERE prescription_id = ?
  `;

  const values = [
    patient_id,
    doctor_id,
    hospital_id || null,
    prescription_date,
    patient_name,
    patient_age,
    patient_gender,
    patient_contact,
    bp_reading,
    pulse_rate,
    weight,
    spo2,
    diagnosis,
    system_examination,
    patient_complaints,
    prescribing_doctor_name,
    doctor_qualifications,
    doctor_registration_number,
    notes,
    follow_up_date,
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

// 📌 Delete a prescription
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

// 📌 Get prescriptions by patient ID
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

// 📌 Get prescriptions by doctor ID
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
