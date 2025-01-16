const express = require("express");
const router = express.Router();
const connection = require("../db");

router.get("/", (req, res) => {
  connection.query("SELECT * FROM Billing", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

router.get("/get", (req, res) => {
  const { bill_id } = req.body;

  connection.query(
    "SELECT * FROM Billing WHERE bill_id = ?",
    [bill_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: "Bill not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

router.post("/create", (req, res) => {
  const { appointment_id, amount, payment_status, payment_date, payment_mode } =
    req.body;

  const query = `
    INSERT INTO Billing (appointment_id, amount, payment_status, payment_date, payment_mode)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    appointment_id,
    amount,
    payment_status || "Pending",
    payment_date || null,
    payment_mode || null,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({
        message: "Bill added successfully",
        bill_id: results.insertId,
      });
    }
  });
});

router.put("/update", (req, res) => {
  const {
    bill_id,
    appointment_id,
    amount,
    payment_status,
    payment_date,
    payment_mode,
  } = req.body;

  const query = `
    UPDATE Billing 
    SET appointment_id = ?, amount = ?, payment_status = ?, payment_date = ?, payment_mode = ?
    WHERE bill_id = ?
  `;
  const values = [
    appointment_id,
    amount,
    payment_status || "Pending",
    payment_date || null,
    payment_mode || null,
    bill_id,
  ];

  connection.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Bill not found" });
    } else {
      res.status(200).json({ message: "Bill updated successfully" });
    }
  });
});

router.delete("/delete", (req, res) => {
  const { bill_id } = req.body;

  connection.query(
    "DELETE FROM Billing WHERE bill_id = ?",
    [bill_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ message: "Bill not found" });
      } else {
        res.status(200).json({ message: "Bill deleted successfully" });
      }
    }
  );
});

router.get("/by-status", (req, res) => {
  const { payment_status } = req.body;

  connection.query(
    "SELECT * FROM Billing WHERE payment_status = ?",
    [payment_status],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(results);
      }
    }
  );
});

router.get("/by-appointment", (req, res) => {
  const { appointment_id } = req.body;

  connection.query(
    "SELECT * FROM Billing WHERE appointment_id = ?",
    [appointment_id],
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
