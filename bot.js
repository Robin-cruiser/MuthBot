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

  bot.on('login', () => console.log(`[SUCCESS] Logged in as ${bot.username}`));

  bot.on('spawn', () => {
    console.log('[SUCCESS] Spawned in the world!');
    console.log('[INFO] Waiting 20 seconds before movement...');
    if (moveInterval) clearInterval(moveInterval);

    setTimeout(() => {
      console.log('[INFO] Starting natural movement...');
      moveInterval = setInterval(() => {
        if (!bot || !bot.entity) return;

        // Random head rotation
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.5;
        bot.look(yaw, pitch, true);

        // Random movement
        const dirs = ['forward', 'back', 'left', 'right'];
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        bot.setControlState(dir, true);
        if (Math.random() < 0.3) bot.setControlState('jump', true);

        setTimeout(() => {
          bot.setControlState(dir, false);
          bot.setControlState('jump', false);
        }, 400 + Math.random() * 600);
      }, 8000 + Math.random() * 4000);
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

  if (!config.reconnect.enabled) {
    console.log('[INFO] Auto-reconnect disabled. Exiting...');
    process.exit(1);
  }

  // random 30–60 s delay
  const base = config.reconnect.delay || 30000;
  const delay = base + Math.random() * 30000;
  console.log(`[INFO] Reconnecting in ${Math.round(delay / 1000)} seconds...`);

  reconnectTimeout = setTimeout(createBot, delay);
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
