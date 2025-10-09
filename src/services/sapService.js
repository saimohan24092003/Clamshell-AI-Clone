import axios from 'axios';
import { env } from '../config/env.js';

export async function callSapEndpoint(path, method = 'GET', data = undefined, params = undefined) {
  if (!env.sapBaseUrl || !env.sapApiKey) {
    const err = new Error('SAP configuration missing');
    err.status = 500; err.isOperational = true; throw err;
  }
  const url = `${env.sapBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const res = await axios.request({
    url,
    method,
    data,
    params,
    headers: { 'Authorization': `Bearer ${env.sapApiKey}`, 'Content-Type': 'application/json' },
    timeout: 15000,
  });
  return res.data;
}

export default { callSapEndpoint };


