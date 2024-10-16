#!/bin/bash
set -e

sudo apt-get remove -y git
which git || echo 'Git is not installed'