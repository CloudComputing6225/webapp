#!/bin/bash
set -e


echo "Installing MySQL..."
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

echo "Starting MySQL service..."
sudo systemctl enable mysql
sudo systemctl start mysql

echo "ALTER USER 'root'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD'; FLUSH PRIVILEGES; CREATE DATABASE webapp; " | sudo mysql


echo "MySQL setup completed."
