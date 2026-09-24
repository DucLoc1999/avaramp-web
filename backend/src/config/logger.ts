import pino, { type DestinationStream } from 'pino';
import path from 'path';
import fs from 'fs';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getCurrentDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLogFilePath = (date?: string): string => {
  const dateStr = date || getCurrentDateString();
  return path.join(logsDir, `${dateStr}.log`);
};

const logFilePath = getLogFilePath();
const fileStream = pino.destination({
  dest: logFilePath,
  sync: true,
  mkdir: true,
});

const isDevelopment = process.env.NODE_ENV !== 'production';

const createConsoleStream = (): DestinationStream => {
  if (!isDevelopment) return process.stdout;
  try {
    const target = require.resolve('pino-pretty');
    return pino.transport({
      target,
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss.l',
        ignore: 'pid,hostname',
        singleLine: true,
      },
    });
  } catch {
    return process.stdout;
  }
};

const consoleStream: DestinationStream = createConsoleStream();

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream([
    {
      level: process.env.LOG_LEVEL || 'info',
      stream: consoleStream,
    },
    {
      level: process.env.LOG_LEVEL || 'info',
      stream: fileStream,
    },
  ])
);

export const rotateLogsIfNeeded = (): void => {
  const currentLogFile = getLogFilePath();

  if (!fs.existsSync(currentLogFile)) {
    fs.writeFileSync(currentLogFile, '');
  }
};

setInterval(
  () => {
    rotateLogsIfNeeded();
  },
  60 * 60 * 1000
);

export default logger;
