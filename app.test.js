const request = require("supertest");

const app = require("./app");

test("not found for site 404", async function () {
  const resp = await request(app).get("/no-path");
  expect(resp.statusCode).toEqual(404);
});
