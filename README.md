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


# Assignment4

# Overview

Overview
This project automates the creation of a custom Amazon Machine Image (AMI) using HashiCorp Packer. The custom AMI includes:

A Node.js web application.

MySQL server setup.

Pre-configured environment variables for database connection using a .env file.

A systemd service to start the Node.js app automatically when the instance launches.

# Prerequisites
Before you begin, ensure you have the following installed:

HashiCorp Packer
AWS CLI
A valid AWS account with access to create AMIs.
GitHub repository with secret values for database credentials and AWS credentials (for GitHub Actions).
Secrets Configuration
Make sure the following secrets are set in your GitHub repository:

AWS_ACCESS_KEY_ID - Your AWS access key.
AWS_SECRET_ACCESS_KEY - Your AWS secret access key.
DB_USER - Database user.
DB_PASSWORD - Database password.
DB_NAME - Name of the database.
DB_HOST - Host for the database.
PORT - The port your web application will run on.


# Author

Saurabh Srivastava

email: srivastava.sau@northeastern.edu

NUID: 002895225

test