variable "aws_region" {
  type    = string
  default = "us-west-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0dfcb1ef8550277af" #Amazon Linux 2
}


variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

variable "subnet_id" {
  type    = string
  default = "subnet-05205e07844431c50"

}

variable "dev" {
  type    = string
  default = "dev"
}


variable "ami_users" {
  type    = list(string)
  default = [""]
}


# https://www.packer.io/plugins/builders/amazon/ebs
source "amazon-ebs" "my-ami" {
  region = "${var.aws_region}"
  //profile         = "${var.dev}"
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "AMI for CSYE 6225"
  ami_regions = [
    "us-east-1",
  ]


  ami_users = var.ami_users

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }


  instance_type = "t2.micro"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"

  }
}


build {
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/webapp.zip"
  }


  provisioner "file" {
    source      = "./scripts/webapp.service"
    destination = "/tmp/webapp.service"
  }


  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1",
    ]
    scripts = [
      "scripts/start.sh",
      "scripts/systemd.sh"
    ]


  }

  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
  }

}