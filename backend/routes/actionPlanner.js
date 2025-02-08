//working but only storing 1st slot from given slots and that to with wron start and end time.
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const connection = require("../db");
const verifyToken = require("./verifyToken");
const moment = require("moment-timezone");
require("dotenv").config();

// Endpoint to create a doctor's slot
router.post("/create-slot", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "doctor") {
      return res
        .status(403)
        .json({ message: "Access denied. Only doctors can create slots." });
    }
    const userId = decoded.user_id;
    const slotsArray = req.body;
    const { appointment_date, start_time, end_time } = slotsArray[0];
    console.log(slotsArray);

    if (!start_time || !end_time || !appointment_date) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const query = `SELECT doctor_id, hospital_id FROM doctors WHERE user_id = ?`;
    const [rows] = await connection.promise().query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const { doctor_id, hospital_id } = rows[0];
    const values = slotsArray.map((slot) => [
      doctor_id,
      hospital_id,
      slot.appointment_date,
      slot.start_time,
      slot.end_time, // Ensure `end_time` is part of schema
    ]);
    const insertQuery = `INSERT INTO doctor_slot (doctor_id, hospital_id, appointment_date, start_time, end_time) VALUES ?`;

    await connection.promise().query(insertQuery, [values]);

    res.status(201).json({ message: "Slot created successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// Endpoint to get booked slots
router.get("/get-booked-slots", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "doctor") {
      return res.status(403).json({
        message: "Access denied. Only doctors can view booked slots.",
      });
    }

    const userId = req.session.user.doctor_id;
    const query = `SELECT doctor_id, hospital_id FROM doctors WHERE user_id = ?`;
    const [rows] = await connection.promise().query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    const { doctor_id, hospital_id } = rows[0];
    const slotsQuery = `SELECT * FROM doctor_slot WHERE doctor_id = ? AND hospital_id = ?`;
    const [slots] = await connection
      .promise()
      .query(slotsQuery, [doctor_id, hospital_id]);

    if (slots.length === 0) {
      return res
        .status(404)
        .json({ message: "No slots available for the doctor." });
    }

    const formattedSlots = slots.map((slot) => ({
      start_time: slot.start_time,
      end_time: slot.end_time,
      appointment_date: moment(slot.appointment_date).format("YYYY-MM-DD"),
    }));
    //in response send start_time, end_time, appointment_date, and slot_Min
    res.status(200).json({ slots: formattedSlots });
  } catch (error) {
    res.status(500).json({ message: "Internal server error.", error: error });
  }
});

module.exports = router;
