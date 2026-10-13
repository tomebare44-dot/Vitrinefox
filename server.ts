import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(__dirname, 'data', 'uploads')));

// Mount API routes
app.use('/api', apiRouter);

// Serve frontend dist assets in production
const distDir = path.resolve(__dirname, 'dist');
app.use(express.static(distDir));

app.get('*', (req, res) => {
  // If not API and not upload, serve index.html
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    res.sendFile(path.resolve(distDir, 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint não encontrado.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`VitrineFox server running on port ${PORT}`);
});
