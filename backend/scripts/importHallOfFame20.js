const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const XLSX = require("xlsx");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const TattooStudio = require("../models/TattooStudio");

/* =========================================================
   SETTINGS
========================================================= */

const EXCEL_FILE = path.join(
  __dirname,
  "../uploads/excel/Tattoo Data Hall Of Fame.xlsx",
);

const SHEET_NAME = "Our 20 Data";

const TOTAL_GOLD = 6;

/*
  Keep this value unchanged.

  It gives us a random-looking selection,
  but the same 6 artists remain Gold if
  you run the importer again.
*/
const RANDOM_SEED = 927341;

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim().toLowerCase() === "undefined"
  ) {
    return "";
  }

  return String(value).trim();
}

function normalizePhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");
}

function normalizeName(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeCity(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/* =========================================================
   SEEDED RANDOM SHUFFLE

   This makes the selection random but stable.
========================================================= */

function seededRandom(seed) {
  let value = seed % 2147483647;

  if (value <= 0) {
    value += 2147483646;
  }

  return function random() {
    value = (value * 16807) % 2147483647;

    return (value - 1) / 2147483646;
  };
}

function shuffleArray(array, seed) {
  const random = seededRandom(seed);

  const result = [...array];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

/* =========================================================
   BUILD DUPLICATE KEY
========================================================= */

function makeDuplicateKey({
  phone,
  name,
  city,
}) {
  if (phone) {
    return `hall20-phone-${phone}`;
  }

  return `hall20-${normalizeName(name)}-${normalizeCity(city)}`
    .replace(/\s+/g, "-");
}

/* =========================================================
   FIND EXISTING ARTIST

   Prevent duplicate artists.
========================================================= */

async function findExistingArtist({
  name,
  city,
  phone,
}) {
  /*
    First check phone because this is the
    strongest match for these 20 records.
  */

  if (phone) {
    const existingByPhone =
      await TattooStudio.findOne({
        phone: {
          $regex: `${phone}$`,
          $options: "i",
        },
      });

    if (existingByPhone) {
      return existingByPhone;
    }
  }

  /*
    Fallback:
    same name + same city
  */

  if (name && city) {
    const escapedName = name.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const escapedCity = city.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    return TattooStudio.findOne({
      name: {
        $regex: `^${escapedName}$`,
        $options: "i",
      },

      city: {
        $regex: `^${escapedCity}$`,
        $options: "i",
      },
    });
  }

  return null;
}

/* =========================================================
   CONNECT MONGODB
========================================================= */

async function connectDatabase() {
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI / MONGODB_URI is missing from backend/.env",
    );
  }

  await mongoose.connect(mongoUri);

  console.log("✅ MongoDB connected");
}

/* =========================================================
   MAIN IMPORT
========================================================= */

async function importHallOfFame20() {
  try {
    console.log("");
    console.log("==========================================");
    console.log("🏆 HALL OF FAME 20 IMPORT");
    console.log("==========================================");

    await connectDatabase();

    /* ==============================
       CHECK EXCEL FILE
    ============================== */

    if (!fs.existsSync(EXCEL_FILE)) {
      throw new Error(
        `Excel file not found:\n${EXCEL_FILE}`,
      );
    }

    console.log("📁 Excel:", EXCEL_FILE);

    /* ==============================
       READ WORKBOOK
    ============================== */

    const workbook = XLSX.readFile(EXCEL_FILE);

    if (!workbook.SheetNames.includes(SHEET_NAME)) {
      throw new Error(
        `Sheet "${SHEET_NAME}" was not found.`,
      );
    }

    const sheet = workbook.Sheets[SHEET_NAME];

    /*
      Your "Our 20 Data" sheet has no header row.

      Columns from your Excel:

      A = Number
      B = Name
      C = Rating
      D = Reviews
      E = Address
      F = City
      G = State
      H = Country
      I = Website
      J = Phone
      K = empty
      L = empty
      M = Category
    */

    const rows = XLSX.utils.sheet_to_json(
      sheet,
      {
        header: 1,
        defval: "",
        raw: false,
      },
    );

    /* ==============================
       CLEAN FIRST 20 VALID ROWS
    ============================== */

    const artists = rows
      .map((row, index) => {
        const name = cleanText(row[1]);

        const rating =
          Number(row[2]) || 0;

        const reviews =
          Number(row[3]) || 0;

        const address =
          cleanText(row[4]);

        const city =
          cleanText(row[5]);

        const state =
          cleanText(row[6]);

        const country =
          cleanText(row[7]) || "IN";

        const website =
          cleanText(row[8]);

        const phone =
          normalizePhone(row[9]);

        const category =
          cleanText(row[12]) ||
          "Tattoo shop";

        return {
          excelRow: index + 1,
          name,
          rating,
          reviews,
          address,
          city,
          state,
          country,
          website,
          phone,
          category,
        };
      })
      .filter((artist) => artist.name)
      .slice(0, 20);

    if (artists.length !== 20) {
      throw new Error(
        `Expected 20 artists in "${SHEET_NAME}", but found ${artists.length}.`,
      );
    }

    console.log("");
    console.log(
      `✅ Found ${artists.length} artists`,
    );

    /* =====================================================
       RANDOMLY CHOOSE 6 GOLD

       Seed keeps same selection on future imports.
    ===================================================== */

    const shuffledArtists = shuffleArray(
      artists,
      RANDOM_SEED,
    );

    const goldNames = new Set(
      shuffledArtists
        .slice(0, TOTAL_GOLD)
        .map((artist) =>
          normalizeName(artist.name),
        ),
    );

    console.log("");
    console.log("==========================================");
    console.log("🥇 GOLD ARTISTS");
    console.log("==========================================");

    artists.forEach((artist) => {
      if (
        goldNames.has(
          normalizeName(artist.name),
        )
      ) {
        console.log(`⭐ ${artist.name}`);
      }
    });

    console.log("");
    console.log("==========================================");
    console.log("🥈 SILVER ARTISTS");
    console.log("==========================================");

    artists.forEach((artist) => {
      if (
        !goldNames.has(
          normalizeName(artist.name),
        )
      ) {
        console.log(`🥈 ${artist.name}`);
      }
    });

    /* =====================================================
       IMPORT / UPDATE MONGODB
    ===================================================== */

    let inserted = 0;
    let updated = 0;
    let goldCount = 0;
    let silverCount = 0;

    for (const artistData of artists) {
      const isGold = goldNames.has(
        normalizeName(artistData.name),
      );

      const plan = isGold
        ? "verified"
        : "pro";

      if (isGold) {
        goldCount += 1;
      } else {
        silverCount += 1;
      }

      const existing =
        await findExistingArtist(
          artistData,
        );

      /* ==============================
         EXISTING PROFILE
      ============================== */

      if (existing) {
        existing.name =
          artistData.name;

        existing.rating =
          artistData.rating;

        existing.reviews =
          artistData.reviews;

        existing.address =
          artistData.address;

        existing.city =
          artistData.city;

        existing.state =
          artistData.state;

        existing.country =
          artistData.country;

        existing.phone =
          artistData.phone;

        existing.category =
          artistData.category;

        /*
          Avoid saving literal:
          "undefined"
        */
        if (artistData.website) {
          existing.website =
            artistData.website;
        }

        /* ============================
           GOLD
        ============================ */

        if (isGold) {
          existing.plan = "verified";

          /*
            Your HallOfFame.jsx checks:
            plan === "verified"
            AND hallOfFameEligible
          */
          existing.hallOfFameEligible =
            true;

          existing.verified = true;
          existing.spotlight = true;

          /*
            Gold profile represents active
            Verified Spotlight.
          */
          existing.paymentStatus =
            "paid";
        }

        /* ============================
           SILVER
        ============================ */

        if (!isGold) {
          existing.plan = "pro";

          existing.verified = false;
          existing.spotlight = false;

          /*
            Silver does NOT appear in Hall Of Fame.
          */
          existing.hallOfFameEligible =
            false;

          existing.paymentStatus =
            "paid";
        }

        await existing.save();

        updated += 1;

        console.log(
          `🔄 UPDATED: ${artistData.name} → ${
            isGold ? "GOLD" : "SILVER"
          }`,
        );

        continue;
      }

      /* ==============================
         NEW PROFILE
      ============================== */

      const duplicateKey =
        makeDuplicateKey(artistData);

      const newArtist =
        new TattooStudio({
          sourceRowId:
            `hall20-${artistData.excelRow}`,

          sourceSheet: SHEET_NAME,

          name: artistData.name,

          artistName:
            artistData.name,

          professionalName:
            artistData.name,

          rating:
            artistData.rating,

          reviews:
            artistData.reviews,

          address:
            artistData.address,

          city:
            artistData.city,

          state:
            artistData.state,

          country:
            artistData.country,

          website:
            artistData.website,

          phone:
            artistData.phone,

          category:
            artistData.category,

          duplicateKey,

          /*
            PLAN
          */
          plan,

          /*
            Both Gold & Silver are imported
            as active paid membership records.
          */
          paymentStatus: "paid",

          /*
            GOLD ONLY
          */
          verified: isGold,
          spotlight: isGold,
          hallOfFameEligible: isGold,

          claimed: false,
          phoneVerified: false,
          ownerVerified: false,

          importedAt: new Date(),
        });

      await newArtist.save();

      inserted += 1;

      console.log(
        `✅ INSERTED: ${artistData.name} → ${
          isGold ? "GOLD" : "SILVER"
        }`,
      );
    }

    /* =====================================================
       FINAL CHECK
    ===================================================== */

    console.log("");
    console.log("==========================================");
    console.log("✅ IMPORT COMPLETE");
    console.log("==========================================");

    console.log(
      `Total Excel profiles : ${artists.length}`,
    );

    console.log(
      `Gold profiles        : ${goldCount}`,
    );

    console.log(
      `Silver profiles      : ${silverCount}`,
    );

    console.log(
      `Inserted             : ${inserted}`,
    );

    console.log(
      `Updated existing     : ${updated}`,
    );

    console.log("");
    console.log(
      "🏆 Gold profiles will appear in Hall Of Fame.",
    );

    console.log(
      "🥈 Silver profiles remain in the Artists directory.",
    );
  } catch (error) {
    console.error("");
    console.error(
      "❌ Hall Of Fame import failed:",
      error,
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});

    console.log("");
    console.log("🔌 MongoDB disconnected");
  }
}

/* =========================================================
   RUN
========================================================= */

importHallOfFame20();