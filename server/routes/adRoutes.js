const express = require("express");
const multer = require("multer");
const Ad = require("../models/Ad");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  text = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (insideQuotes && text[i + 1] === '"') {
        value += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }

      row.push(value.trim());

      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }

      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());

  if (row.some((cell) => cell !== "")) {
    rows.push(row);
  }

  if (rows.length < 2) {
    throw new Error("CSV file has no ad records.");
  }

  const headers = rows[0].map((header) => header.trim().toLowerCase());

  return rows.slice(1).map((cells) => {
    const record = {};

    headers.forEach((header, index) => {
      record[header] = cells[index] || "";
    });

    return record;
  });
}

function normalizeAd(record) {
  return {
    title: String(record.title || "").trim(),
    description: String(record.description || "").trim(),
    imageUrl: String(record.imageUrl || record.imageurl || "").trim(),
    productUrl: String(record.productUrl || record.producturl || "").trim(),
    dimensions: String(record.dimensions || "").trim(),
    status: ["active", "paused"].includes(
      String(record.status || "").toLowerCase(),
    )
      ? String(record.status).toLowerCase()
      : "active",
  };
}

function validateAd(ad) {
  if (!ad.imageUrl) {
    return "imageUrl is required.";
  }

  try {
    const imageUrl = new URL(ad.imageUrl);

    if (!["https:", "http:"].includes(imageUrl.protocol)) {
      return "imageUrl must use HTTP or HTTPS.";
    }
  } catch {
    return "imageUrl is not a valid URL.";
  }

  if (ad.productUrl) {
    try {
      const productUrl = new URL(ad.productUrl);

      if (!["https:", "http:"].includes(productUrl.protocol)) {
        return "productUrl must use HTTP or HTTPS.";
      }
    } catch {
      return "productUrl is not a valid URL.";
    }
  }

  return null;
}

// GET: Public users and admins can view ads
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: ads.length,
      ads,
    });
  } catch (error) {
    console.error("Fetch ads error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch ads.",
    });
  }
});

// POST: Create one ad (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const ad = normalizeAd(req.body);
    const validationError = validateAd(ad);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingAd = await Ad.findOne({
      imageUrl: ad.imageUrl,
    });

    if (existingAd) {
      return res.status(409).json({
        success: false,
        message: "An ad with this image URL already exists.",
      });
    }

    const savedAd = await Ad.create(ad);

    return res.status(201).json({
      success: true,
      message: "Ad created successfully.",
      ad: savedAd,
    });
  } catch (error) {
    console.error("Create ad error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create ad.",
    });
  }
});

// POST: Bulk upload JSON or CSV (Admin only)
router.post(
  "/bulk",
  protect,
  adminOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a JSON or CSV file.",
        });
      }

      const filename = req.file.originalname.toLowerCase();
      let records;

      if (filename.endsWith(".json")) {
        const parsed = JSON.parse(req.file.buffer.toString("utf8"));

        records = Array.isArray(parsed) ? parsed : parsed.ads;

        if (!Array.isArray(records)) {
          return res.status(400).json({
            success: false,
            message: "JSON must contain an array of ads.",
          });
        }
      } else if (filename.endsWith(".csv")) {
        records = parseCSV(req.file.buffer.toString("utf8"));
      } else {
        return res.status(400).json({
          success: false,
          message: "Only JSON and CSV files are supported.",
        });
      }

      if (records.length === 0) {
        return res.status(400).json({
          success: false,
          message: "The uploaded file contains no ads.",
        });
      }

      if (records.length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Upload a maximum of 5000 ads at a time.",
        });
      }

      let insertedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors = [];

      for (let index = 0; index < records.length; index++) {
        try {
          const ad = normalizeAd(records[index]);
          const validationError = validateAd(ad);

          if (validationError) {
            skippedCount++;

            if (errors.length < 20) {
              errors.push({
                row: index + 1,
                message: validationError,
              });
            }

            continue;
          }

          const existingAd = await Ad.findOne({
            imageUrl: ad.imageUrl,
          });

          if (existingAd) {
            if (ad.productUrl) {
              await Ad.updateOne(
                { _id: existingAd._id },
                { $set: { productUrl: ad.productUrl } },
                { runValidators: true },
              );

              updatedCount++;
            } else {
              skippedCount++;
            }

            continue;
          }

          await Ad.create(ad);
          insertedCount++;
        } catch (error) {
          skippedCount++;

          if (errors.length < 20) {
            errors.push({
              row: index + 1,
              message:
                error.code === 11000
                  ? "Duplicate image URL."
                  : "Could not save this ad.",
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Bulk upload processed.",
        total: records.length,
        insertedCount,
        updatedCount,
        skippedCount,
        errors,
      });
    } catch (error) {
      console.error("Bulk upload error:", error.message);

      return res.status(400).json({
        success: false,
        message:
          error instanceof SyntaxError
            ? "Invalid JSON file."
            : error.message || "Bulk upload failed.",
      });
    }
  },
);

// PATCH: Update an ad (Admin only)
router.patch("/:id", protect, adminOnly, async (req, res) => {
  try {
    const updates = {};

    [
      "title",
      "description",
      "imageUrl",
      "productUrl",
      "dimensions",
      "status",
    ].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      updates.status !== undefined &&
      !["active", "paused"].includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or paused.",
      });
    }

    if (updates.imageUrl !== undefined) {
      updates.imageUrl = String(updates.imageUrl).trim();
    }

    if (updates.productUrl !== undefined) {
      updates.productUrl = String(updates.productUrl).trim();
    }

    if (updates.imageUrl !== undefined || updates.productUrl !== undefined) {
      const currentAd = await Ad.findById(req.params.id);

      if (!currentAd) {
        return res.status(404).json({
          success: false,
          message: "Ad not found.",
        });
      }

      const validationError = validateAd({
        imageUrl: updates.imageUrl ?? currentAd.imageUrl,
        productUrl: updates.productUrl ?? currentAd.productUrl,
      });

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }
    }

    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found.",
      });
    }

    return res.json({
      success: true,
      message: "Ad updated successfully.",
      ad,
    });
  } catch (error) {
    console.error("Update ad error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Failed to update ad.",
    });
  }
});

// DELETE: Remove an ad (Admin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found.",
      });
    }

    return res.json({
      success: true,
      message: "Ad deleted successfully.",
    });
  } catch (error) {
    console.error("Delete ad error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Failed to delete ad.",
    });
  }
});

module.exports = router;
