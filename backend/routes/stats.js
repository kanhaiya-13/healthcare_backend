const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); // Ensure this line is present
const connection = require("../db"); // Import the database connection
const mysql = require("mysql2/promise"); // Use mysql2 for async/await support
const verifyToken = require("./verifyToken"); // Import the verifyToken middleware
require("dotenv").config();

router.get("/patients", verifyToken, async (req, res) => {
  const doctor_id = req.session.user.doctor_id;
  try {
    // Query for total patients
    const [totalPatientsResult] = await connection.promise().query(
      `
        SELECT COUNT(DISTINCT patient_id) AS total_patients_visited
        FROM Appointments
        WHERE MONTH(appointment_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
          AND YEAR(appointment_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
          AND doctor_id = ?;
    `,
      [doctor_id]
    );
    const totalPatients = totalPatientsResult[0]?.total_patients_visited || 0;

    // Query for new patients
    const [newPatientsResult] = await connection.promise().query(`
        SELECT COUNT(DISTINCT A.patient_id) AS new_patients
        FROM Appointments A
        JOIN Patients P ON A.patient_id = P.patient_id
        WHERE MONTH(A.appointment_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
          AND YEAR(A.appointment_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
          AND NOT EXISTS (
            SELECT 1
            FROM Appointments B
            WHERE B.patient_id = A.patient_id
              AND B.appointment_date < DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')
          );
    `);
    const newPatients = newPatientsResult[0]?.new_patients || 0;

    // Query for repeated patients
    const [repeatedPatientsResult] = await connection.promise().query(`
        SELECT COUNT(DISTINCT A.patient_id) AS repeated_patients
        FROM Appointments A
        JOIN Patients P ON A.patient_id = P.patient_id
        WHERE MONTH(A.appointment_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
          AND YEAR(A.appointment_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
          AND EXISTS (
            SELECT 1
            FROM Appointments B
            WHERE B.patient_id = A.patient_id
              AND B.appointment_date < DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')
          );
    `);
    const repeatedPatients = repeatedPatientsResult[0]?.repeated_patients || 0;

    console.log("total_patients", totalPatients, "new_patients", newPatients);

    res.json({ totalPatients, newPatients, repeatedPatients });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching statistics");
  }
});

router.get("/diagnosis", verifyToken, async (req, res) => {
  const { doctor_id } = req.query;

  try {
    const [results] = await connection.promise().query(
      `
        SELECT 
          diagnosis,
          COUNT(DISTINCT patient_id) AS number_of_patients
        FROM 
          Prescriptions
        WHERE 
          MONTH(prescription_date) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
          AND YEAR(prescription_date) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
          AND doctor_id = ?
        GROUP BY 
          diagnosis
        ORDER BY 
          number_of_patients DESC;
      `,
      [doctor_id]
    );

    res.json(results);
    console.log(results);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .send(
        "Error fetching diagnosis statistics for the given doctor last month"
      );
  }
});

module.exports = router;
