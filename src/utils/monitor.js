import fs from 'fs';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logFile = path.join(logDir, 'monitor.log');

export function appendMonitorLog(entry) {
  const line = `${new Date().toISOString()} | ${entry}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (e) {
    console.error('Monitor log error', e);
  }
}

export default appendMonitorLog;
