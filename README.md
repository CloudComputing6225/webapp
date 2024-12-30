# Cloud Computing Web Application

## Overview
This is a production-grade RESTful web application built with Node.js that provides robust user management functionality with secure authentication and comprehensive AWS cloud integration. The application follows cloud-native principles and implements industry best practices for security, scalability, and reliability.

## Features
- User account management with secure password handling
- Token-based authentication system
- Profile image upload and management
- Email verification system using AWS SNS and Lambda
- Comprehensive logging and metrics
- Auto-scaling and high availability
- Security-first approach with encryption at rest and in transit

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: MySQL with AWS RDS
- **Cloud Provider**: Amazon Web Services (AWS)
- **CI/CD**: GitHub Actions
- **Infrastructure**: Terraform
- **Image Building**: Packer
- **Monitoring**: AWS CloudWatch
- **Storage**: AWS S3
- **DNS Management**: Route 53
- **Load Balancing**: AWS Application Load Balancer

## Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- MySQL (for local development)
- AWS CLI configured with appropriate credentials
- Git
- Terraform (for infrastructure deployment)
- Packer (for AMI creation)

## Local Development Setup

### 1. Clone the repository
```bash
git clone git@github.com:your-org/webapp.git
cd webapp
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=csye6225
DB_PORT=3306

# AWS Configuration (for local development)
AWS_REGION=us-east-1
AWS_PROFILE=dev

# S3 Configuration
S3_BUCKET_NAME=your-bucket-name

# Other Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

### 4. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE csye6225;

# Run migrations
npm run migrate
```

### 5. Start Development Server
```bash
npm run dev
```

## API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://api.yourdomain.com`

### Authentication
The application uses Token-Based Basic Authentication. Include the authentication token in the Authorization header:
```
Authorization: Basic <base64-encoded-credentials>
```

### Available Endpoints

#### User Management
- `POST /v1/user` - Create new user account
  - Required fields: email, password, firstName, lastName
  - Returns: User object (excluding password)

- `PUT /v1/user/self` - Update user information
  - Requires authentication
  - Updatable fields: firstName, lastName, password
  - Returns: Updated user object

- `GET /v1/user/self` - Get user information
  - Requires authentication
  - Returns: User object with profile image details

#### Profile Image Management
- `POST /v1/user/self/pic` - Upload profile picture
  - Requires authentication
  - Accepts: multipart/form-data
  - File size limit: 5MB
  - Supported formats: JPEG, PNG

- `DELETE /v1/user/self/pic` - Delete profile picture
  - Requires authentication
  - Returns: 204 No Content

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "User API"

# Run with coverage
npm run test:coverage
```

### Test Suites
- Unit tests for all services
- Integration tests for API endpoints
- Authentication tests
- File upload tests
- Database operation tests

## Deployment

### CI/CD Pipeline
The application uses GitHub Actions for continuous integration and deployment:

1. **On Pull Request**:
   - Runs linting checks
   - Executes test suite
   - Validates infrastructure code

2. **On Merge to Main**:
   - Runs all tests
   - Builds application artifact
   - Creates new AMI using Packer
   - Updates Launch Template
   - Triggers Auto Scaling Group refresh

### Infrastructure
- Multi-AZ deployment in AWS
- Auto Scaling Group (min: 3, max: 5 instances)
- Application Load Balancer for traffic distribution
- Private subnets for application instances
- Public subnets for load balancer

## AWS Integration

### Services Used
- **Amazon RDS**: MySQL database hosting
- **Amazon S3**: Profile image storage
- **CloudWatch**: 
  - Application logging
  - Custom metrics for API calls
  - Performance monitoring
- **SNS**: Email notification system
- **Lambda**: Email verification processing
- **Route 53**: DNS management
- **Application Load Balancer**: Traffic distribution
- **KMS**: Encryption key management
- **Secrets Manager**: Credential management

### Security
- All data encrypted at rest using KMS
- SSL/TLS encryption for data in transit
- Secure credential management using AWS Secrets Manager
- Network security with properly configured Security Groups
- IAM roles with least privilege principle

## Monitoring and Logging

### CloudWatch Metrics
- API call counts
- API response times
- Database query performance
- S3 operation latency
- Custom business metrics

### Logs
- Application logs
- Access logs
- Error logs
- AWS service interaction logs

## Troubleshooting

### Common Issues
1. **Database Connection Issues**
   ```bash
   # Check RDS connectivity
   mysql -h <rds-endpoint> -u <username> -p
   ```

2. **S3 Access Issues**
   ```bash
   # Verify IAM roles
   aws sts get-caller-identity
   ```

3. **Application Startup Issues**
   ```bash
   # Check logs
   npm run logs
   ```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is proprietary and confidential.