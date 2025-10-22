/**
 * Centralized CORS Configuration for Vercel Serverless Functions
 *
 * This utility provides consistent CORS handling across all API endpoints
 * with special handling for Vercel deployments and preflight OPTIONS requests.
 */

/**
 * Check if an origin is allowed
 * @param {string} origin - The request origin
 * @returns {boolean} - Whether the origin is allowed
 */
export function isOriginAllowed(origin) {
  console.log('[CORS] Checking origin:', origin);

  // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
  if (!origin) {
    console.log('[CORS] No origin - allowing');
    return true;
  }

  // Allow all Vercel deployments (*.vercel.app)
  if (origin.includes('vercel.app')) {
    console.log('[CORS] Vercel deployment - allowing');
    return true;
  }

  // Allow localhost for development
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    console.log('[CORS] Localhost - allowing');
    return true;
  }

  // Check environment variable for additional allowed origins
  if (process.env.FRONTEND_ORIGIN) {
    const allowedOrigins = process.env.FRONTEND_ORIGIN.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin)) {
      console.log('[CORS] Environment variable match - allowing');
      return true;
    }
  }

  console.log('[CORS] Origin not in allowlist - DENYING');
  return false;
}

/**
 * Set CORS headers on a response object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {boolean} - Whether the origin was allowed
 */
export function setCorsHeaders(req, res) {
  const origin = req.headers.origin || req.headers.Origin;

  console.log('[CORS] Request origin:', origin);
  console.log('[CORS] All headers:', JSON.stringify(req.headers));

  if (isOriginAllowed(origin)) {
    console.log('[CORS] Origin allowed, setting headers');
    // Set the origin explicitly (required for credentials)
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return true;
  }

  console.log('[CORS] Origin NOT allowed');
  return false;
}

/**
 * Handle preflight OPTIONS requests
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {boolean} - Whether this was a preflight request
 */
export function handlePreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}

/**
 * Wrapper for API handlers with automatic CORS handling
 * @param {Function} handler - The API handler function
 * @returns {Function} - Wrapped handler with CORS
 */
export function withCors(handler) {
  return async (req, res) => {
    // Set CORS headers
    setCorsHeaders(req, res);

    // Handle preflight
    if (handlePreflight(req, res)) {
      return;
    }

    // Call the actual handler
    return handler(req, res);
  };
}

/**
 * Express middleware for CORS (for use with app.use())
 */
export function corsMiddleware(req, res, next) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}
