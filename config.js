/** Shared config for application */

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "super-secret";

const PORT = +process.env.PORT || 3001;

// Use development db, testing db, or via env variable, production db
function getDatabaseUri() {
  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith("postgres://")) {
      process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
        "postgres://",
        "postgresql://"
      );
    }
  }

  return process.env.NODE_ENV === "test"
    ? "neighborhood_test"
    : process.env.DATABASE_URL || "neighborhood";
}

// Speed up bcrypt during testing
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
