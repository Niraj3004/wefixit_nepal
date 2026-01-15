// config file
import { config } from "dotenv";
config();
export const ENV = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,

  // middleware confi
//   JWT_SECRET: process.env.jwtSecretKey,
//   JWT_EXPIRES_IN: process.env.jwtExpiresIn,

  // mail configure
//   EMAIL: {
//     USER: process.env.EMAIL_USER,
//     PASS: process.env.EMAIL_PASS,
//   },

  // Cloundinary configure
//   CLOUDINARY: {
//     CLOUD_NAME: process.env.CLOUNDINARY_CLOUD_NAME,
//     API_KEY: process.env.CLOUNDINARY_API_KEY,
//     API_SECRET: process.env.CLOUNDINARY_API_SECRET,
//   },
};
if (!ENV.MONGO_URI || !ENV.DATABASE_NAME) {
  console.error("❌ ERROR: MONGO_URI is not defined in .env file");
  process.exit(1);
} else {
  console.log("✅ Environment variables loaded successfully!");
}