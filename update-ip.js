const os = require('os');
const fs = require('fs');

const interfaces = os.networkInterfaces();
let localIp = 'localhost';

for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIp = iface.address;
      break;
    }
  }
}

const envContent = `EXPO_PUBLIC_API_URL=http://${localIp}:8000/api\n`;

fs.writeFileSync('.env', envContent);

console.log(`Success! .env updated with local IP: ${localIp}`);