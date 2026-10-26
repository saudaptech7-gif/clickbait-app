
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Ad = require("../models/Ad");

const JSON_PATH = path.resolve(
  __dirname,
  "../../dataset-uploader/output/ads.json"
);

async function importAds() {
  try {
    if (!fs.existsSync(JSON_PATH)) {
      throw new Error(`JSON file not found: ${JSON_PATH}`);
    }

    const ads = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

    if (!Array.isArray(ads)) {
      throw new Error("ads.json must contain a JSON array.");
    }

    await connectDB();

    let inserted = 0;
    let skipped = 0;

    for (const item of ads) {
      if (!item.imageUrl || typeof item.imageUrl !== "string") {
        skipped++;
        continue;
      }

      const imageUrl = item.imageUrl.trim();

      const result = await Ad.updateOne(
        { imageUrl },
        {
          $setOnInsert: {
            title: item.title || "",
            description: item.description || "",
            imageUrl,
            dimensions: item.dimensions || "",
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else {
        skipped++;
      }
    }

    console.log(`Import complete. New ads: ${inserted}`);
    console.log(`Skipped existing/invalid ads: ${skipped}`);
    console.log(`Ads in JSON: ${ads.length}`);
  } catch (error) {
    console.error("Ads import failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

importAds();
