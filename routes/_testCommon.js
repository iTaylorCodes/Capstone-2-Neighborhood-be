"use strict";
/** Common test functions for routes.  */

process.env.NODE_ENV = "test";
const db = require("../db");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

const testZpids = [123, 456];

async function commonBeforeAll() {
  await db.query("DELETE FROM users");

  await db.query("DELETE FROM favorited_properties");

  await User.register({
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    email: "test@test.com",
    password: "password",
  });

  await User.favoriteProperty("testuser", testZpids[0]);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const userToken = createToken({ username: "testuser" });
const user2Token = createToken({ username: "testuser2" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testZpids,
  userToken,
  user2Token,
};
