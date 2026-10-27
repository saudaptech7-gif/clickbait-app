require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const adsRoutes = require("./routes/adRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://YOUR-ACTUAL-FRONTEND.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Clickbait App API is running!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working correctly",
  });
});

app.use("/api/ads", adsRoutes);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Clickbait backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "Server startup failed because MongoDB is unavailable.",
      error.message,
    );

    process.exit(1);
  }
};

startServer();
