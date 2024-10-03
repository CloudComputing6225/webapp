# webapp
# Assignment1

This project implements a Health Check RESTful API using Node.js, Express, and Sequelize ORM. The /healthz endpoint allows monitoring the health of the application instance by checking the database connection status. It returns appropriate HTTP status codes based on the application's health.

# Getting started

`git clone "repo-url"`

Install dependencies: `npm install`

Configure the database by creating a .env file

Running the application: `npm run dev`

# Health Check Endpoints:

Successful Response(200 OK): `curl -vvvv http://localhost:8080/healthz`

Database connection failure(503 Service Unavailable): `curl -vvvv http://localhost:8080/healthz`

Method not allowed(405 Method Not Allowed):` curl -vvvv -XPUT http://localhost:8080/healthz`


# Assignment2

# Features

User Registration: Create a new user with email, password, first name, and last name.

User Authentication: Authenticate a user using HTTP Basic Authentication.

User Information: Retrieve and update user information. Restrictions are placed to prevent email updates and modifying other sensitive fields.

Health Check Endpoint: Check the health of the application (e.g., database connection).

Input Validation: Proper error handling when unexpected fields are provided.

# API Endpoints

POST /v1/user: Create a new user.

GET /v1/user/self: Get authenticated user's information.

PUT /v1/user/self: Update authenticated user's information.

GET /healthz: Health check for the application


# Deploying the Project to a DigitalOcean Droplet

Create a new Ubuntu 20.04 droplet.

Once created, access the droplet using SSH:`ssh root@your_droplet_ip`

Update your package index and install the packages.




# Author

Saurabh Srivastava

email: srivastava.sau@northeastern.edu

NUID: 002895225
