import winston from 'winston';

// ✅ Logger configurat pentru CloudWatch
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ahauros-admin-backend' },
  transports: [
    // Console transport pentru development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// ✅ Logging functions pentru monitorizare
export const logError = (message, error, context = {}) => {
  logger.error(message, {
    error: error.message,
    stack: error.stack,
    ...context
  });
};

export const logInfo = (message, context = {}) => {
  logger.info(message, context);
};

export const logWarn = (message, context = {}) => {
  logger.warn(message, context);
};

// ✅ Specialized logging pentru Andreea GPT
export const logAndreeaRequest = (prompt, userId, responseTime, success) => {
  logger.info('Andreea GPT request', {
    prompt: prompt.substring(0, 100), // Truncate pentru privacy
    userId,
    responseTime,
    success,
    timestamp: new Date().toISOString()
  });
};

// ✅ Logging pentru CORS errors
export const logCORSError = (origin, method, path) => {
  logger.warn('CORS blocked request', {
    origin,
    method,
    path,
    timestamp: new Date().toISOString()
  });
};

// ✅ Logging pentru OpenAI timeouts
export const logOpenAITimeout = (prompt, userId) => {
  logger.error('OpenAI request timed out', {
    prompt: prompt.substring(0, 100),
    userId,
    timestamp: new Date().toISOString()
  });
};

// ✅ Logging pentru authentication
export const logAuthFailure = (email, reason) => {
  logger.warn('Authentication failed', {
    email,
    reason,
    timestamp: new Date().toISOString()
  });
};

export default logger;
