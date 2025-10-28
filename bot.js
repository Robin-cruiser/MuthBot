const mineflayer = require('mineflayer');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

if (!config.server.host || !config.server.port) {
  console.error('[ERROR] Invalid configuration: server host and port are required');
  process.exit(1);
}

if (!config.bot.username) {
  console.error('[ERROR] Invalid configuration: bot username is required');
  process.exit(1);
}

let bot;
let reconnectTimeout;
let afkInterval;

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
    console.log(`[SUCCESS] Bot logged in as ${bot.username}`);
    console.log(`[INFO] Connected to ${config.server.host}:${config.server.port}`);
  });

  bot.on('spawn', () => {
    console.log('[SUCCESS] Bot spawned in the world!');
    console.log(`[INFO] Position: ${bot.entity.position}`);
    console.log('[INFO] AFK mode active - keeping server alive 24/7');
    
    if (afkInterval) {
      clearInterval(afkInterval);
    }
    
    afkInterval = setInterval(() => {
      if (bot && bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          bot.setControlState('jump', false);
        }, 100);
      }
    }, 30000);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`[CHAT] <${username}> ${message}`);
    
    if (message.toLowerCase().includes(bot.username.toLowerCase())) {
      bot.chat('I am an AFK bot keeping this server active!');
    }
  });

  bot.on('health', () => {
    if (bot.health <= 5) {
      console.log(`[WARNING] Low health: ${bot.health}/20`);
    }
  });

  bot.on('death', () => {
    console.log('[EVENT] Bot died! Respawning...');
  });

  bot.on('kicked', (reason) => {
    console.log(`[ERROR] Kicked from server: ${reason}`);
    handleReconnect();
  });

  bot.on('error', (err) => {
    console.log(`[ERROR] ${err.message}`);
    handleReconnect();
  });

  bot.on('end', () => {
    console.log('[INFO] Connection ended');
    handleReconnect();
  });
}

function handleReconnect() {
  if (afkInterval) {
    clearInterval(afkInterval);
    afkInterval = null;
  }
  
  if (config.reconnect.enabled) {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
    }
    
    const delay = config.reconnect.delay / 1000;
    console.log(`[INFO] Reconnecting in ${delay} seconds...`);
    
    reconnectTimeout = setTimeout(() => {
      createBot();
    }, config.reconnect.delay);
  } else {
    console.log('[INFO] Auto-reconnect disabled. Exiting...');
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n[INFO] Shutting down bot...');
  if (afkInterval) {
    clearInterval(afkInterval);
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  if (bot) {
    bot.quit();
  }
  process.exit(0);
});

console.log('=== Minecraft AFK Bot ===');
console.log(`Server: ${config.server.host}:${config.server.port}`);
console.log(`Username: ${config.bot.username}`);
console.log(`Auto-reconnect: ${config.reconnect.enabled ? 'Enabled' : 'Disabled'}`);
console.log('========================\n');

createBot();
