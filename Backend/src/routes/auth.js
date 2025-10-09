import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // for password comparison
import { env } from '../config/env.js';
import User from '../models/User.js'; // make sure you have a User model

const router = express.Router();

// Helper: Generate JWT token
function generateJWT(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, provider: user.provider || 'local' },
    env.jwtSecret,
    { expiresIn: '7d' }
  );
}

// ---------------------
// ✅ Local Login (new)
// ---------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateJWT(user);
    res.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------
// ✅ Google OAuth
// ---------------------
router.get('/google', (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${env.frontendUrl}/login?error=google_auth_failed` }),
  (req, res) => {
    try {
      const token = generateJWT(req.user);
      res.redirect(`${env.frontendUrl}/auth/callback?token=${token}&provider=google`);
    } catch (error) {
      res.redirect(`${env.frontendUrl}/login?error=token_generation_failed`);
    }
  }
);

// ---------------------
// ✅ Microsoft OAuth
// ---------------------
router.get('/microsoft', (req, res, next) => {
  passport.authenticate('microsoft', {
    prompt: 'select_account'
  })(req, res, next);
});

router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: `${env.frontendUrl}/login?error=microsoft_auth_failed` }),
  (req, res) => {
    try {
      const token = generateJWT(req.user);
      res.redirect(`${env.frontendUrl}/auth/callback?token=${token}&provider=microsoft`);
    } catch (error) {
      res.redirect(`${env.frontendUrl}/login?error=token_generation_failed`);
    }
  }
);

// ---------------------
// ✅ Verify JWT
// ---------------------
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ error: 'Invalid token', valid: false });
  }
});

// ---------------------
// ✅ Logout
// ---------------------
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// ---------------------
// ✅ Current User
// ---------------------
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});

router.get('/ping', (req, res) => {
  res.json({ pong: true });
});


export default router;
