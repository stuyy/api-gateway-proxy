import { config } from "dotenv";
import path from "path";
const { ENVIRONMENT } = process.env;

if (ENVIRONMENT === "DEVELOPMENT") {
  const envPath = path.join(__dirname, "..", "env", ".env.dev");
  config({ path: envPath });
} else if (ENVIRONMENT === "PRODUCTION") {
  const envPath = path.join(__dirname, "..", "env", ".env.prod");
  config({ path: envPath });
}
