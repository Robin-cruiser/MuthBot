const mineflayer = require('mineflayer');
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is alive and running!');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[HTTP] Port ${PORT} is already in use, retrying in 5s...`);
    setTimeout(() => {
      server.close();
      server.listen(PORT, '0.0.0.0');
    }, 5000);
  } else {
    console.error(`[HTTP] Server error: ${err.message}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[HTTP] Keep-alive server running on port ${PORT}`);
});

let bot;
let moveInterval;

const config = {
  server: { host: "muthserver.aternos.me", port: 25565, version: "1.21.1" },
  bot: { username: "MuthBot" },
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
    checkTimeoutInterval: 60000,
    keepAlive: true
  });

  bot.on('login', () => console.log(`[SUCCESS] Logged in as ${bot.username}`));

  bot.on('spawn', () => {
    console.log('[SUCCESS] Spawned! Waiting 20s...');
    if (moveInterval) clearInterval(moveInterval);

    setTimeout(() => {
      console.log('[INFO] Random walking...');
      const dirs = ['forward', 'back', 'left', 'right', 'jump'];
      moveInterval = setInterval(() => {
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        bot.setControlState(dir, true);
        setTimeout(() => bot.setControlState(dir, false), 700);
      }, 4000);
    }, 20000);
  });

  bot.on('kicked', (reason) => {
    console.log(`[KICKED] ${JSON.stringify(reason)}`);
    handleEnd();
  });

  bot.on('error', (err) => {
    if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
      console.log(`[ERROR] Cannot connect to server (${err.code}). Server may be offline.`);
    } else if (err.message && err.message.includes('timed out')) {
      console.log(`[ERROR] Connection timeout. Server not responding to keepalive packets.`);
      } else {
      console.log(`[ERROR] ${err.message}`);
    }
    handleEnd();
  });

  bot.on('end', () => {
    console.log('[INFO] Disconnected');
    handleEnd();
  });
}

function handleEnd() {
  if (moveInterval) clearInterval(moveInterval);
  console.log(`[INFO] Reconnecting in ${config.reconnect.delay / 1000}s...`);
  setTimeout(createBot, config.reconnect.delay);
}

createBot();
