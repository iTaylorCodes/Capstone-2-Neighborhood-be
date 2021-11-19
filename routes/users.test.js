"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testZpids,
  userToken,
  user2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .get(`/users/testuser`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.body).toEqual({
      user: {
        id: expect.any(Number),
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
        favoritedProperties: [testZpids[0]],
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get(`/users/testuser`)
      .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/users/testuser`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .get("/users/testuser")
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
  test("works for same user", async function () {
    const resp = await request(app)
      .patch(`/users/testuser`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "testuser",
        firstName: "New",
        lastName: "User",
        email: "test@test.com",
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .patch(`/users/testuser`)
      .send({
        firstName: "New",
      })
      .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/users/testuser`).send({
      firstName: "New",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request if invalid data", async function () {
    const resp = await request(app)
      .patch(`/users/testuser`)
      .send({
        firstName: 42,
      })
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("works: can set new password", async function () {
    const resp = await request(app)
      .patch(`/users/testuser`)
      .send({
        password: "new-password",
      })
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.body).toEqual({
      user: {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@test.com",
      },
    });
    const isSuccessful = await User.authenticate("testuser", "new-password");
    expect(isSuccessful).toBeTruthy();
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .delete(`/users/testuser`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.body).toEqual({ deleted: "testuser" });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
      .delete(`/users/testuser`)
      .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/users/testuser`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .delete("/users/testuser")
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** POST /users/:username/:propertyZpid */

describe("POST /users/:username/:propertyZpid", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .post(`/users/testuser/${testZpids[1]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.body).toEqual({ favorited: testZpids[1] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
      .post(`/users/testuser/${testZpids[1]}`)
      .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post(`/users/testuser/${testZpids[1]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .post(`/users/testuser/${testZpids[1]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** DELETE /users/:username/:propertyZpid */

describe("DELETE /users/:username/:propertyZpid", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .delete(`/users/testuser/${testZpids[0]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.body).toEqual({ unFavorited: testZpids[0] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
      .delete(`/users/testuser/${testZpids[0]}`)
      .set("authorization", `Bearer ${user2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/users/testuser/${testZpids[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
      .delete(`/users/testuser/${testZpids[0]}`)
      .set("authorization", `Bearer ${userToken}`);
    expect(resp.statusCode).toEqual(500);
  });
});
