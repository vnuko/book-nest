import os from 'os';
import { config } from '../config/index.js';

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (!nets) continue;
    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

function padRight(str: string, len: number): string {
  return str + ' '.repeat(Math.max(0, len - str.length));
}

function getSystemInfo(): { platform: string; arch: string; nodeVersion: string; memory: string } {
  const totalMemory = os.totalmem();
  const memoryGB = (totalMemory / (1024 * 1024 * 1024)).toFixed(1);
  return {
    platform: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    nodeVersion: process.version,
    memory: `${memoryGB} GB`,
  };
}

const cyan = '\x1b[36m';
const orange = '\x1b[38;5;214m';
const gray = '\x1b[38;5;246m';
const darkGray = '\x1b[38;5;8m';
const bold = '\x1b[1m';
const reset = '\x1b[0m';

export function displaySplash(): void {
  const ip = getLocalIP();
  const port = config.server.port;
  const env = config.server.nodeEnv;
  const sys = getSystemInfo();
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const version = process.env.npm_package_version || '1.0.0';

  const lines = [
    '',
    `  ${gray}+--------------------------------------------------+${reset}`,
    `  ${gray}|${reset}                                                  ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}${cyan} ____    ___    ___   __  _  ____     ___  _____ ______ ${reset} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}${cyan}|    \\  /   \\  /   \\ |  |/ ]|    \\   /  _]/ ___/|      | ${reset} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}${cyan}|  o  )|     ||     ||  ' / |  _  | /  [_(   \\_ |      | ${reset} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}${cyan}|     ||  O  ||  O  ||    \\ |  |  ||    _]\\__  ||_|  |_| ${reset} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}${cyan}|  O  ||     ||     ||     ||  |  ||   [_ /  \\ |  |  |  ${reset} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}${cyan}|     ||     ||     ||  .  ||  |  ||     |\\    |  |  |  ${reset} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}${cyan}|_____| \\___/  \\___/ |__|\\_||__|__||_____| \\___|  |__|   ${reset} ${gray}|${reset}`,
    `  ${gray}|${reset}                                                  ${gray}|${reset}`,
    `  ${gray}|${reset}  ${darkGray}------------------------------------------------${reset}  ${gray}|${reset}`,
    `  ${gray}|${reset}                                                  ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}Server${reset}    ${darkGray}|${reset} ${padRight(`http://${ip}:${port}`, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}Local${reset}     ${darkGray}|${reset} ${padRight(`http://localhost:${port}`, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${bold}Docs${reset}      ${darkGray}|${reset} ${padRight(`http://localhost:${port}/api-docs`, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}                                                  ${gray}|${reset}`,
    `  ${gray}|${reset}  ${orange}Version${reset}   ${darkGray}|${reset} ${padRight(`v${version}`, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${orange}Env${reset}       ${darkGray}|${reset} ${padRight(env, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${orange}Time${reset}      ${darkGray}|${reset} ${padRight(timestamp, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}                                                  ${gray}|${reset}`,
    `  ${gray}|${reset}  ${gray}System${reset}     ${darkGray}|${reset} ${padRight(`${sys.platform} (${sys.arch})`, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${gray}Node${reset}       ${darkGray}|${reset} ${padRight(sys.nodeVersion, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}  ${gray}Memory${reset}     ${darkGray}|${reset} ${padRight(sys.memory, 35)} ${gray}|${reset}`,
    `  ${gray}|${reset}                                                  ${gray}|${reset}`,
    `  ${gray}+--------------------------------------------------+${reset}`,
    '',
  ];

  lines.forEach((line) => console.log(line));
}
