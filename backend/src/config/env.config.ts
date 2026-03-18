import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 4000,
  MONGO_URI: process.env.MONGO_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  JWT_SECRET: process.env.JWT_SECRET,

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUD_NAME!,
    API_KEY: process.env.API_KEY!,
    API_SECRET: process.env.API_SECRET!,
  },
  ADMIN: {
    EMAIL: process.env.ADMIN_EMAIL,
    PASSWORD: process.env.ADMIN_PASSWORD,
  },
};
