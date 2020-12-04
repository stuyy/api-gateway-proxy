/**
 * This file should be imported at the very top of the entry file.
 * This will ensure all environment variables are loaded into memory
 * so that they can be used accordingly.
 *
 * Here we check what the environment is. On your local machine you would normally
 * have an environment variable set to "DEVELOPMENT" so that way you can
 * load URLs that are being ran on Localhost rather than the production URLs.
 *
 * In production, you'd want to make sure your actual production URL is being
 * called. Thus, we have two separate env files, .env.dev and .env.prod.
 * .env.dev loads all of our variables that we use for development
 * e.g: localhost urls
 * .env.prod loads all of our production variables,
 * e.g: http://somebusinessdomain.com/api/auth
 */

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
