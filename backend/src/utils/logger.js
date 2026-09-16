const levels = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG',
};

function log(level, message, meta) {
  const payload = {
    level: levels[level],
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };
  const output = JSON.stringify(payload);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') log('debug', message, meta);
  },
};
