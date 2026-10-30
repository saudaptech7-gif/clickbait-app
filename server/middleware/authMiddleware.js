const crypto = require("crypto");
const User = require("../models/User");

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    throw new Error("Invalid token.");
  }

  const [payloadPart, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadPart)
    .digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(
    Buffer.from(payloadPart, "base64url").toString("utf8"),
  );

  if (!payload.id || !payload.exp || payload.exp < Date.now()) {
    throw new Error("Token expired or invalid.");
  }

  return payload;
}

async function protect(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login to continue.",
      });
    }

    const token = authorization.slice(7);
    const payload = verifyToken(token);

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session invalid or expired. Please login again.",
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required.",
    });
  }

  next();
}

module.exports = { protect, adminOnly, verifyToken };
