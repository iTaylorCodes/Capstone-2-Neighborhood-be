process.env.NODE_ENV = "test";
const { UnauthorizedError } = require("../expressError");
const ensureCorrectUser = require("./auth");

describe("ensureCorrectUser", function () {
  test("works: same user", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureCorrectUser(req, res, next);
  });

  test("unauth: mismatch", function () {
    expect.assertions(1);
    const req = { params: { username: "wrong" } };
    const res = { locals: { user: { username: "test" } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUser(req, res, next);
  });

  test("unauth: if anon", function () {
    expect.assertions(1);
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureCorrectUser(req, res, next);
  });
});
