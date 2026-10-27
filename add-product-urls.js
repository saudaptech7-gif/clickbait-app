const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "ads.json");
const outputFile = path.join(__dirname, "ads-updated.json");

const productUrls = {
  0: "https://shop.organixx.com/products/magnesium-7",
  1: "https://www.stulz.com/",
  2: "https://www.amphenol.com/",
  3: "https://www.pluto.tv/",
  4: "https://www.codecademy.com/",
  5: "https://www.electronicdesign.com/",
  6: "https://www.seismic.com/",
  7: "https://www.howardcenter.org/",
  8: "https://atlus.com/",
  9: "https://www.vulture.com/",
  10: "https://www.rsaconference.com/",
  12: "https://www.lokeysbodyshop.com/",
  13: "https://www.logitech.com/en-us/products/combos/mx-keys-s-combo.920-011889.html",
  14: "https://recipeforme.com/",
  15: "https://www.fmfcu.org/",
  17: "https://www.smartcare.com/",
  18: "https://www.adaptedmind.com/",
  19: "https://www.record-eagle.com/",
  21: "https://www.communitynewdigital.com/",
  22: "https://www.adventurecu.org/",
  23: "https://www.trilinkbiotech.com/",
  24: "https://www.monergism.com/",
  25: "https://slickdeals.net/",
  26: "https://capitaloneshopping.com/",
  27: "https://elements.envato.com/fonts",
  28: "https://www.coupert.com/",
  29: "https://www.familylife.com/",
  30: "https://www.globalspec.com/",
  31: "https://www.cookiesforkidscancer.org/",
  32: "https://www.essentialspice.com/",
  33: "https://www.cabelas.com/",
  35: "https://www.toyota.com/corolla/",
  36: "https://www.boofysbest.com/",
  37: "https://www.autodesk.com/",
  38: "https://www.newchic.com/",
  40: "https://www.sram.com/en/rockshox",
  43: "https://www.ets.org/toefl.html",
  44: "https://www.pdftab.com/",
  45: "https://www.justfashionnow.com/",
  47: "https://convertfiles4free.com/",
  48: "https://www.hingehealth.com/",
  49: "https://www.corrosionpedia.com/",
  50: "https://capitaloneshopping.com/",
  51: "https://www.tentlab.com/",
  52: "https://seaguar.com/products/basix-fluoro",
  53: "https://www.terminus.com/",
  55: "https://www.totaladblock.com/",
  56: "https://www.hero-wars.com/",
  57: "https://www.manageengine.com/products/service-desk/",
  58: "https://www.nordic.com/",
  59: "https://www.questdiagnostics.com/",
  60: "https://www.picofthelitter.org/",
  62: "https://www.goal.com/",
  63: "https://chromeos.google/",
  66: "https://www.weruva.com/",
  67: "https://slickdeals.net/",
  68: "https://cascadehills.com/kids-week",
  69: "https://www.msi.com/",
  70: "https://www.firstthings.com/",
  71: "https://www.whitelabs.com/",
  72: "https://www.sentara.com/",
  73: "https://www.jasonisbell.com/",
  74: "https://www.shimadzu.com/",
  75: "https://www.thecableco.com/",
  76: "https://waveapps.com/",
  78: "https://www.slpl.org/",
  79: "https://en.gethypersoft.com/",
  83: "https://dallasopera.org/",
  84: "https://www.startpage.com/",
  85: "https://www.helios.org/",
  86: "https://www.banggood.com/",
  87: "https://www.misterbandb.com/",
  89: "https://www.mortgage.net/",
  90: "https://www.hero-wars.com/",
  91: "https://www.adobe.com/careers.html",
  92: "https://www.chewy.com/",
  93: "https://www.avenuecoffee.com/",
  96: "https://capitaloneshopping.com/",
  97: "https://www.homeserve.com/",
};

try {
  const ads = JSON.parse(fs.readFileSync(inputFile, "utf8"));

  if (!Array.isArray(ads)) {
    throw new Error("ads.json mein JSON array hona chahiye.");
  }

  const updatedAds = ads.map((ad, index) => ({
    ...ad,
    productUrl: productUrls[index] || "",
  }));

  fs.writeFileSync(outputFile, JSON.stringify(updatedAds, null, 2), "utf8");

  const mappedCount = updatedAds.filter((ad) => ad.productUrl).length;

  const missingCount = updatedAds.length - mappedCount;

  console.log(`Success! Total ads: ${updatedAds.length}`);
  console.log(`URLs assigned: ${mappedCount}`);
  console.log(`Ads without URLs: ${missingCount}`);
  console.log("Updated file: ads-updated.json");
} catch (error) {
  console.error("Error:", error.message);
}
