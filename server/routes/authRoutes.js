const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// PASSWORD HASHING
// =====================================

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

// =====================================
// PASSWORD VERIFICATION
// =====================================

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash || !/^[a-f0-9]{128}$/i.test(originalHash)) {
    return false;
  }

  const hash = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHash, "hex");

  return (
    hash.length === original.length && crypto.timingSafeEqual(hash, original)
  );
}

// =====================================
// CREATE AUTHENTICATION TOKEN
// =====================================

function createToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }

  const payload = Buffer.from(
    JSON.stringify({
      id: user._id.toString(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

// =====================================
// PUBLIC USER INFORMATION
// =====================================

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// =====================================
// SIGNUP
// POST /api/auth/signup
// =====================================

router.post("/signup", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please enter your name, email address, and password.",
      });
    }

    if (name.length > 80) {
      return res.status(400).json({
        message: "Name cannot be longer than 80 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword(password),

      // Public signup can NEVER create an admin.
      role: "user",
    });

    return res.status(201).json({
      message: "Your account has been created successfully.",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email address already exists.",
      });
    }

    console.error("Signup Error:", error);

    return res.status(500).json({
      message: "Unable to create your account. Please try again later.",
    });
  }
});

// =====================================
// LOGIN
// POST /api/auth/login
// =====================================

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter both your email address and password.",
      });
    }

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        message: "Incorrect email address or password. Please try again.",
      });
    }

    return res.json({
      message: "You have logged in successfully.",
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Unable to log in. Please try again later.",
    });
  }
});

// =====================================
// GET CURRENT USER
// GET /api/auth/me
// =====================================

router.get("/me", protect, (req, res) => {
  return res.json({
    user: publicUser(req.user),
  });
});

module.exports = router;
