#!/bin/bash
set -e

# Create csye6225 group if it doesn't exist
sudo groupadd -f csye6225

# Create csye6225 user with no login shell
sudo useradd -m -d /home/csye6225 -s /usr/sbin/nologin -g csye6225 csye6225