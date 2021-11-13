require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "super-secret";

const PORT = +process.env.PORT || 3001;

// Speed up bcrypt during testing
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
};
