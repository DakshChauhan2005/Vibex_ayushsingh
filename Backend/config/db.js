import mongoose from "mongoose";

async function dropLegacyUserIndexes() {
  try {
    const usersCollection = mongoose.connection.db.collection("users");
    const indexes = await usersCollection.indexes();
    const hasLegacyUsernameIndex = indexes.some((index) => index.name === "username_1");

    if (hasLegacyUsernameIndex) {
      await usersCollection.dropIndex("username_1");
      console.log("Dropped legacy index: users.username_1");
    }
  } catch (error) {
    // If the collection does not exist yet, there is nothing to clean up.
    if (error?.codeName !== "NamespaceNotFound") {
      console.warn("Unable to clean up legacy user indexes:", error.message);
    }
  }
}

const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/perplexity',);
    await mongoose.connect(process.env.MONGO_URI);
    console.log(process.env.MONGO_URI);
    
    await dropLegacyUserIndexes();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;