const mineflayer = require('mineflayer');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Simple keep-alive HTTP server (for Replit / Render / Glitch, etc.)
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('MuthBot is online!');
}).listen(PORT, '0.0.0.0', () => console.log(`[HTTP] Alive on port ${PORT}`));

let bot;
let moveInterval;

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

  // === Auto Register & Login ===
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

  // === On Spawn ===
  bot.once('spawn', () => {
    console.log('[SPAWN] Bot spawned successfully.');
    setTimeout(() => {
      console.log('[INFO] Successfully logged in. Acting like a normal player...');
      bot.chat('MuthServer is on');
      startRandomBehavior();
    }, 8000);
  });

  // === Random Human-Like Movement ===
  function startRandomBehavior() {
    if (moveInterval) clearInterval(moveInterval);
    const dirs = ['forward', 'back', 'left', 'right'];

    moveInterval = setInterval(() => {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const say = messages[Math.floor(Math.random() * messages.length)];

      // Move a bit
      bot.setControlState(dir, true);
      setTimeout(() => bot.setControlState(dir, false), 1200);

      // Sometimes chat naturally
      if (Math.random() < 0.3) bot.chat(say);
    }, 10000);
  }

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
  if (moveInterval) clearInterval(moveInterval);
  console.log(`[RECONNECT] Reconnecting in ${config.reconnect.delay / 1000}s...`);
  setTimeout(createBot, config.reconnect.delay);
}

createBot();
