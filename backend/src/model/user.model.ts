import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Create a Schema corresponding to the document interface.
const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default mongoose.model<IUser>("User", UserSchema);