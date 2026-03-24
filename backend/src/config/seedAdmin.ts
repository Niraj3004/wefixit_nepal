import User from "../models/user.model";
import { hashPassword } from "../utils/hash";
import { ENV } from "./env.config";
import { ROLES } from "../constants/role";

export const seedAdmin = async () => {
  try {
    const adminEmail = ENV.ADMIN.EMAIL || "admin@repair.com";
    const adminPassword = ENV.ADMIN.PASSWORD || "admin123";

    const existingAdmin = await User.findOne({ role: ROLES.ADMIN, email: adminEmail });

    if (!existingAdmin) {
      console.log(`[Seed] System Admin not found in DB. Seeding now...`);
      const hashedPassword = await hashPassword(adminPassword);
      
      await User.create({
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: hashedPassword,
        phone: "0000000000",
        currentAddress: "Headquarters",
        role: ROLES.ADMIN,
        isVerified: true
      });
      console.log(`[Seed] System Admin successfully seeded into DB.`);
    } else {
      console.log(`[Seed] System Admin already exists in DB.`);
    }
  } catch (error) {
    console.error(`[Seed Error] Could not seed admin to DB:`, error);
  }
};
