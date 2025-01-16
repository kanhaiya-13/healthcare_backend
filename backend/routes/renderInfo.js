const express = require("express");
const verifyToken = require("./verifyToken");
const router = express.Router();
const connection = require("../db");

router.get("/", verifyToken, (req, res) => {
  const user_id = req.cookies.user_id;
  const role = req.cookies.role;
  console.log(user_id);
  console.log(role);
  connection.query(
    `SELECT * from ${role}s where user_id=?`,
    [user_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (results.length === 0) {
        res.status(404).json({ message: `${role}s not found` });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

module.exports = router;
