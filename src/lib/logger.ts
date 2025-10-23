import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  levels,
  format,
  transports,
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ],
});

// Create a stream object for Morgan HTTP logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Logging utility functions
export const logError = (error: Error, context?: any) => {
  logger.error(`${error.message}`, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, {
    meta,
    timestamp: new Date().toISOString(),
  });
};

export const logWarning = (message: string, meta?: any) => {
  logger.warn(message, {
    meta,
    timestamp: new Date().toISOString(),
  });
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, {
    meta,
    timestamp: new Date().toISOString(),
  });
};

export const logHttp = (message: string, meta?: any) => {
  logger.http(message, {
    meta,
    timestamp: new Date().toISOString(),
  });
};

// API request logging middleware
export const logApiRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };
    
    if (res.statusCode >= 400) {
      logError(new Error(`HTTP ${res.statusCode}`), logData);
    } else {
      logHttp(`${req.method} ${req.url}`, logData);
    }
  });
  
  next();
};

// Database operation logging
export const logDbOperation = (operation: string, collection: string, duration: number, error?: Error) => {
  const logData = {
    operation,
    collection,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  };
  
  if (error) {
    logError(error, logData);
  } else {
    logDebug(`DB ${operation} on ${collection}`, logData);
  }
};

// Authentication logging
export const logAuth = (action: string, userId?: string, success: boolean = true, error?: Error) => {
  const logData = {
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
  };
  
  if (error) {
    logError(error, logData);
  } else {
    logInfo(`Auth ${action}`, logData);
  }
};

// Payment logging
export const logPayment = (action: string, amount?: number, currency?: string, success: boolean = true, error?: Error) => {
  const logData = {
    action,
    amount,
    currency,
    success,
    timestamp: new Date().toISOString(),
  };
  
  if (error) {
    logError(error, logData);
  } else {
    logInfo(`Payment ${action}`, logData);
  }
};

// Socket.IO logging
export const logSocketEvent = (event: string, userId?: string, roomId?: string, error?: Error) => {
  const logData = {
    event,
    userId,
    roomId,
    timestamp: new Date().toISOString(),
  };
  
  if (error) {
    logError(error, logData);
  } else {
    logDebug(`Socket ${event}`, logData);
  }
};

// Performance logging
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString(),
  };
  
  if (duration > 1000) {
    logWarning(`Slow operation: ${operation}`, logData);
  } else {
    logDebug(`Performance: ${operation}`, logData);
  }
};

// Security logging
export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any) => {
  const logData = {
    event,
    severity,
    details,
    timestamp: new Date().toISOString(),
  };
  
  switch (severity) {
    case 'critical':
    case 'high':
      logError(new Error(`Security event: ${event}`), logData);
      break;
    case 'medium':
      logWarning(`Security event: ${event}`, logData);
      break;
    case 'low':
      logInfo(`Security event: ${event}`, logData);
      break;
  }
};

export default logger;
