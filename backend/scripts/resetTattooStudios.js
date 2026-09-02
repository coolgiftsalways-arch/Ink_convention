const mongoose = require("mongoose");
require("dotenv").config();

const TattooStudio = require("../models/TattooStudio");

async function resetTattooStudios() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const beforeCount =
      await TattooStudio.countDocuments();

    console.log(
      `📦 Existing tattoo studios/artists: ${beforeCount}`
    );

    const result =
      await TattooStudio.deleteMany({});

    console.log(
      `🗑️ Deleted: ${result.deletedCount}`
    );

    const afterCount =
      await TattooStudio.countDocuments();

    console.log(
      `📦 Remaining: ${afterCount}`
    );

    await mongoose.disconnect();

    console.log("✅ Done");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset failed:", error);

    await mongoose
      .disconnect()
      .catch(() => {});

    process.exit(1);
  }
}

resetTattooStudios();