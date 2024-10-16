#!/bin/bash
sudo apt update
sudo apt upgrade -y

echo "Inside the AMI Machine"


sudo apt install -y nodejs
node -v
sudo systemctl enable mysql
sudo apt-get install -y mysql-server
ls
mkdir webapp

ls -al


sudo cp /tmp/webapp.zip /home/ec2-user/webapp/webapp.zip
cd webapp/
pwd
ls
unzip webapp.zip  -d /home/ec2-user/webapp/
pwd
    
ls
rm -rf webapp.zip
ls
pwd

echo "In webapp folder"

npm i
npm test