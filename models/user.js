/** Models to handle SQL scripts for routes */

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {
  /** Authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email }
   *
   * Throws UnauthorizedError if user is not found or wrong password.
   *  */
  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT username,
              password,
              first_name AS "firstName",
              last_name AS "lastName",
              email
        FROM users
        WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email }
   *
   * Throws BadRequestError on duplicates.
   */

  static async register({ username, password, firstName, lastName, email }) {
    const duplicateCheck = await db.query(
      `SELECT username
       FROM users
       WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
       (username,
        password,
        first_name,
        last_name,
        email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING username,
                 first_name AS "firstName",
                 last_name AS "lastName",
                 email`,
      [username, hashedPassword, firstName, lastName, email]
    );

    const user = result.rows[0];

    return user;
  }

  /** Given a username, return data about user.
   *
   * Returns { username, firstName, lastName, email, favoritedProperties }
   *  where favorited_properties is [ property_zpid ] for zillow properties
   *
   * Throws NotFoundError if user not found.
   */

  static async get(username) {
    const userRes = await db.query(
      `SELECT id,
              username,
              first_name AS "firstName",
              last_name AS "lastName",
              email
       FROM users
       WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    const userPropertiesRes = await db.query(
      `SELECT props.property_zpid
       FROM favorited_properties AS props
       WHERE props.user_id = $1`,
      [user.id]
    );

    user.favoritedProperties = userPropertiesRes.rows.map((p) => {
      return p.property_zpid;
    });
    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update", only changes user data that is provided.
   *
   * Data can include: { firstName, lastName, password, email }
   *
   * Returns { username, firstName, lastName, email }
   *
   * Throws NotFoundError if not found.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
    });

    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users
                      SET ${setCols}
                      WHERE username = ${usernameVarIdx}
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email`;

    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }

  /** Delete given user from database.
   *
   * Returns undefined.
   */

  static async remove(username) {
    let result = await db.query(
      `DELETE FROM users
       WHERE username = $1
       RETURNING username`,
      [username]
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No User: ${username}`);
  }

  /** Favorite a property.
   *
   * - username: user logged in
   * - zpid: property id
   *
   * Returns undefined.
   */

  static async favoriteProperty(username, zpid) {
    const userRes = await db.query(
      `SELECT id,
              username
       FROM users
       WHERE username = $1`,
      [username]
    );
    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(
      `INSERT INTO favorited_properties (user_id, property_zpid)
       VALUES ($1, $2)`,
      [user.id, zpid]
    );
  }

  /** Unfavorite a property.
   *
   * - username: user logged in
   * - zpid: property id
   *
   * Returns undefined.
   */

  static async unFavoriteProperty(username, zpid) {
    const userRes = await db.query(
      `SELECT id,
              username
       FROM users
       WHERE username = $1`,
      [username]
    );
    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No username: ${username}`);

    await db.query(
      `DELETE FROM favorited_properties
       WHERE user_id = $1
       AND property_zpid = $2`,
      [user.id, zpid]
    );
  }
}

module.exports = User;
