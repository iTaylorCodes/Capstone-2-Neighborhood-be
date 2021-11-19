/** Middleware to handle user auth in routes */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it. If valid, store the token payload
 * on res.locals (this includes the username).
 */
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware: Ensure correct user is logged in.
 *
 * If not, raises UnauthorizedError.
 */
function ensureCorrectUser(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && user.username === req.params.username)) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticateJWT, ensureCorrectUser };
