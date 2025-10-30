const mineflayer = require('mineflayer');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Keep-alive server
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('MuthBot is alive!');
}).listen(PORT, '0.0.0.0', () => console.log(`[HTTP] Alive on port ${PORT}`));

let bot;

const config = {
  server: { host: "muthserver.aternos.me", port: 25565, version: "1.21.1" },
  bot: { username: "MuthBot", password: "njbruto" },
  reconnect: { delay: 180000 }
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

  bot.once('login', () => console.log(`[SUCCESS] Logged in as ${bot.username}`));

  // Auto register & login
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
    console.log('[SPAWN] Bot has spawned and is ready.');
  });

  bot.on('kicked', (reason) => {
    console.log(`[KICKED] ${JSON.stringify(reason)}`);
    handleEnd();
  });

  bot.on('error', (err) => {
    console.log(`[ERROR] ${err.message}`);
    handleEnd();
  });

  bot.on('end', () => {
    console.log('[INFO] Disconnected from server.');
    handleEnd();
  });
}

function handleEnd() {
  console.log(`[RECONNECT] Reconnecting in ${config.reconnect.delay / 1000}s...`);
  setTimeout(createBot, config.reconnect.delay);
}

createBot();
