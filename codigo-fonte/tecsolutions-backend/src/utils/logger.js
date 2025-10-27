import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Configuração de cores para diferentes níveis
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Função para garantir que o diretório de logs existe
const ensureLogDirectory = () => {
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
};

// Garantir que o diretório existe
const logDir = ensureLogDirectory();

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Formato para console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'tecsolutions-backend' },
  transports: [
    // Arquivo para erros
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Arquivo para todos os logs
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Adicionar console em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Logger específico para requests HTTP
const requestLogger = winston.createLogger({
  level: 'http',
  format: logFormat,
  defaultMeta: { service: 'tecsolutions-backend-requests' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'requests.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Logger para banco de dados
const dbLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'tecsolutions-backend-db' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'database.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Logger para autenticação
const authLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'tecsolutions-backend-auth' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'auth.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Coleção de loggers
const loggers = {
  main: logger,
  request: requestLogger,
  db: dbLogger,
  auth: authLogger
};

// Função para limpar logs antigos
const cleanOldLogs = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias
  const now = Date.now();

  fs.readdir(logDir, (err, files) => {
    if (err) {
      logger.error('Erro ao ler diretório de logs:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(logDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          logger.error('Erro ao obter stats do arquivo:', err);
          return;
        }

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error('Erro ao deletar log antigo:', err);
            } else {
              logger.info(`Log antigo removido: ${file}`);
            }
          });
        }
      });
    });
  });
};

// Executar limpeza de logs antigos uma vez por dia
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);

export {
  logger,
  loggers,
  requestLogger,
  ensureLogDirectory,
  cleanOldLogs,
};
