/** Middleware to handle user auth in routes */

const { UnauthorizedError } = require("../expressError");

// Middleware: Ensure correct user is logged in
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

module.exports = ensureCorrectUser;
