require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

connectDB();

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/", (req, res)=>{
    res.status(200).json({message:"welcome to verifiy emal account"})
})

// Run
app.listen(process.env.PORT, () =>
    console.log(`Server running on PORT ${process.env.PORT}`)
);
