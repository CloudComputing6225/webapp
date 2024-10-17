#!/bin/bash
set -e

# Define the path to the .env file
ENV_FILE="/opt/app/.env"

# Create or overwrite the .env file with the environment variables
echo "Creating .env file at $ENV_FILE..."

cat << EOF | sudo tee $ENV_FILE
DB_HOST=127.0.0.1
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_DIALECT=mysql
PORT=3000
EOF

echo ".env file created successfully."
