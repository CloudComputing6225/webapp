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

# Author

Saurabh Srivastava

email: srivastava.sau@northeastern.edu

NUID: 002895225
