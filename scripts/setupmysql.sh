#!/bin/bash
set -e

# Load environment variables from the .env file
export $(grep -v '^#' /opt/app/.env | xargs)

echo "Installing MySQL..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

echo "Starting MySQL service..."
sudo systemctl enable mysql
sudo systemctl start mysql

echo "Configuring MySQL..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';"
sudo mysql -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';"
sudo mysql -e "FLUSH PRIVILEGES;"

echo "MySQL setup completed."
