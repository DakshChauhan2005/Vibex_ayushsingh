import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userModel from "../model/user.model.js";
import serviceModel from "../model/service.model.js";
import bookingModel from "../model/booking.model.js";
import reviewModel from "../model/review.model.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const USER_DEMO = {
  name: "Aarav Customer",
  email: "user.demo@example.com",
  password: "Password123",
  role: "user",
  location: "Noida",
  isVerified: true,
};

const PROVIDER_DEMO = {
  name: "Rohan Provider",
  email: "provider.demo@example.com",
  password: "Password123",
  role: "provider",
  location: "Noida",
  isVerified: true,
};

const LEGACY_DEMO_EMAILS = [
  "user.demo@example.com",
  "user2.demo@example.com",
  "provider.demo@example.com",
  "provider2.demo@example.com",
  "admin.demo@example.com",
];

const TARGET_SERVICE_COUNT = 100;

const categoryCycle = ["plumber", "electrical", "tutoring", "maintenance", "cleaning"];

function buildDemoServices(providerId) {
  return Array.from({ length: TARGET_SERVICE_COUNT }, (_, index) => {
    const number = index + 1;
    const category = categoryCycle[index % categoryCycle.length];
    return {
      title: `${category.toUpperCase()} Service #${number}`,
      description: `Demo ${category} service package number ${number} for local marketplace testing.`,
      category,
      price: 350 + (index % 25) * 20,
      provider: providerId,
      location: "Noida",
    };
  });
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function cleanupExistingDemoData() {
  const demoUsers = await userModel.find({ email: { $in: LEGACY_DEMO_EMAILS } }).select("_id");
  const demoUserIds = demoUsers.map((user) => user._id);

  if (demoUserIds.length === 0) {
    return;
  }

  const demoServices = await serviceModel.find({ provider: { $in: demoUserIds } }).select("_id");
  const demoServiceIds = demoServices.map((service) => service._id);

  await reviewModel.deleteMany({
    $or: [
      { user: { $in: demoUserIds } },
      { service: { $in: demoServiceIds } },
    ],
  });

  await bookingModel.deleteMany({
    $or: [
      { user: { $in: demoUserIds } },
      { provider: { $in: demoUserIds } },
      { service: { $in: demoServiceIds } },
    ],
  });

  await serviceModel.deleteMany({ provider: { $in: demoUserIds } });
  await userModel.deleteMany({ email: { $in: LEGACY_DEMO_EMAILS } });
}

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/hack";
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in environment");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB for demo seeding");

  try {
    await cleanupExistingDemoData();

    const user = await userModel.create(USER_DEMO);
    const provider = await userModel.create(PROVIDER_DEMO);

    const services = await serviceModel.insertMany(buildDemoServices(provider._id));

    const now = new Date();

    const bookings = await bookingModel.insertMany([
      {
        user: user._id,
        provider: provider._id,
        service: services[0]._id,
        date: addHours(now, 24),
        status: "pending",
      },
      {
        user: user._id,
        provider: provider._id,
        service: services[1]._id,
        date: addHours(now, 48),
        status: "accepted",
      },
      {
        user: user._id,
        provider: provider._id,
        service: services[2]._id,
        date: addHours(now, -72),
        status: "completed",
      },
      {
        user: user._id,
        provider: provider._id,
        service: services[3]._id,
        date: addHours(now, -48),
        status: "rejected",
      },
    ]);

    await reviewModel.insertMany([
      {
        user: user._id,
        service: services[2]._id,
        rating: 5,
        comment: "Demo review for completed booking.",
      },
    ]);

    await Promise.all(services.map((service) => reviewModel.recalculateServiceRating(service._id)));

    console.log("Demo data seeded successfully");
    console.log("Demo credentials:");
    console.log("- user.demo@example.com / Password123 (user)");
    console.log("- provider.demo@example.com / Password123 (provider)");
    console.log(`Seeded ${services.length} services for one provider.`);
    console.log(`Seeded ${bookings.length} bookings and 1 review for one user.`);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seed().catch((error) => {
  if (error?.code === "ECONNREFUSED" || error?.code === "ENOTFOUND") {
    console.error("Failed to reach MongoDB. Check MONGO_URI or run local MongoDB on 127.0.0.1:27017.");
  }
  console.error("Failed to seed demo data:", error);
  process.exit(1);
});
