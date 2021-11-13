CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1)
)

CREATE TABLE favorited_properties (
  user_id INTEGER
    REFERENCES users ON DELETE CASCADE,
  property_zpid INTEGER NOT NULL,
  PRIMARY KEY (user_id, property_zpid)
)