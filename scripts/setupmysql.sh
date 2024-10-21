#!/bin/bash
set -e

# Load environment variables from the .env file or ensure they are set before running the script
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ]; then
  echo "Error: Missing one or more environment variables (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)"
  exit 1
fi

echo "Installing MySQL..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

echo "Starting MySQL service..."
sudo systemctl enable mysql
sudo systemctl start mysql

sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'${DB_HOST}' IDENTIFIED BY '${DB_PASSWORD}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'${DB_HOST}';"
sudo mysql -e "FLUSH PRIVILEGES;"


echo "MySQL setup completed."
