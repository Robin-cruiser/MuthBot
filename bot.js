const mineflayer = require('mineflayer');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let bot;
let reconnectTimeout;
let moveInterval;

function createBot() {
  console.log(`[INFO] Connecting to ${config.server.host}:${config.server.port}...`);

  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.bot.username,
    version: config.server.version || false,
    auth: 'offline'
  });

  bot.on('login', () => {
    console.log(`[SUCCESS] Logged in as ${bot.username}`);
  });

  bot.on('spawn', () => {
    console.log('[SUCCESS] Spawned in the world!');
    console.log('[INFO] Waiting 20 seconds before movement...');
    if (moveInterval) clearInterval(moveInterval);

    setTimeout(() => {
      console.log('[INFO] Starting random movement...');
      const directions = ['forward', 'back', 'left', 'right', 'jump'];
      moveInterval = setInterval(() => {
        if (!bot || !bot.entity) return;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        bot.setControlState(dir, true);
        setTimeout(() => bot.setControlState(dir, false), 700);
      }, 4000);
    }, 20000);
  });

  bot.on('kicked', (reason) => {
    console.log(`[KICKED] ${reason}`);
    handleReconnect();
  });

  bot.on('error', (err) => {
    console.log(`[ERROR] ${err.message}`);
    handleReconnect();
  });

  bot.on('end', () => {
    console.log('[INFO] Disconnected');
    handleReconnect();
  });
}

function handleReconnect() {
  if (moveInterval) clearInterval(moveInterval);
  if (!config.reconnect.enabled) return process.exit(1);
  console.log(`[INFO] Reconnecting in ${config.reconnect.delay / 1000}s...`);
  reconnectTimeout = setTimeout(createBot, config.reconnect.delay);
}

process.on('SIGINT', () => {
  console.log('\n[INFO] Shutting down...');
  if (moveInterval) clearInterval(moveInterval);
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (bot) bot.quit();
  process.exit(0);
});

console.log('=== Minecraft AFK Bot ===');
console.log(`Server: ${config.server.host}:${config.server.port}`);
console.log(`Username: ${config.bot.username}`);
console.log(`Reconnect: ${config.reconnect.enabled ? 'Enabled' : 'Disabled'}`);
console.log('=========================\n');

createBot();
