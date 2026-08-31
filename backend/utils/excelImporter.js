const XLSX = require("xlsx");
const TattooStudio = require("../models/TattooStudio");

/* =========================================================
   HELPERS
========================================================= */

function cleanText(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function normalizeText(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(value) {
  const text = cleanText(value);

  if (!text || text.toLowerCase() === "undefined") {
    return "";
  }

  return text;
}

function parseNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = Number(
    String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, ""),
  );

  return Number.isFinite(number) ? number : null;
}

function parseReviews(value) {
  const number = parseNumber(value);

  if (number === null) {
    return 0;
  }

  return Math.max(0, Math.round(number));
}

/* =========================================================
   HEADER NORMALIZATION
========================================================= */

function normalizeHeader(value) {
  return normalizeText(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/* =========================================================
   FIND COLUMN BY HEADER
========================================================= */

function getColumnFromObject(row, possibleNames) {
  const keys = Object.keys(row);

  for (const possibleName of possibleNames) {
    const normalizedPossibleName =
      normalizeHeader(possibleName);

    const matchingKey = keys.find(
      (key) =>
        normalizeHeader(key) === normalizedPossibleName,
    );

    if (matchingKey !== undefined) {
      return row[matchingKey];
    }
  }

  return "";
}

/* =========================================================
   DUPLICATE KEY
========================================================= */

function createDuplicateKey(data) {
  /*
    Google Maps URL is the strongest identifier when available.
  */

  if (data.mapsUrl) {
    return `maps:${normalizeText(data.mapsUrl)}`;
  }

  /*
    Website is another useful identifier.
  */

  if (data.website) {
    return `website:${normalizeText(data.website)}`;
  }

  /*
    Fallback:
    studio name + address + city + state

    This prevents the same studio from being inserted
    repeatedly when future Excel files are uploaded.
  */

  return [
    "location",
    normalizeText(data.name),
    normalizeText(data.address),
    normalizeText(data.city),
    normalizeText(data.state),
  ].join("|");
}

/* =========================================================
   CONVERT HEADER-BASED ROW
========================================================= */

function convertHeaderRowToStudio(
  row,
  sheetName,
  rowNumber,
) {
  const name = cleanText(
    getColumnFromObject(row, [
      "name",
      "studio name",
      "business name",
      "tattoo studio",
      "studio",
    ]),
  );

  const rating = parseNumber(
    getColumnFromObject(row, [
      "rating",
      "google rating",
      "google rating score",
    ]),
  );

  const reviews = parseReviews(
    getColumnFromObject(row, [
      "reviews",
      "review count",
      "reviews count",
      "number of reviews",
    ]),
  );

  const address = cleanText(
    getColumnFromObject(row, [
      "address",
      "full address",
      "location",
    ]),
  );

  const city = cleanText(
    getColumnFromObject(row, [
      "city",
      "town",
    ]),
  );

  const state = cleanText(
    getColumnFromObject(row, [
      "state",
      "region",
    ]),
  );

  const country =
    cleanText(
      getColumnFromObject(row, [
        "country",
        "country code",
      ]),
    ) || "IN";

  const website = normalizeUrl(
    getColumnFromObject(row, [
      "website",
      "website url",
      "website link",
      "url",
    ]),
  );

  const phone = cleanText(
    getColumnFromObject(row, [
      "phone",
      "phone number",
      "telephone",
      "mobile",
    ]),
  );

  const items = cleanText(
    getColumnFromObject(row, [
      "items",
      "item",
    ]),
  );

  const mapsUrl = normalizeUrl(
    getColumnFromObject(row, [
      "maps url",
      "google maps url",
      "google maps",
      "map url",
      "maps",
    ]),
  );

  const category = cleanText(
    getColumnFromObject(row, [
      "category",
      "business category",
      "type",
    ]),
  );

  if (!name && !address && !phone) {
    return null;
  }

  if (!name) {
    return {
      invalid: true,
      rowNumber,
      sheetName,
      reason: "Studio name is missing.",
    };
  }

  const studioData = {
    sourceRowId: `${sheetName}-${rowNumber}`,

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

    plan: "free",

    verified: false,

    spotlight: false,

    importedAt: new Date(),
  };

  studioData.duplicateKey =
    createDuplicateKey(studioData);

  return studioData;
}

/* =========================================================
   CONVERT HEADERLESS EXCEL ROW
=========================================================

   YOUR CURRENT EXCEL FILE USES THIS FORMAT:

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

  const name = cleanText(row[1]);

  const rating = parseNumber(row[2]);

  const reviews = parseReviews(row[3]);

  const address = cleanText(row[4]);

  const city = cleanText(row[5]);

  const state = cleanText(row[6]);

  const country =
    cleanText(row[7]) || "IN";

  const website = normalizeUrl(row[8]);

  const phone = cleanText(row[9]);

  const items = cleanText(row[10]);

  const mapsUrl = normalizeUrl(row[11]);

  const category = cleanText(row[12]);

  /*
    Completely empty row.
  */

  if (!name && !address && !phone) {
    return null;
  }

  /*
    A directory record without a name isn't useful.
  */

  if (!name) {
    return {
      invalid: true,
      rowNumber,
      sheetName,
      reason: "Studio name is missing.",
    };
  }

  const studioData = {
    sourceRowId: `${sheetName}-${rowNumber}`,

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

    plan: "free",

    verified: false,

    spotlight: false,

    importedAt: new Date(),
  };

  studioData.duplicateKey =
    createDuplicateKey(studioData);

  return studioData;
}

/* =========================================================
   DETECT WHETHER SHEET HAS HEADERS
========================================================= */

function looksLikeHeaderRow(row) {
  if (!Array.isArray(row)) {
    return false;
  }

  const firstSeveral = row
    .slice(0, 13)
    .map((value) => normalizeHeader(value));

  const headerWords = [
    "name",
    "studio name",
    "business name",
    "rating",
    "reviews",
    "review count",
    "address",
    "city",
    "state",
    "country",
    "website",
    "phone",
    "phone number",
    "category",
    "maps url",
    "google maps url",
  ];

  const matches = firstSeveral.filter((value) =>
    headerWords.includes(value),
  );

  return matches.length >= 2;
}

/* =========================================================
   IMPORT EXCEL FILE
========================================================= */

async function importExcelFile(filePath) {
  console.log("==============================================");
  console.log("📊 STARTING EXCEL IMPORT");
  console.log("==============================================");

  console.log(`📁 File: ${filePath}`);

  const workbook = XLSX.readFile(filePath, {
    cellDates: false,
    cellNF: false,
    cellStyles: false,
  });

  const sheetNames = workbook.SheetNames;

  console.log(`📄 Sheets found: ${sheetNames.length}`);
  console.log(`📄 ${sheetNames.join(", ")}`);

  /*
    Process 1,000 records at a time.
  */

  const BATCH_SIZE = 1000;

  let totalRows = 0;
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let invalid = 0;
  let errors = 0;

  const errorRows = [];

  /* =======================================================
     PROCESS EACH SHEET
  ======================================================= */

  for (const sheetName of sheetNames) {
    console.log("");
    console.log(`📑 Processing sheet: ${sheetName}`);

    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      console.log(
        `⚠️ Sheet "${sheetName}" could not be read.`,
      );

      continue;
    }

    /*
      IMPORTANT:

      header:1 means Excel rows are returned as arrays.

      This supports your current headerless Excel file.
    */

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    console.log(`   Rows found: ${rows.length}`);

    if (rows.length === 0) {
      continue;
    }

    /*
      Determine whether the first row is a header.
    */

    const hasHeader = looksLikeHeaderRow(rows[0]);

    console.log(
      `   Header row detected: ${hasHeader ? "YES" : "NO"}`,
    );

    totalRows += hasHeader
      ? Math.max(rows.length - 1, 0)
      : rows.length;

    let batch = [];

    /* =====================================================
       HEADER-BASED FILE
    ===================================================== */

    if (hasHeader) {
      const headers = rows[0];

      for (let index = 1; index < rows.length; index++) {
        const excelRowNumber = index + 1;

        try {
          const objectRow = {};

          headers.forEach((header, columnIndex) => {
            if (
              header !== undefined &&
              header !== null &&
              String(header).trim() !== ""
            ) {
              objectRow[String(header)] =
                rows[index][columnIndex] ?? "";
            }
          });

          const studio = convertHeaderRowToStudio(
            objectRow,
            sheetName,
            excelRowNumber,
          );

          if (studio === null) {
            skipped++;
            continue;
          }

          if (studio.invalid) {
            invalid++;

            errorRows.push({
              sheet: sheetName,
              row: excelRowNumber,
              reason: studio.reason,
            });

            continue;
          }

          batch.push(studio);

          if (batch.length >= BATCH_SIZE) {
            const result = await processBatch(batch);

            imported += result.imported;
            updated += result.updated;
            errors += result.errors;

            batch = [];

            console.log(
              `   ✓ Processed ${index}/${rows.length - 1} rows`,
            );
          }
        } catch (error) {
          errors++;

          errorRows.push({
            sheet: sheetName,
            row: excelRowNumber,
            reason: error.message,
          });

          console.error(
            `❌ Error at ${sheetName} row ${excelRowNumber}:`,
            error.message,
          );
        }
      }
    } else {
      /* =====================================================
         HEADERLESS FILE
      ===================================================== */

      for (let index = 0; index < rows.length; index++) {
        const excelRowNumber = index + 1;

        try {
          const studio = convertArrayRowToStudio(
            rows[index],
            sheetName,
            excelRowNumber,
          );

          if (studio === null) {
            skipped++;
            continue;
          }

          if (studio.invalid) {
            invalid++;

            errorRows.push({
              sheet: sheetName,
              row: excelRowNumber,
              reason: studio.reason,
            });

            continue;
          }

          batch.push(studio);

          if (batch.length >= BATCH_SIZE) {
            const result = await processBatch(batch);

            imported += result.imported;
            updated += result.updated;
            errors += result.errors;

            batch = [];

            console.log(
              `   ✓ Processed ${index + 1}/${rows.length} rows`,
            );
          }
        } catch (error) {
          errors++;

          errorRows.push({
            sheet: sheetName,
            row: excelRowNumber,
            reason: error.message,
          });

          console.error(
            `❌ Error at ${sheetName} row ${excelRowNumber}:`,
            error.message,
          );
        }
      }
    }

    /* =====================================================
       PROCESS REMAINING RECORDS
    ===================================================== */

    if (batch.length > 0) {
      const result = await processBatch(batch);

      imported += result.imported;
      updated += result.updated;
      errors += result.errors;
    }

    console.log(`✅ Finished sheet: ${sheetName}`);
  }

  console.log("");
  console.log("==============================================");
  console.log("📊 EXCEL IMPORT COMPLETE");
  console.log("==============================================");

  console.log(`Total rows: ${totalRows}`);
  console.log(`Imported: ${imported}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Invalid: ${invalid}`);
  console.log(`Errors: ${errors}`);

  console.log("==============================================");

  return {
    success: true,

    summary: {
      sheets: sheetNames.length,
      totalRows,
      imported,
      updated,
      skipped,
      invalid,
      errors,
    },

    errors: errorRows.slice(0, 100),
  };
}

/* =========================================================
   PROCESS MONGODB BATCH
========================================================= */

async function processBatch(batch) {
  if (!batch.length) {
    return {
      imported: 0,
      updated: 0,
      errors: 0,
    };
  }

  const operations = batch.map((studio) => ({
    updateOne: {
      filter: {
        duplicateKey: studio.duplicateKey,
      },

      update: {
        $set: {
          sourceRowId: studio.sourceRowId,
          name: studio.name,
          rating: studio.rating,
          reviews: studio.reviews,
          address: studio.address,
          city: studio.city,
          state: studio.state,
          country: studio.country,
          website: studio.website,
          phone: studio.phone,
          items: studio.items,
          mapsUrl: studio.mapsUrl,
          category: studio.category,
          sourceSheet: studio.sourceSheet,
          importedAt: new Date(),
        },

        $setOnInsert: {
          plan: "free",
          verified: false,
          spotlight: false,
        },
      },

      upsert: true,
    },
  }));

  try {
    const result = await TattooStudio.bulkWrite(
      operations,
      {
        ordered: false,
      },
    );

    return {
      /*
        These are genuinely new MongoDB documents.
      */
      imported: result.upsertedCount || 0,

      /*
        matchedCount represents existing records
        that matched our duplicateKey.
      */
      updated: result.matchedCount || 0,

      errors: 0,
    };
  } catch (error) {
    console.error(
      "❌ MongoDB batch error:",
      error.message,
    );

    return {
      imported: 0,
      updated: 0,
      errors: batch.length,
    };
  }
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  importExcelFile,
  convertArrayRowToStudio,
  convertHeaderRowToStudio,
  createDuplicateKey,
};