# Neighborhood - backend

[![Build Status](https://app.travis-ci.com/iTaylorCodes/Capstone-2-Neighborhood-be.svg?branch=main)](https://app.travis-ci.com/iTaylorCodes/Capstone-2-Neighborhood-be)
[![Coverage Status](https://coveralls.io/repos/github/iTaylorCodes/Capstone-2-Neighborhood-be/badge.svg?branch=main)](https://coveralls.io/github/iTaylorCodes/Capstone-2-Neighborhood-be?branch=main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/bad995c947eb4511b1fa32d43b24bce2)](https://www.codacy.com/gh/iTaylorCodes/Capstone-2-Neighborhood-be/dashboard?utm_source=github.com&utm_medium=referral&utm_content=iTaylorCodes/Capstone-2-Neighborhood-be&utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/ea9b38ad79dd197f671b/maintainability)](https://codeclimate.com/github/iTaylorCodes/Capstone-2-Neighborhood-be/maintainability)

Neighborhood is an application that makes it easy to discover great neighborhoods to live in. Using walkability and crime scores from the API provided by `walkscore.com` as well as the zillow API to show properties available in those neighborhoods.

The backend for Neighborhood handles connecting to the application database for user account functionality.

# Local Setup

If you'd like to setup a local version of Neighborhood, follow these steps:

## 1. Clone the respository

`$ git clone https://github.com/iTaylorCodes/Capstone-2-Neighborhood-be.git`

`$ cd capstone-2-Neighborhood-be`

## 2. Install all requirements

`$ npm install`

## 3. Create a local PostgreSQL db and setup tables

`$ createdb neighborhood`

`$ psql neighborhood < neighborhood.sql`

## 5. Run the server and navigate your browser to http://localhost:3001/

`npm start`

# Testing

To fully test the application, running

`$ npm test`

will test all routes, models, helper functions, and middleware.

# Routes and User Flow

Routes accept and return JSON formatted data.

### `/auth/register` - POST, Registers new user

- **Accepts:** `{ username, password, firstName, lastName, email }`

- **Returns:** `{ token }`

### `/auth/token` - POST, Logs in user

- **Accepts:** `{ username, password }`

- **Returns:** `{ token }`

### `/users/:username` - GET, Returns user data from database

- **Returns:** `{ id, username, firstName, lastName, email, favoritedProperties }`

### `/users/:username` - PATCH, Updates user data

- **Accepts:** `{ firstName, lastName, password, email }`

- **Returns:** `{ username, firstName, lastName, email }`

### `/users/:username` - DELETE, Deletes user

- **Returns:** `{ deleted: username }`

### `/users/:username/:propertyZpid` - POST, Adds zillow property to user favorites

- **Returns:** `{ favorited: propertyZpid }`

### `/users/:username/:propertyZpid` - DELETE, Removes a zillow property from user favorites

- **Returns:** `{ unFavorited: propertyZpid }`

# Deployment

The backend for Neighborhood is deployed using Heroku.
You can access it at: https://neighborhood-be.herokuapp.com/

# Technologies Used

Neighborhood-backend was created using:

- Node.js
- Express.js
- PostgreSQL
- JSON
- JSON Schema Validation
- Jest
