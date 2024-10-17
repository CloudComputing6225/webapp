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


echo "MySQL setup completed."
