const winston = require('winston');
const path = require('path');

// Configuração de cores para diferentes níveis
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato para arquivos (sem cores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Configuração dos transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  }),
  
  // Arquivo para todos os logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'app.log'),
    format: fileFormat,
    level: 'info',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Arquivo específico para erros
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    format: fileFormat,
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Criar logger principal
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Logger específico para requisições HTTP
const httpLogger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'access.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Logger para auditoria
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// Funções auxiliares para logging estruturado
const loggers = {
  // Log de informações gerais
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  // Log de erros
  error: (message, error = null, meta = {}) => {
    const errorMeta = {
      ...meta,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      })
    };
    logger.error(message, errorMeta);
  },

  // Log de warnings
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  // Log de debug (apenas em desenvolvimento)
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // Log de requisições HTTP
  http: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || 'anonymous',
    };

    httpLogger.http('HTTP Request', logData);
    
    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const statusColor = res.statusCode >= 400 ? 'red' : 'green';
      console.log(
        `${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`
      );
    }
  },

  // Log de auditoria para ações importantes
  audit: (action, userId, details = {}) => {
    auditLogger.info('Audit Log', {
      action,
      userId,
      timestamp: new Date().toISOString(),
      details,
    });
  },

  // Log de autenticação
  auth: (action, userId, ip, success = true, details = {}) => {
    const level = success ? 'info' : 'warn';
    logger[level](`Auth: ${action}`, {
      userId,
      ip,
      success,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // Log de operações de banco de dados
  database: (operation, table, duration, success = true, error = null) => {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      logData.error = {
        message: error.message,
        code: error.code,
      };
    }

    const level = success ? 'debug' : 'error';
    logger[level](`Database: ${operation} on ${table}`, logData);
  },

  // Log de performance
  performance: (operation, duration, threshold = 1000) => {
    const level = duration > threshold ? 'warn' : 'debug';
    logger[level](`Performance: ${operation}`, {
      duration: `${duration}ms`,
      threshold: `${threshold}ms`,
      slow: duration > threshold,
      timestamp: new Date().toISOString(),
    });
  },

  // Log de segurança
  security: (event, severity = 'medium', details = {}) => {
    const level = severity === 'high' ? 'error' : 'warn';
    logger[level](`Security: ${event}`, {
      severity,
      timestamp: new Date().toISOString(),
      ...details,
    });
  },

  // Log de sistema
  system: (event, details = {}) => {
    logger.info(`System: ${event}`, {
      timestamp: new Date().toISOString(),
      ...details,
    });
  },
};

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    loggers.http(req, res, duration);
  });
  
  next();
};

// Função para criar diretório de logs se não existir
const ensureLogDirectory = () => {
  const fs = require('fs');
  const logDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    loggers.system('Log directory created', { path: logDir });
  }
};

// Função para limpar logs antigos
const cleanOldLogs = (daysToKeep = 30) => {
  const fs = require('fs');
  const logDir = path.join(process.cwd(), 'logs');
  
  if (!fs.existsSync(logDir)) return;
  
  const files = fs.readdirSync(logDir);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  files.forEach(file => {
    const filePath = path.join(logDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtime < cutoffDate) {
      fs.unlinkSync(filePath);
      loggers.system('Old log file deleted', { file });
    }
  });
};

// Inicialização
ensureLogDirectory();

// Limpeza automática de logs (executar uma vez por dia)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    cleanOldLogs(30);
  }, 24 * 60 * 60 * 1000); // 24 horas
}

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  loggers.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  loggers.error('Unhandled Rejection', new Error(reason), { promise });
});

module.exports = {
  logger,
  loggers,
  requestLogger,
  ensureLogDirectory,
  cleanOldLogs,
};