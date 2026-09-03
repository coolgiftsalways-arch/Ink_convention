const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");
require("dotenv").config();

const TattooStudio = require("../models/TattooStudio");

/* =========================================================
   SETTINGS
========================================================= */

const BATCH_SIZE = 500;

/* =========================================================
   BASIC HELPERS
========================================================= */

function cleanText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeHeader(value) {
  return normalizeText(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(value) {
  const text = cleanText(value);

  if (!text) {
    return "";
  }

  const lower = text.toLowerCase();

  if (
    lower === "undefined" ||
    lower === "null" ||
    lower === "n/a" ||
    lower === "na" ||
    lower === "-"
  ) {
    return "";
  }

  return text;
}

function parseNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "")
      .trim(),
  );

  return Number.isFinite(number)
    ? number
    : null;
}

function parseReviews(value) {
  const number = parseNumber(value);

  if (number === null) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(number),
  );
}

/* =========================================================
   PHONE NORMALIZER
========================================================= */

function normalizePhone(value) {
  let digits = cleanText(value)
    .replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    digits = digits.slice(2);
  }

  if (
    digits.length === 11 &&
    digits.startsWith("0")
  ) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length > 10) {
    return `+${digits}`;
  }

  return digits;
}

/* =========================================================
   GOOGLE PLACE ID
========================================================= */

function extractGooglePlaceId(mapsUrl) {
  const raw = cleanText(mapsUrl);

  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw);

    const queryPlaceId = cleanText(
      url.searchParams.get("query_place_id"),
    );

    if (queryPlaceId) {
      return queryPlaceId;
    }

    const placeId = cleanText(
      url.searchParams.get("place_id"),
    );

    if (placeId) {
      return placeId;
    }
  } catch (error) {
    // Continue to regex fallback
  }

  const match =
    raw.match(
      /[?&](?:query_place_id|place_id)=([^&#]+)/i,
    ) ||
    raw.match(
      /(?:!1s|!2s)(ChI[A-Za-z0-9_-]+)/,
    );

  return match
    ? decodeURIComponent(match[1])
    : "";
}

/* =========================================================
   DUPLICATE KEY
========================================================= */

function createDuplicateKey(data) {
  // 1. BEST: Google Place ID
  const placeId = extractGooglePlaceId(
    data.mapsUrl,
  );

  if (placeId) {
    return `google-place:${placeId}`;
  }

  // 2. PHONE
  const phoneDigits = normalizePhone(
    data.phone,
  ).replace(/\D/g, "");

  if (phoneDigits) {
    return `phone:${phoneDigits}`;
  }

  // 3. GOOGLE MAPS URL
  if (data.mapsUrl) {
    return `maps:${normalizeText(
      data.mapsUrl,
    )}`;
  }

  // 4. NAME + CITY + STATE
  const name = normalizeText(
    data.name,
  );

  const city = normalizeText(
    data.city,
  );

  const state = normalizeText(
    data.state,
  );

  if (name) {
    return `studio:${name}|${city}|${state}`;
  }

  return "";
}

/* =========================================================
   FIND COLUMN
========================================================= */

function getColumnFromObject(
  row,
  possibleNames,
) {
  const keys = Object.keys(row);

  for (const possibleName of possibleNames) {
    const normalizedPossibleName =
      normalizeHeader(possibleName);

    const matchingKey = keys.find(
      (key) =>
        normalizeHeader(key) ===
        normalizedPossibleName,
    );

    if (matchingKey !== undefined) {
      return row[matchingKey];
    }
  }

  return "";
}

/* =========================================================
   BUILD STUDIO DATA
========================================================= */

function buildStudioData({
  sourceRowId,
  name,
  rating,
  reviews,
  address,
  city,
  state,
  country,
  website,
  phone,
  items,
  mapsUrl,
  category,
  sourceSheet,
}) {
  const studioData = {
    sourceRowId: cleanText(sourceRowId),

    name: cleanText(name),

    artistName: "",

    professionalName: "",

    rating:
      rating === null ||
      rating === undefined ||
      rating === ""
        ? null
        : parseNumber(rating),

    reviews: parseReviews(reviews),

    address: cleanText(address),

    city: cleanText(city),

    state: cleanText(state),

    country:
      cleanText(country) || "IN",

    website: normalizeUrl(website),

    phone: normalizePhone(phone),

    email: "",

    studio: cleanText(name),

    studioName: cleanText(name),

    experience: "",

    instagram: "",

    bio: "",

    profileImage: "",

    portfolioImages: [],

    tattooStyles: [],

    items: cleanText(items),

    mapsUrl: normalizeUrl(mapsUrl),

    category: cleanText(category),

    sourceSheet: cleanText(sourceSheet),

    /* ==============================================
       ALL IMPORTED GOOGLE DATA STARTS FREE
    ============================================== */

    claimed: false,

    claimedAt: null,

    phoneVerified: false,

    updatedByOwner: false,

    ownerVerified: false,

    // FREE
    plan: "basic",

    paymentStatus: "unpaid",

    verified: false,

    spotlight: false,

    hallOfFameEligible: false,

    planStartedAt: null,

    planExpiresAt: null,

    importedAt: new Date(),
  };

  studioData.duplicateKey =
    createDuplicateKey(studioData);

  return studioData;
}

/* =========================================================
   HEADER-BASED ROW
========================================================= */

function convertHeaderRowToStudio(
  row,
  sheetName,
  rowNumber,
) {
  const sourceId =
    getColumnFromObject(row, [
      "id",
      "lead id",
      "source row id",
      "source id",
    ]);

  const name =
    getColumnFromObject(row, [
      "name",
      "studio name",
      "business name",
      "business / artist name",
      "tattoo studio",
      "artist name",
      "studio",
    ]);

  const rating =
    getColumnFromObject(row, [
      "rating",
      "google rating",
      "google rating score",
    ]);

  const reviews =
    getColumnFromObject(row, [
      "reviews",
      "google reviews",
      "review count",
      "reviews count",
      "number of reviews",
    ]);

  const address =
    getColumnFromObject(row, [
      "address",
      "full address",
      "location",
    ]);

  const city =
    getColumnFromObject(row, [
      "city",
      "normalized city",
      "town",
    ]);

  const state =
    getColumnFromObject(row, [
      "state",
      "normalized state",
      "region",
    ]);

  const country =
    getColumnFromObject(row, [
      "country",
      "country code",
    ]);

  const website =
    getColumnFromObject(row, [
      "website",
      "website url",
      "website link",
      "url",
    ]);

  const phone =
    getColumnFromObject(row, [
      "phone",
      "phone number",
      "telephone",
      "mobile",
      "contact",
      "contact number",
    ]);

  const items =
    getColumnFromObject(row, [
      "items",
      "item",
      "services",
    ]);

  const mapsUrl =
    getColumnFromObject(row, [
      "maps url",
      "google maps url",
      "google maps",
      "map url",
      "maps",
    ]);

  const category =
    getColumnFromObject(row, [
      "category",
      "google category",
      "business category",
      "type",
    ]);

  if (
    !cleanText(name) &&
    !cleanText(address) &&
    !cleanText(phone)
  ) {
    return null;
  }

  if (!cleanText(name)) {
    return {
      invalid: true,
      rowNumber,
      sheetName,
      reason:
        "Studio / artist name is missing.",
    };
  }

  const studioData =
    buildStudioData({
      sourceRowId:
        cleanText(sourceId) ||
        `${sheetName}-${rowNumber}`,

      name,
      rating,
      reviews,
      address,
      city,
      state,
      country,
      website,
      phone,
      items,
      mapsUrl,
      category,
      sourceSheet: sheetName,
    });

  if (!studioData.duplicateKey) {
    return {
      invalid: true,
      rowNumber,
      sheetName,
      reason:
        "Could not create duplicate key.",
    };
  }

  return studioData;
}

/* =========================================================
   HEADERLESS ROW

   EXPECTED COLUMNS:

   0  = ID
   1  = Name
   2  = Rating
   3  = Reviews
   4  = Address
   5  = City
   6  = State
   7  = Country
   8  = Website
   9  = Phone
   10 = Items
   11 = Google Maps URL
   12 = Category
========================================================= */

function convertArrayRowToStudio(
  row,
  sheetName,
  rowNumber,
) {
  if (!Array.isArray(row)) {
    return null;
  }

  const sourceId =
    cleanText(row[0]);

  const name =
    cleanText(row[1]);

  const rating =
    parseNumber(row[2]);

  const reviews =
    parseReviews(row[3]);

  const address =
    cleanText(row[4]);

  const city =
    cleanText(row[5]);

  const state =
    cleanText(row[6]);

  const country =
    cleanText(row[7]) || "IN";

  const website =
    normalizeUrl(row[8]);

  const phone =
    normalizePhone(row[9]);

  const items =
    cleanText(row[10]);

  const mapsUrl =
    normalizeUrl(row[11]);

  const category =
    cleanText(row[12]);

  if (
    !name &&
    !address &&
    !phone
  ) {
    return null;
  }

  if (!name) {
    return {
      invalid: true,
      rowNumber,
      sheetName,
      reason:
        "Studio / artist name is missing.",
    };
  }

  const studioData =
    buildStudioData({
      sourceRowId:
        sourceId ||
        `${sheetName}-${rowNumber}`,

      name,
      rating,
      reviews,
      address,
      city,
      state,
      country,
      website,
      phone,
      items,
      mapsUrl,
      category,
      sourceSheet: sheetName,
    });

  if (!studioData.duplicateKey) {
    return {
      invalid: true,
      rowNumber,
      sheetName,
      reason:
        "Could not create duplicate key.",
    };
  }

  return studioData;
}

/* =========================================================
   DETECT HEADER ROW
========================================================= */

function looksLikeHeaderRow(row) {
  if (!Array.isArray(row)) {
    return false;
  }

  const firstSeveral = row
    .slice(0, 15)
    .map((value) =>
      normalizeHeader(value),
    );

  const headerWords = [
    "id",
    "lead id",
    "name",
    "studio name",
    "business name",
    "business / artist name",
    "artist name",
    "rating",
    "google rating",
    "reviews",
    "google reviews",
    "review count",
    "address",
    "city",
    "normalized city",
    "state",
    "normalized state",
    "country",
    "website",
    "phone",
    "phone number",
    "mobile",
    "category",
    "google category",
    "maps url",
    "google maps url",
  ];

  const matches =
    firstSeveral.filter(
      (value) =>
        headerWords.includes(value),
    );

  return matches.length >= 2;
}

/* =========================================================
   PROCESS MONGODB BATCH
========================================================= */

async function processBatch(batch) {
  if (!batch.length) {
    return {
      imported: 0,
      existing: 0,
      duplicateInsideBatch: 0,
      errors: 0,
    };
  }

  /* ===============================================
     REMOVE DUPLICATES INSIDE CURRENT BATCH
  =============================================== */

  const uniqueMap =
    new Map();

  for (const studio of batch) {
    if (
      !studio ||
      !studio.duplicateKey
    ) {
      continue;
    }

    if (
      !uniqueMap.has(
        studio.duplicateKey,
      )
    ) {
      uniqueMap.set(
        studio.duplicateKey,
        studio,
      );
    }
  }

  const uniqueStudios =
    [...uniqueMap.values()];

  const duplicateInsideBatch =
    batch.length -
    uniqueStudios.length;

  if (
    uniqueStudios.length === 0
  ) {
    return {
      imported: 0,
      existing: 0,
      duplicateInsideBatch,
      errors: 0,
    };
  }

  /* ===============================================
     UPSERT

     Existing profile:
     DO NOT overwrite it.

     New profile:
     INSERT it.
  =============================================== */

  const operations =
    uniqueStudios.map(
      (studio) => ({
        updateOne: {
          filter: {
            duplicateKey:
              studio.duplicateKey,
          },

          update: {
            $setOnInsert: studio,
          },

          upsert: true,
        },
      }),
    );

  try {
    const result =
      await TattooStudio.bulkWrite(
        operations,
        {
          ordered: false,
        },
      );

    return {
      imported:
        result.upsertedCount || 0,

      existing:
        result.matchedCount || 0,

      duplicateInsideBatch,

      errors: 0,
    };
  } catch (error) {
    console.error(
      "❌ MongoDB batch error:",
      error.message,
    );

    return {
      imported: 0,
      existing: 0,
      duplicateInsideBatch,
      errors:
        uniqueStudios.length,
    };
  }
}

/* =========================================================
   IMPORT EXCEL FILE
========================================================= */

async function importExcelFile(
  filePath,
) {
  console.log(
    "==============================================",
  );

  console.log(
    "📊 STARTING TATTOO EXCEL IMPORT",
  );

  console.log(
    "==============================================",
  );

  console.log(
    `📁 File: ${filePath}`,
  );

  const workbook =
    XLSX.readFile(filePath, {
      cellDates: false,
      cellNF: false,
      cellStyles: false,
    });

  const sheetNames =
    workbook.SheetNames;

  console.log(
    `📄 Sheets found: ${sheetNames.length}`,
  );

  console.log(
    `📄 ${sheetNames.join(", ")}`,
  );

  let totalRows = 0;

  let imported = 0;

  let existing = 0;

  let duplicateInsideExcel = 0;

  let emptyRows = 0;

  let invalid = 0;

  let errors = 0;

  const errorRows = [];

  /* ===============================================
     GLOBAL DUPLICATE CHECK

     This catches duplicate records across
     DIFFERENT Excel sheets too.
  =============================================== */

  const globalSeenKeys =
    new Set();

  /* =======================================================
     LOOP THROUGH EVERY SHEET
  ======================================================= */

  for (const sheetName of sheetNames) {
    console.log("");

    console.log(
      `📑 Processing sheet: ${sheetName}`,
    );

    const worksheet =
      workbook.Sheets[sheetName];

    if (!worksheet) {
      console.log(
        `⚠️ Sheet "${sheetName}" could not be read.`,
      );

      continue;
    }

    const rows =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
          defval: "",
          raw: false,
        },
      );

    console.log(
      `   Rows found: ${rows.length}`,
    );

    if (rows.length === 0) {
      continue;
    }

    const hasHeader =
      looksLikeHeaderRow(
        rows[0],
      );

    console.log(
      `   Header row detected: ${
        hasHeader
          ? "YES"
          : "NO"
      }`,
    );

    totalRows += hasHeader
      ? Math.max(
          rows.length - 1,
          0,
        )
      : rows.length;

    const headers =
      hasHeader
        ? rows[0]
        : null;

    const startIndex =
      hasHeader
        ? 1
        : 0;

    let batch = [];

    /* =====================================================
       PROCESS ROWS
    ===================================================== */

    for (
      let index = startIndex;
      index < rows.length;
      index++
    ) {
      const excelRowNumber =
        index + 1;

      try {
        let studio;

        /* ==========================================
           HEADER-BASED
        ========================================== */

        if (hasHeader) {
          const objectRow = {};

          headers.forEach(
            (
              header,
              columnIndex,
            ) => {
              if (
                header !==
                  undefined &&
                header !== null &&
                String(
                  header,
                ).trim() !== ""
              ) {
                objectRow[
                  String(header)
                ] =
                  rows[index][
                    columnIndex
                  ] ?? "";
              }
            },
          );

          studio =
            convertHeaderRowToStudio(
              objectRow,
              sheetName,
              excelRowNumber,
            );
        } else {
          /* ========================================
             HEADERLESS
          ======================================== */

          studio =
            convertArrayRowToStudio(
              rows[index],
              sheetName,
              excelRowNumber,
            );
        }

        /* ==========================================
           EMPTY ROW
        ========================================== */

        if (studio === null) {
          emptyRows++;
          continue;
        }

        /* ==========================================
           INVALID ROW
        ========================================== */

        if (studio.invalid) {
          invalid++;

          errorRows.push({
            sheet: sheetName,

            row:
              excelRowNumber,

            reason:
              studio.reason,
          });

          continue;
        }

        /* ==========================================
           DUPLICATE ANYWHERE IN EXCEL

           Works even if same studio appears
           in another sheet.
        ========================================== */

        if (
          globalSeenKeys.has(
            studio.duplicateKey,
          )
        ) {
          duplicateInsideExcel++;

          continue;
        }

        globalSeenKeys.add(
          studio.duplicateKey,
        );

        batch.push(studio);

        /* ==========================================
           PROCESS BATCH
        ========================================== */

        if (
          batch.length >=
          BATCH_SIZE
        ) {
          const result =
            await processBatch(
              batch,
            );

          imported +=
            result.imported;

          existing +=
            result.existing;

          duplicateInsideExcel +=
            result.duplicateInsideBatch;

          errors +=
            result.errors;

          batch = [];

          console.log(
            `   ✓ Processed ${
              index + 1
            }/${rows.length}`,
          );
        }
      } catch (error) {
        errors++;

        errorRows.push({
          sheet: sheetName,

          row:
            excelRowNumber,

          reason:
            error.message,
        });

        console.error(
          `❌ Error at ${sheetName} row ${excelRowNumber}:`,
          error.message,
        );
      }
    }

    /* ===============================================
       PROCESS REMAINING ROWS
    =============================================== */

    if (batch.length > 0) {
      const result =
        await processBatch(
          batch,
        );

      imported +=
        result.imported;

      existing +=
        result.existing;

      duplicateInsideExcel +=
        result.duplicateInsideBatch;

      errors +=
        result.errors;
    }

    console.log(
      `✅ Finished sheet: ${sheetName}`,
    );
  }

  /* =======================================================
     FINAL COUNT
  ======================================================= */

  const mongoCount =
    await TattooStudio.countDocuments();

  console.log("");

  console.log(
    "==============================================",
  );

  console.log(
    "✅ EXCEL IMPORT COMPLETE",
  );

  console.log(
    "==============================================",
  );

  console.log(
    `Total Excel rows: ${totalRows}`,
  );

  console.log(
    `Inserted new: ${imported}`,
  );

  console.log(
    `Already existed in MongoDB: ${existing}`,
  );

  console.log(
    `Duplicate inside Excel: ${duplicateInsideExcel}`,
  );

  console.log(
    `Empty rows skipped: ${emptyRows}`,
  );

  console.log(
    `Invalid rows skipped: ${invalid}`,
  );

  console.log(
    `Errors: ${errors}`,
  );

  console.log(
    `MongoDB final count: ${mongoCount}`,
  );

  console.log(
    "==============================================",
  );

  /* =======================================================
     SHOW FIRST ERRORS
  ======================================================= */

  if (errorRows.length > 0) {
    console.log(
      "\n⚠️ First invalid/error rows:",
    );

    console.table(
      errorRows.slice(
        0,
        30,
      ),
    );
  }

  return {
    totalRows,
    imported,
    existing,
    duplicateInsideExcel,
    emptyRows,
    invalid,
    errors,
    mongoCount,
  };
}

/* =========================================================
   MAIN
========================================================= */

async function main() {
  const inputArg =
    process.argv[2];

  if (!inputArg) {
    console.error(`
❌ Excel file path missing.

Example:

node scripts\\importTattooStudios.js "D:\\Ink_convention-main\\Ink_convention-main\\backend\\uploads\\excel\\Tattoo Data (1) (1).xlsx"
`);

    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI missing from backend/.env",
    );
  }

  const excelPath =
    path.resolve(inputArg);

  console.log(
    `📄 Excel path: ${excelPath}`,
  );

  await mongoose.connect(
    process.env.MONGO_URI,
  );

  console.log(
    "✅ MongoDB connected",
  );

  const before =
    await TattooStudio.countDocuments();

  console.log(
    `📦 MongoDB before import: ${before}`,
  );

  await importExcelFile(
    excelPath,
  );

  await mongoose.disconnect();

  console.log(
    "✅ MongoDB disconnected",
  );
}

/* =========================================================
   RUN
========================================================= */

main().catch(
  async (error) => {
    console.error(
      "\n❌ Import failed:",
    );

    console.error(error);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect error
    }

    process.exit(1);
  },
);