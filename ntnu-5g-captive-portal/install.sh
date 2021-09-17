#!/bin/bash

sudo cp ntnuwifiautologin /usr/local/bin
cp NTNUAutoLogin.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/NTNUAutoLogin.plist
