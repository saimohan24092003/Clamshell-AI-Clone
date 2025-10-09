import express from 'express';
import { authenticateJwt } from '../middleware/auth.js';
import { callSapEndpoint } from '../services/sapService.js';

const router = express.Router();

// Example proxy: GET /api/sap/resource?path=...
router.get('/proxy', authenticateJwt, async (req, res, next) => {
  try {
    const { path } = req.query;
    if (!path) return res.status(400).json({ error: 'BadRequest', message: 'path is required' });
    const data = await callSapEndpoint(String(path));
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
});

export default router;


