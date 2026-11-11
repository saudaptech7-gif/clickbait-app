require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const adsRoutes = require("./routes/adRoutes");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://clickbait-app.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (health checks, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// Handle errors
app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Server error",
  });
});

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
