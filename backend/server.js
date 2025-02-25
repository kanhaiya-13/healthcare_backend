const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const mysql = require("mysql2");
const connection = require("./db");
const doctorsRoutes = require("./routes/doctors"); // Doctors CRUD routes
const hospitalsRoutes = require("./routes/hospitals");
const patientRoutes = require("./routes/patients");
const appointmentRoutes = require("./routes/appointments");
const prescriptionRoutes = require("./routes/prescription");
const feedbackRoutes = require("./routes/feedback");
const billingRoutes = require("./routes/billing");
// const login = require("./routes/login");
const cors = require("cors");
const usersRoutes = require("./routes/users");
const receptionistRoutes = require("./routes/receptionists");
const renderInfo = require("./routes/renderInfo");
const actionPlanner = require("./routes/actionPlanner");
// const clinic = require("./routes/clinic");
const cookieParser = require("cookie-parser");
const doctorSchedule = require("./routes/doctor_slot");
const clinicStats = require("./routes/stats");

const app = express();
app.use(
  cors({
    // , // Frontend origin
    origin: ["https://healthcareonline.netlify.app", "http://localhost:5500"],
    credentials: true, // Enable cookies and sessions
  })
);
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser());

const sessionStore = new MySQLStore({}, connection);

app.use(
  session({
    key: "session_id",
    secret: "kanhaiyaaa",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { Secure: false, sameSite: "Lax" }, //httpOnly: true,
  })
);

// Use individual routes
app.use("/users", usersRoutes);
// app.use("/clinic", clinic);
app.use("/doctors", doctorsRoutes);
app.use("/hospitals", hospitalsRoutes);
app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/prescription", prescriptionRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/billing", billingRoutes);
app.use("/receptionists", receptionistRoutes);
app.use("/renderInfo", renderInfo);
app.use("/actionPlanner", actionPlanner);
app.use("/schedule", doctorSchedule);
app.use("/doctors/stats/last-month", clinicStats);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
