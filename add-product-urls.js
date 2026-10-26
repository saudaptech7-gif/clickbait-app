
const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "ads.json");
const outputFile = path.join(__dirname, "ads-updated.json");

const productUrls = {
  0: "https://shop.organixx.com/products/magnesium-7",
  13: "https://www.logitech.com/en-us/products/combos/mx-keys-s-combo.920-011889.html",
  18: "https://www.adaptedmind.com/",
  27: "https://elements.envato.com/fonts",
  52: "https://seaguar.com/products/basix-fluoro",
  97: "https://www.homeserve.com/"
};

try {
  const ads = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  if (!Array.isArray(ads)) {
    throw new Error("ads.json mein JSON array hona chahiye.");
  }

  const updatedAds = ads.map((ad, index) => ({
    ...ad,
    productUrl: productUrls[index] || ""
  }));

  fs.writeFileSync(
    outputFile,
    JSON.stringify(updatedAds, null, 2),
    "utf8"
  );

  console.log(`Success! Total ads: ${updatedAds.length}`);
  console.log("Updated file: ads-updated.json");
} catch (error) {
  console.error("Error:", error.message);
}
