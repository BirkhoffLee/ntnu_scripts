#!/bin/bash

set -xe

# Disable captive portal assistant. Reboot required to take effect.
sudo defaults write /Library/Preferences/SystemConfiguration/com.apple.captive.control Active -boolean false

sudo cp ntnuwifiautologin /usr/local/bin
sudo cp NTNUAutoLogin.plist /Library/LaunchDaemons/NTNUAutoLogin.plist
sudo launchctl unload /Library/LaunchDaemons/NTNUAutoLogin.plist || true
sudo launchctl load /Library/LaunchDaemons/NTNUAutoLogin.plist
