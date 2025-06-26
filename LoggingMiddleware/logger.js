export const logger = (message, metadata = {}) => {
  const log = {
    timestamp: new Date().toISOString(),
    message,
    metadata,
  };
  localStorage.setItem(`log-${Date.now()}`, JSON.stringify(log));
};
