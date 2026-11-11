require("dotenv").config();

const mongoose = require("mongoose");
const Ad = require("./models/Ad");

async function checkAds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Database:", mongoose.connection.name);
    console.log("Model collection:", Ad.collection.name);

    const rawCount = await mongoose.connection.db
      .collection("ads")
      .countDocuments({});

    const modelCount = await Ad.countDocuments({});

    const activeCount = await Ad.countDocuments({
      status: "active",
    });

    const statusBreakdown = await mongoose.connection.db
      .collection("ads")
      .aggregate([
        {
          $group: {
            _id: "$status",
            total: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const samples = await mongoose.connection.db
      .collection("ads")
      .find({})
      .limit(3)
      .project({ title: 1, status: 1, imageUrl: 1 })
      .toArray();

    console.log("Raw collection count:", rawCount);
    console.log("Ad model count:", modelCount);
    console.log("Active ads:", activeCount);
    console.log("Status breakdown:", statusBreakdown);
    console.log("Sample ads:", samples);
  } catch (error) {
    console.log("ERROR:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAds();
