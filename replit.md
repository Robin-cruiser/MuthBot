# Minecraft Bot (muthBot)

## Overview
This is a Minecraft bot built with mineflayer that connects to a Minecraft server and performs random moveme>

## Project Structure
- `bot.js` - Main bot logic with connection handling and random movement
- `config.json` - Configuration file (currently unused in favor of inline config)
- `package.json` - Node.js dependencies and scripts

## Features
- Connects to Minecraft server (muthserver.aternos.me)
- Performs random walking movements (forward, back, left, right, jump)
- Automatic reconnection on disconnect/error
- HTTP keep-alive server on port 3000 for monitoring

## Setup Date
Imported and configured for Replit environment on October 28, 2025

## Architecture
- Runtime: Node.js 20
- Main dependency: mineflayer v4.18.0
- Console application (no frontend)
- HTTP keep-alive server on port 3000

## 24/7 Operation with UptimeRobot

### Deployment
This bot is configured for VM deployment, which keeps it running 24/7. To deploy:
1. Click the "Deploy" button in Replit
2. Select "Reserved VM" deployment type
3. Follow the prompts to publish your bot

### UptimeRobot Setup (For Development Mode)
If you want to keep the development version alive using UptimeRobot:

1. Get your Replit URL:
   - Your dev URL will be shown in the Webview panel
   - It should look like: `https://your-repl-name.your-username.repl.co`

2. Set up UptimeRobot monitor:
   - Go to uptimerobot.com and create a free account
   - Add new monitor with these settings:
     - Monitor Type: HTTP(s)
     - Friendly Name: Minecraft Bot
     - URL: Your Replit dev URL (from step 1)
     - Monitoring Interval: 5 minutes
   - Save the monitor

3. The bot will respond to UptimeRobot pings on port 3000 with "Bot is alive and running!"

### Important Notes About Aternos Servers
- The server (muthserver.aternos.me) is an Aternos free server
- Aternos servers go to sleep when empty and must be manually started
- The bot will show "ECONNRESET" errors when the server is offline
- The bot automatically reconnects every 3 minutes (180 seconds)
- Once the Aternos server is online, the bot will connect successfully

## Recent Changes
- October 29, 2025: Configured for 24/7 operation with VM deployment
- Added robust error handling for server connection issues
- Configured HTTP keep-alive server for UptimeRobot monitoring
