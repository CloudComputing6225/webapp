#!/bin/bash
set -e

# Load environment variables from .env file


# Enable and start MySQL service
sudo systemctl enable mysql
sudo systemctl start mysql
