const mineflayer = require('mineflayer');
const http = require('http');

// Keep Render awake
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('MuthBot is running!');
}).listen(PORT, '0.0.0.0', () =>
  console.log(`[HTTP] Alive on port ${PORT}`)
);

let bot;
let antiAFK;
let restartTimer; // <-- Added this to manage the timer

const config = {
  server: { host: "muthserver.aternos.me", port: 25565, version: "1.21.1" },
  bot: { username: "Muth", password: "njbruto" },
  reconnect: { delay: 7000 }
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

  bot.once('login', () => {
    console.log(`[SUCCESS] Logged in as ${bot.username}`);
  });

  // Auto-register and login
  bot.on('message', (msg) => {
    const text = msg.toString().toLowerCase();
    if (text.includes('/register') || text.includes('register')) {
      console.log('[AUTH] Registering...');
      bot.chat(`/register ${config.bot.password} ${config.bot.password}`);
    } else if (text.includes('/login') || text.includes('login')) {
      console.log('[AUTH] Logging in...');
      bot.chat(`/login ${config.bot.password}`);
    }
  });

  // On spawn
  bot.once('spawn', () => {
    console.log('[SPAWN] Bot spawned, enabling anti-AFK...');
    // Clear old timers just in case
    if (antiAFK) clearInterval(antiAFK);
    if (restartTimer) clearInterval(restartTimer);

    // Anti-AFK
    antiAFK = setInterval(() => {
      try {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
      } catch (e) {
        console.error('[AFK] Error:', e.message);
      }
    }, 30000); // every 30 seconds

    // --- NEW RESTART LOGIC ---
    const restartInterval = 15 * 60 * 60 * 1000; // 15 hours in milliseconds
    console.log(`[RESTART] Auto-restart scheduled every 15 hours.`);
    
    restartTimer = setInterval(() => {
      console.log('[RESTART] Sending /restart command...');
      try {
        bot.chat('/restart');
      } catch (e) {
        console.error('[RESTART] Error sending command:', e.message);
      }
    }, restartInterval);
    // --- END NEW LOGIC ---
  });

  bot.on('end', () => {
    console.log('[INFO] Disconnected. Reconnecting in 7s...');
    // Clear timers on disconnect
    if (antiAFK) clearInterval(antiAFK);
    if (restartTimer) clearInterval(restartTimer); // <-- Clean up restart timer
    setTimeout(createBot, config.reconnect.delay);
  });

  bot.on('error', (err) => {
    console.log(`[ERROR] ${err.message}`);
  });

  bot.on('kicked', (reason) => {
    console.log(`[KICKED] ${reason}`);
  });
}

createBot();
