/** Express app for Neighborhood */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const app = express();

app.use(cors());
app.use(express.json());

// Handle 404 errors, for routes that don't match
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

module.exports = app;
