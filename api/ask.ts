import type { VercelRequest, VercelResponse } from '@vercel/node';
import http from 'http';
import https from 'https';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const data = JSON.stringify(req.body);

      return new Promise((resolve) => {
        // Try HTTP first, then HTTPS
        const protocol = http;

        const options = {
          hostname: '146.190.243.196',
          port: 8000,
          path: '/ask',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
          },
          timeout: 30000,
        };

        const proxy_req = protocol.request(options, (proxy_res) => {
          let response_data = '';

          proxy_res.on('data', (chunk) => {
            response_data += chunk;
          });

          proxy_res.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.status(proxy_res.statusCode || 200).send(response_data);
            resolve(null);
          });
        });

        proxy_req.on('error', (error) => {
          console.error('Proxy Error:', error);
          res.status(502).json({ error: 'Bad Gateway', details: error.message });
          resolve(null);
        });

        proxy_req.on('timeout', () => {
          proxy_req.destroy();
          res.status(504).json({ error: 'Gateway Timeout' });
          resolve(null);
        });

        proxy_req.write(data);
        proxy_req.end();
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

