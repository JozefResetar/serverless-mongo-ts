import mongoose from 'mongoose';
const { DB_COLLECTION } = process.env;
import path from "path";
import dotenv from "dotenv";
const { NODE_ENV } = process.env;
const dotenvPath = path.join(__dirname, '../../', `config/.env.${NODE_ENV}`);
console.log(dotenvPath)
dotenv.config({
  path: dotenvPath,
});
const { DB_URL, DB_NAME } = process.env;
console.log(DB_URL, DB_NAME);
export const MONGO_CONNECTION = mongoose.connect(DB_URL, {
  dbName: DB_NAME,
});

export type EntitiesDocument = mongoose.Document & {
  city: String,
  id: String,
  county_name: String,
  state_name: String,
  createdAt: Date,
};

const EntitiesSchema = new mongoose.Schema({
  city: String,
  id: { type: String, index: true, unique: true },
  county_name: String,
  state_name: String,
  createdAt: { type: Date, default: Date.now },
});

// Note: OverwriteModelError: Cannot overwrite `Entities` model once compiled. error
export const Entities = (mongoose.models.Entities ||
mongoose.model<EntitiesDocument>('Entities', EntitiesSchema, DB_COLLECTION)
);