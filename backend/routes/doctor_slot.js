const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const connection = require("../db"); // Import the database connection
const mysql = require("mysql2/promise"); // Use mysql2 for async/await support
const verifyToken = require("./verifyToken"); // Import the verifyToken middleware
require('dotenv').config();

router.post("/create-slot", verifyToken, async (req, res) => {
  try {
    console.log("Request received for creating slots.");

    // Extract user_id from the token (via middleware)
    const user_id = req.user.user_id; // Assuming the token was verified and user data is in req.user
    console.log("Extracted user_id from token:", user_id);

    // Query to get doctor_id and hospital_id based on user_id
    const doctorQ = "SELECT doctor_id, hospital_id FROM doctors WHERE user_id = ?";
    const [doctorResults] = await connection.execute(doctorQ, [user_id]);
    console.log("Doctor query results:", doctorResults);

    if (doctorResults.length === 0) {
      console.error("Doctor not found for the given user_id:", user_id);
      return res.status(404).json({ message: "Doctor not found for the given user_id." });
    }

    const { doctor_id, hospital_id } = doctorResults[0];
    console.log("Found doctor_id:", doctor_id, "and hospital_id:", hospital_id);

    // Now process each slot in the array received from frontend
    const slots = req.body; // Assuming the frontend sends an array of slot objects
    console.log("Received slots from frontend:", slots);

    // Validate that the array is not empty
    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ message: "No slots provided or invalid format." });
    }

    // Prepare the slots with doctor_id and hospital_id added
    const slotsWithDoctorHospital = slots.map((slot) => ({
      ...slot,
      doctor_id,
      hospital_id
    }));
    console.log("Prepared slots with doctor_id and hospital_id:", slotsWithDoctorHospital);

    // Insert each slot into the database
    const slotQ =
      "INSERT INTO doctor_slot (doctor_id, hospital_id, appointment_date, start_time, end_time) VALUES (?, ?, ?, ?, ?)";
    
    // Use a batch insert to optimize the database calls
    const insertPromises = slotsWithDoctorHospital.map((slot) => {
      const { appointment_date, start_time, end_time, doctor_id, hospital_id } = slot;
      console.log(`Inserting slot: ${appointment_date}, ${start_time} - ${end_time}, doctor_id: ${doctor_id}, hospital_id: ${hospital_id}`);
      return connection.execute(slotQ, [doctor_id, hospital_id, appointment_date, start_time, end_time]);
    });

    // Wait for all inserts to complete
    await Promise.all(insertPromises);
    console.log("All slots inserted successfully.");

    res.json({ message: "Slots added successfully!" });
  } catch (err) {
    console.error("Error occurred while adding slots:", err);
    res.status(500).json({ message: "Error adding slots.", error: err.message });
  }
});


module.exports = router;
