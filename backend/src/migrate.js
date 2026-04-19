import "dotenv/config";
import { migrate } from "./db.js";

migrate();
console.log("Vocrit AI backend schema is up to date.");
