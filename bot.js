const mineflayer = require('mineflayer');
const http = require('http');

// keep-alive server for UptimeRobot
http.createServer((req, res) => res.end('bot alive')).listen(3000);

let bot;
let moveInterval;

// === CONFIG ===
const config = {
  server: { host: "muthserver.aternos.me", port: 25565, version: "1.21.1" },
  bot: { username: "_NJ_" },
  reconnect: { delay: 180000 } // 3 minutes (to avoid throttle)
};

// === BOT CREATION ===
function createBot() {
  console.log(`[INFO] Connecting to ${config.server.host}:${config.server.port}...`);

  bot = mineflayer.createBot({
    host: config.server.host,
    port: config.server.port,
    username: config.bot.username,
    version: config.server.version,
    auth: 'offline'
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
    console.log(`[ERROR] ${err.message}`);
    handleEnd();
  });

  bot.on('end', () => {
    console.log('[INFO] Disconnected');
    handleEnd();
  });
}

// === RECONNECT ===
function handleEnd() {
  if (moveInterval) clearInterval(moveInterval);
  console.log(`[INFO] Reconnecting in ${config.reconnect.delay / 1000}s...`);
  setTimeout(createBot, config.reconnect.delay);
}

createBot();
