const express = require("express");
const router = express.Router();
const connection = require("../db");
const mysql = require("mysql2/promise");

// CREATE - Add a new appointment
router.post("/create", async (req, res) => {
  try {
    const {
      patient_id,
      hospital_id,
      doctor_id,
      receptionist_id,
      appointment_date,
      appointment_time,
      status,
      notes,
    } = req.body;

    const query = `INSERT INTO appointments
            (patient_id, hospital_id, doctor_id, receptionist_id,
            appointment_date, appointment_time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const value = [
      patient_id,
      hospital_id,
      doctor_id,
      receptionist_id,
      appointment_date,
      appointment_time,
      status,
      notes,
    ];
    connection.query(query, value, (error, result) => {
      if (error) {
        res.json({
          error: error.message,
        });
      }
      res.status(201).json({
        message: "Appointment created successfully",
        appointmentId: result.insertId,
      });
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      message: "Error creating appointment",
      error: error.message,
    });
  }
});

// READ - Get all appointments
router.get("/", async (req, res) => {
  try {
    // const appointments = await connection.execute(`
    //         SELECT a.*,
    //                p.name as patient_name,
    //                d.name as doctor_name
    //         FROM Appointments a
    //         JOIN patients p ON a.patient_id = p.patient_id
    //         JOIN doctors d ON a.doctor_id = d.doctor_id
    //         WHERE 1=1
    //     `);
    // res.json(appointments);
    const query = `SELECT a.*,
                    p.name as patient_name,
                    d.name as doctor_name
             FROM Appointments a
             JOIN patients p ON a.patient_id = p.patient_id
             JOIN doctors d ON a.doctor_id = d.doctor_id
             WHERE 1=1`;
    connection.query(query, (error, result) => {
      if (error) {
        res.json(error);
      } else {
        res.json(result);
      }
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message,
    });
  }
});

// READ - Get single appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const [appointments] = await connection.execute(
      `
            SELECT
                a.*,
                p.name,
                h.name,
                d.name,
                r.name
            FROM Appointments a
            LEFT JOIN patients p ON a.patient_id = p.patient_id
            LEFT JOIN hospitals h ON a.hospital_id = h.hospital_id
            LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
            LEFT JOIN receptionists r ON a.receptionist_id = r.receptionist_id
            WHERE a.appointment_id = ?
        `,
      [req.params.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointments[0]);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      message: "Error fetching appointment",
      error: error.message,
    });
  }
});

// UPDATE - Update an existing appointment
router.put("/:id", async (req, res) => {
  try {
    const {
      patient_id,
      hospital_id,
      doctor_id,
      receptionist_id,
      appointment_date,
      appointment_time,
      status,
      notes,
    } = req.body;

    const [result] = await connection.execute(
      `UPDATE Appointments
            SET
                patient_id = ?,
                hospital_id = ?,
                doctor_id = ?,
                receptionist_id = ?,
                appointment_date = ?,
                appointment_time = ?,
                status = ?,
                notes = ?
            WHERE appointment_id = ?`,
      [
        patient_id,
        hospital_id,
        doctor_id,
        receptionist_id,
        appointment_date,
        appointment_time,
        status,
        notes,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment updated successfully",
      appointmentId: req.params.id,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      message: "Error updating appointment",
      error: error.message,
    });
  }
});

// DELETE - Delete an appointment
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await connection.execute(
      "DELETE FROM Appointments WHERE appointment_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment deleted successfully",
      appointmentId: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      message: "Error deleting appointment",
      error: error.message,
    });
  }
});

// Soft Update - Change appointment status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const [result] = await connection.execute(
      `UPDATE Appointments
            SET status = ?
            WHERE appointment_id = ?`,
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Appointment status updated successfully",
      appointmentId: req.params.id,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      message: "Error updating appointment status",
      error: error.message,
    });
  }
});

module.exports = router;
