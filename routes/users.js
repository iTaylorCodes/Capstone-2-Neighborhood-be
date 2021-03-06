/** Routes for users. */

const jsonschema = require("jsonschema");
const express = require("express");

const { ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = new express.Router();

/** GET /[username] => { user }
 *
 * Returns { id, username, firstName, lastName, email, favoritedProperties }
 *  where favoritedProperties is [ property_zpid ] for zillow properties
 *
 * Authorization required: same user as :username
 */

router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});

/** POST /[username]/[propertyZpid]  { state } => { favorited }
 *
 * Returns { "favorited": propertyZpid }
 *
 * Authorization required: admin or same-user-as-:username
 * */

router.post(
  "/:username/:propertyZpid",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const propertyZpid = +req.params.propertyZpid;
      await User.favoriteProperty(req.params.username, propertyZpid);
      return res.json({ favorited: propertyZpid });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[username]/[propertyZpid]  =>  { unFavorited: propertyZpid }
 *
 * Authorization required: admin or same-user-as-:username
 * */

router.delete(
  "/:username/:propertyZpid",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const propertyZpid = +req.params.propertyZpid;
      await User.unFavoriteProperty(req.params.username, propertyZpid);
      return res.json({ unFavorited: propertyZpid });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
