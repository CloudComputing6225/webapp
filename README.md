# Cloud Computing Web Application

This is a RESTful web application built with Node.js that provides user management functionality with secure authentication and AWS integration.

# Prerequisites

Node.js (v18 or higher)

npm (Node Package Manager)

MySQL

AWS CLI configured with appropriate credentials

Git

# Local Development Setup

Clone the repository:

`cd webapp`

Install dependencies:

bashCopy `npm install`


Start the development server:

bashCopy `npm run dev`


Authentication

The application uses Token-Based Basic Authentication. Include the token in the Authorization header for authenticated endpoints.

Testing

Run the test suite:

bashCopy `npm test`

Deployment

The application uses GitHub Actions for CI/CD. On merge to main:

Tests are run

Application is built

Packer creates a custom AMI

Auto Scaling Group is updated with new Launch Template

Instance refresh is triggered

AWS Integration

The application integrates with:

Amazon RDS for database

Amazon S3 for file storage

CloudWatch for logging and metrics

SNS for email notifications

Route 53 for DNS management

Application Load Balancer for traffic distribution
