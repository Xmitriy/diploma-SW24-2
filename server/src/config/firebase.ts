import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./src/config/firebase_config.json", "utf8")
);

if (!process.env.FIREBASE_STORAGE_BUCKET) {
  throw new Error("FIREBASE_STORAGE_BUCKET environment variable is not set");
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: "gs://fitness-4d9e3.firebasestorage.app",
  });
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

export const bucket = admin.storage().bucket();
export default admin;
