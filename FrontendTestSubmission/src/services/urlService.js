const mockDb = {};

export const shortenUrl = async (url, customCode, validity = 30) => {
  const shortCode = customCode || Math.random().toString(36).substring(2, 8);
  const exists = mockDb[shortCode];
  if (exists && customCode) {
    return { error: "Shortcode already taken" };
  }
  mockDb[shortCode] = { url, createdAt: Date.now(), validity };
  return { shortCode, validity };
};

export const getOriginalUrl = async (shortCode) => {
  const entry = mockDb[shortCode];
  if (!entry) return null;
  const expired = (Date.now() - entry.createdAt) / 1000 / 60 > entry.validity;
  return expired ? null : entry.url;
};
