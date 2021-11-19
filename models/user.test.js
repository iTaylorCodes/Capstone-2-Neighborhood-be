process.env.NODE_ENV = "test";
const bcrypt = require("bcrypt");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");
const User = require("./user");

const testZpids = [123, 456];
const testUserIds = [];

beforeAll(async function () {
  await db.query("DELETE FROM users");

  const res = await db.query(
    `INSERT INTO users(username,
                      password,
                      first_name,
                      last_name,
                      email)
     VALUES ('testuser', $1, 'Test', 'User', 'test@test.com')
     RETURNING id`,
    [await bcrypt.hash("password", BCRYPT_WORK_FACTOR)]
  );

  const user = res.rows[0];
  testUserIds.push(user.id);

  await db.query(
    `INSERT INTO favorited_properties(user_id, property_zpid)
     VALUES ($1, $2)`,
    [testUserIds[0], testZpids[0]]
  );
});

beforeEach(async function () {
  await db.query("BEGIN");
});

afterEach(async function () {
  await db.query("ROLLBACK");
});

afterAll(async function () {
  await db.end();
});

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("testuser", "password");
    expect(user).toEqual({
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("testuser", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual(newUser);
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let user = await User.get("testuser");
    expect(user).toEqual({
      id: testUserIds[0],
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
      favoritedProperties: [testZpids[0]],
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    firstName: "NewF",
    lastName: "NewL",
    email: "new@email.com",
  };

  test("works", async function () {
    let updatedUser = await User.update("testuser", updateData);
    expect(updatedUser).toEqual({
      username: "testuser",
      ...updateData,
    });
  });

  test("works: set password", async function () {
    let updatedUser = await User.update("testuser", {
      password: "newpassword",
    });
    expect(updatedUser).toEqual({
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      email: "test@test.com",
    });
    const found = await db.query(
      "SELECT * FROM users WHERE username = 'testuser'"
    );
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", {
        firstName: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("testuser", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await User.remove("testuser");
    const res = await db.query("SELECT * FROM users WHERE username='testuser'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** favoriteProperty */

describe("favoriteProperty", function () {
  test("works", async function () {
    await User.favoriteProperty("testuser", testZpids[1]);

    const res = await db.query(
      'SELECT property_zpid AS "propertyZpid" FROM favorited_properties WHERE property_zpid=$1',
      [testZpids[1]]
    );
    expect(res.rows).toEqual([
      {
        propertyZpid: testZpids[1],
      },
    ]);
  });

  test("not found if no such user", async function () {
    try {
      await User.favoriteProperty("nope", testZpids[0]);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** unFavoriteProperty */

describe("unFavoriteProperty", function () {
  test("works", async function () {
    await User.favoriteProperty("testuser", testZpids[1]);

    const firstRes = await db.query(
      'SELECT property_zpid AS "propertyZpid" FROM favorited_properties WHERE property_zpid=$1',
      [testZpids[1]]
    );
    expect(firstRes.rows).toEqual([
      {
        propertyZpid: testZpids[1],
      },
    ]);

    await User.unFavoriteProperty("testuser", testZpids[1]);

    const secondRes = await db.query(
      'SELECT property_zpid AS "propertyZpid" FROM favorited_properties WHERE property_zpid=$1 AND user_id=$2',
      [testZpids[1], testUserIds[0]]
    );
    expect(secondRes.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.unFavoriteProperty("nope", testZpids[0]);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
