#!/bin/bash
set -e

# Create systemd service file
cat << EOF | sudo tee /etc/systemd/system/webapp.service
[Unit]
Description=Web Application
After=network.target

[Service]
Type=simple
User=csye6225
WorkingDirectory=/opt/app
EnvironmentFile=/opt/app/.env
ExecStart=/usr/bin/node /opt/app/app.js
Restart=on-failure
TimeoutStartSec=60

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable the service
sudo systemctl enable webapp.service

# Start the service
sudo systemctl start webapp.service

# Check the status
sudo systemctl status webapp.service