const mineflayer = require('mineflayer');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Keep-alive web server
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('MuthBot is alive!');
}).listen(PORT, '0.0.0.0', () => console.log(`[HTTP] Alive on port ${PORT}`)));

let bot;
let antiAfkInterval;

const config = {
  server: { host: "muthserver.aternos.me", port: 25565, version: "1.21.1" },
  bot: { username: "MuthBot", password: "njbruto" },
  reconnect: { delay: 7000 } // 7 seconds
};

function createBot() {
  console.log(`[INFO] Connecting to ${config.server.host}:${config.server.port}...`);

  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.bot.username,
    version: config.server.version,
    auth: 'offline',
    keepAlive: true
  });

  bot.once('login', () => {
    console.log(`[SUCCESS] Logged in as ${bot.username}`);
  });

  // Auto register/login
  bot.on('message', (msg) => {
    const text = msg.toString().toLowerCase();
    if (text.includes('/register') || text.includes('register')) {
      console.log(`[AUTH] Registering with password "${config.bot.password}"`);
      bot.chat(`/register ${config.bot.password} ${config.bot.password}`);
    } else if (text.includes('/login') || text.includes('login')) {
      console.log(`[AUTH] Logging in with password "${config.bot.password}"`);
      bot.chat(`/login ${config.bot.password}`);
    }
  });

  bot.on('spawn', () => {
    console.log('[SPAWN] Bot spawned successfully.');

    // restart anti-AFK interval
    if (antiAfkInterval) clearInterval(antiAfkInterval);

    antiAfkInterval = setInterval(() => {
      try {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        console.log('[ANTI-AFK] Jumped to stay active.');
      } catch (e) {
        console.log('[ANTI-AFK] Jump failed:', e.message);
      }
    }, 30000); // jump every 30 s
  });

  // reconnect handling
  bot.on('kicked', (reason) => {
    console.log(`[KICKED] ${JSON.stringify(reason)}`);
    handleReconnect();
  });

  bot.on('error', (err) => {
    console.log(`[ERROR] ${err.message}`);
    handleReconnect();
  });

  bot.on('end', () => {
    console.log('[INFO] Disconnected from server.');
    handleReconnect();
  });
}

function handleReconnect() {
  if (antiAfkInterval) clearInterval(antiAfkInterval);
  console.log(`[RECONNECT] Trying again in ${config.reconnect.delay / 1000}s...`);
  setTimeout(createBot, config.reconnect.delay);
}

createBot();
