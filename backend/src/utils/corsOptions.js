const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const configured = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ].filter(Boolean);

  if (configured.includes(origin)) return true;

  try {
    const parsed = new URL(origin);
    if (parsed.hostname.endsWith('.vercel.app')) return true;
    if (process.env.NODE_ENV !== 'production') {
      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') return true;
    }
  } catch {
    return false;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = { isOriginAllowed, corsOptions };
