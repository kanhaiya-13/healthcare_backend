const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const connection = require("../db");
const verifyToken = require("./verifyToken");
require("dotenv").config();

// Endpoint to create a doctor's slot
router.post("/create-slot", verifyToken, async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "doctor") {
            return res.status(403).json({ message: "Access denied. Only doctors can create slots." });
        }

        const userId = decoded.user_id;
        const { title, date, startTime, endTime, duration } = req.body;

        if (!title || !date || !startTime || !endTime || !duration) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const query = `SELECT doctor_id, hospital_id FROM doctors WHERE user_id = ?`;
        const [rows] = await connection.promise().query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        const { doctor_id, hospital_id } = rows[0];
        const insertQuery = `
            INSERT INTO doctor_slots (doctor_id, hospital_id, visit_Motive, appointment_date, start_time, end_time, slot_Min)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await connection.promise().query(insertQuery, [
            doctor_id,
            hospital_id,
            title,
            date,
            startTime,
            endTime,
            duration
        ]);

        res.status(201).json({ message: "Slot created successfully." });
    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});

// Endpoint to get booked slots
router.get("/get-booked-slots", verifyToken, async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "doctor") {
            return res.status(403).json({ message: "Access denied. Only doctors can view booked slots." });
        }

        const userId = decoded.user_id;
        const query = `SELECT doctor_id, hospital_id FROM doctors WHERE user_id = ?`;
        const [rows] = await connection.promise().query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Doctor not found." });
        }

        const { doctor_id, hospital_id } = rows[0];
        const slotsQuery = `SELECT * FROM doctor_slots WHERE doctor_id = ? AND hospital_id = ?`;
        const [slots] = await connection.promise().query(slotsQuery, [doctor_id, hospital_id]);

        if (slots.length === 0) {
            return res.status(404).json({ message: "No slots available for the doctor." });
        }

        //in response send start_time, end_time, appointment_date, and slot_Min
        console.log(slots);
        res.status(200).json({ "slots": slots });

    } catch (error) {
        res.status(500).json({ message: "Internal server error." });
    }
});


module.exports = router;
