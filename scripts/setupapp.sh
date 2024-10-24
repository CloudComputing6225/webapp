#!/bin/bash
set -e

# Create /opt/app directory if it doesn't exist
sudo mkdir -p /opt/app

# Navigate to the application directory
cd /opt/app

# Check if the artifact exists
if [ ! -f webapp-artifact.zip ]; then
    echo "Error: webapp-artifact.zip not found in /opt/app"
    ls -la /opt/app  # List directory contents for debugging
    exit 1
fi

echo "Unzipping application artifact..."
sudo unzip -o webapp-artifact.zip -d .

echo "Removing packer directory if it exists..."
sudo rm -rf packer

echo "Setting correct ownership..."
sudo chown -R csye6225:csye6225 /opt/app/node_modules

echo "Installing dependencies..."
sudo -u csye6225 npm install

echo "Application setup completed successfully."