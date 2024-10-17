#!/bin/bash
set -e

echo "Creating .env file..."
sudo mkdir -p /opt/app

cat << EOF | sudo tee /opt/app/.env
DB_HOST=127.0.0.1
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_DIALECT=mysql
PORT=${PORT}
EOF

echo ".env file created at /opt/app/.env"
