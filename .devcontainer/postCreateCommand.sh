#!/bin/bash

cd ./
npm install

cd /tmp
wget https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz && sudo tar -xvf act_Linux_x86_64.tar.gz -C /bin/ act