#!/bin/bash
set -e

# Load environment variables from .env file
export $(grep -v '^#' /opt/app/.env | xargs)

# Enable and start MySQL service
sudo systemctl enable mysql
sudo systemctl start mysql

# Set up MySQL database and user using values from .env
echo "Setting up MySQL database and user..."

sudo mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'$DB_HOST' IDENTIFIED BY '$DB_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'$DB_HOST';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "MySQL database setup completed successfully."
