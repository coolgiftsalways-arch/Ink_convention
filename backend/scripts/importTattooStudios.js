const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");
require("dotenv").config();

const TattooStudio = require("../models/TattooStudio");

const SHEET_NAME = "Callable Master";

const ALLOWED_PRIORITY = /^P[123]\s*[—–-]\s*(Artist|Studio)\s*:/i;

function clean(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value, fallback = 0) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  const n = Number(
    String(value)
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(n)
    ? n
    : fallback;
}

function normalizePhone(value) {
  let digits = clean(value)
    .replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return `+${digits}`;
  }

  if (digits.length > 0) {
    return `+${digits}`;
  }

  return "";
}

function extractGooglePlaceId(mapsUrl) {
  const raw = clean(mapsUrl);

  if (!raw) return "";

  try {
    const url = new URL(raw);

    const queryPlaceId = clean(
      url.searchParams.get("query_place_id")
    );

    if (queryPlaceId) {
      return queryPlaceId;
    }

    const placeId = clean(
      url.searchParams.get("place_id")
    );

    if (placeId) {
      return placeId;
    }
  } catch (error) {
    // continue to regex fallback
  }

  const match =
    raw.match(
      /[?&](?:query_place_id|place_id)=([^&#]+)/i
    ) ||
    raw.match(
      /(?:!1s|!2s)(ChI[A-Za-z0-9_-]+)/
    );

  return match
    ? decodeURIComponent(match[1])
    : "";
}

function slugPart(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, "-");
}

function buildDuplicateKey(row) {
  const googlePlaceId =
    extractGooglePlaceId(
      row["Google Maps URL"]
    );

  if (googlePlaceId) {
    return `google-place:${googlePlaceId}`;
  }

  const name = slugPart(
    row["Business / Artist Name"]
  );

  const phone = normalizePhone(
    row["Mobile"]
  ).replace(/\D/g, "");

  const city = slugPart(
    row["Normalized City"]
  );

  return `fallback:${name}|${phone}|${city}`;
}

function mapRow(row) {
  const priority = clean(
    row["Lead Priority"]
  );

  const isArtist =
    /\bArtist\b/i.test(priority);

  const isStudio =
    /\bStudio\b/i.test(priority);

  const name = clean(
    row["Business / Artist Name"]
  );

  return {
    sourceRowId: clean(
      row["Lead ID"]
    ),

    name,

    artistName: isArtist
      ? name
      : "",

    professionalName: isArtist
      ? name
      : "",

    rating:
      row["Rating"] === null ||
      row["Rating"] === undefined ||
      row["Rating"] === ""
        ? null
        : toNumber(
            row["Rating"],
            null
          ),

    reviews: toNumber(
      row["Google Reviews"],
      0
    ),

    address: clean(
      row["Address"]
    ),

    city: clean(
      row["Normalized City"]
    ),

    state: clean(
      row["Normalized State"]
    ),

    country: "IN",

    website: clean(
      row["Website"]
    ),

    phone: normalizePhone(
      row["Mobile"]
    ),

    email: "",

    studio: isStudio
      ? name
      : "",

    studioName: isStudio
      ? name
      : "",

    instagram: clean(
      row["Instagram"]
    ),

    mapsUrl: clean(
      row["Google Maps URL"]
    ),

    category: clean(
      row["Google Category"]
    ),

    sourceSheet:
      clean(
        row["Source Sheet"]
      ) || SHEET_NAME,

    duplicateKey:
      buildDuplicateKey(row),

    claimed: false,

    phoneVerified: false,

    updatedByOwner: false,

    ownerVerified: false,

    plan: "basic",

    paymentStatus: "unpaid",

    verified: false,

    spotlight: false,

    hallOfFameEligible: false,

    importedAt: new Date(),
  };
}

async function main() {
  const inputArg =
    process.argv[2];

  if (!inputArg) {
    console.error(`
❌ Excel file path missing.

Example:

node scripts\\importTattooStudios.js "D:\\Ink_convention-main\\Ink_convention-main\\backend\\data\\Ink_Convention_Tattoo_Master_Phase3_Shareable.xlsx"
`);

    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI missing from backend/.env"
    );
  }

  const excelPath =
    path.resolve(inputArg);

  console.log(
    `📄 Reading Excel: ${excelPath}`
  );

  const workbook =
    XLSX.readFile(excelPath);

  if (
    !workbook.SheetNames.includes(
      SHEET_NAME
    )
  ) {
    throw new Error(
      `Sheet "${SHEET_NAME}" not found. Found: ${workbook.SheetNames.join(", ")}`
    );
  }

  const worksheet =
    workbook.Sheets[
      SHEET_NAME
    ];

  const rows =
    XLSX.utils.sheet_to_json(
      worksheet,
      {
        defval: "",
        raw: false,
      }
    );

  console.log(
    `📊 Total rows in ${SHEET_NAME}: ${rows.length}`
  );

  const filtered =
    rows.filter((row) =>
      ALLOWED_PRIORITY.test(
        clean(
          row["Lead Priority"]
        )
      )
    );

  console.log(
    `✅ P1/P2/P3 Artist + Studio rows: ${filtered.length}`
  );

  const skipped = [];

  const docs = [];

  const seenKeys =
    new Set();

  for (
    let i = 0;
    i < filtered.length;
    i++
  ) {
    const row =
      filtered[i];

    const name =
      clean(
        row[
          "Business / Artist Name"
        ]
      );

    if (!name) {
      skipped.push({
        excelRow: i + 2,
        reason:
          "Missing Business / Artist Name",
      });

      continue;
    }

    const doc =
      mapRow(row);

    if (
      !doc.duplicateKey ||
      doc.duplicateKey ===
        "fallback:||"
    ) {
      skipped.push({
        excelRow:
          i + 2,
        name,
        reason:
          "Could not create duplicate key",
      });

      continue;
    }

    if (
      seenKeys.has(
        doc.duplicateKey
      )
    ) {
      skipped.push({
        excelRow:
          i + 2,
        name,
        reason:
          `Duplicate inside Excel: ${doc.duplicateKey}`,
      });

      continue;
    }

    seenKeys.add(
      doc.duplicateKey
    );

    docs.push(doc);
  }

  console.log(
    `📦 Ready to import: ${docs.length}`
  );

  console.log(
    `⏭️ Skipped: ${skipped.length}`
  );

  await mongoose.connect(
    process.env.MONGO_URI
  );

  console.log(
    "✅ MongoDB connected"
  );

  const before =
    await TattooStudio.countDocuments();

  console.log(
    `📦 Current MongoDB count: ${before}`
  );

  const operations =
    docs.map((doc) => ({
      updateOne: {
        filter: {
          duplicateKey:
            doc.duplicateKey,
        },

        update: {
          $set: doc,

          $setOnInsert: {
            createdAt:
              new Date(),
          },
        },

        upsert: true,
      },
    }));

  const BATCH_SIZE = 500;

  let inserted = 0;
  let matched = 0;
  let modified = 0;

  for (
    let start = 0;
    start <
    operations.length;
    start += BATCH_SIZE
  ) {
    const batch =
      operations.slice(
        start,
        start +
          BATCH_SIZE
      );

    const result =
      await TattooStudio.bulkWrite(
        batch,
        {
          ordered: false,
        }
      );

    inserted +=
      result.upsertedCount ||
      0;

    matched +=
      result.matchedCount ||
      0;

    modified +=
      result.modifiedCount ||
      0;

    const completed =
      Math.min(
        start +
          BATCH_SIZE,
        operations.length
      );

    console.log(
      `🚀 Processed ${completed}/${operations.length}`
    );
  }

  const after =
    await TattooStudio.countDocuments();

  console.log(`
====================================
✅ IMPORT FINISHED
====================================

Inserted new: ${inserted}
Matched existing: ${matched}
Modified existing: ${modified}
Skipped: ${skipped.length}

MongoDB before: ${before}
MongoDB after: ${after}
`);

  if (
    skipped.length >
    0
  ) {
    console.log(
      "⚠️ Skipped rows:"
    );

    console.table(
      skipped.slice(
        0,
        20
      )
    );
  }

  await mongoose.disconnect();

  console.log(
    "✅ MongoDB disconnected"
  );
}

main().catch(
  async (error) => {
    console.error(
      "\n❌ Import failed:"
    );

    console.error(
      error
    );

    try {
      await mongoose.disconnect();
    } catch (error) {}

    process.exit(1);
  }
);