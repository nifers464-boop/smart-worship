import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import liturgyRoutes from './routes/liturgyRoutes.js';
import songRoutes from './routes/songRoutes.js';
import multimediaRoutes from './routes/multimediaRoutes.js';
import pptRoutes from './routes/pptRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import liturgyTemplateRoutes from './routes/liturgyTemplateRoutes.js';



dotenv.config();

export const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============ API ROUTES ============
app.use('/api/liturgy', liturgyRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/multimedia', multimediaRoutes);
app.use('/api/ppt', pptRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/liturgy-templates', liturgyTemplateRoutes);



// Root URL (Dashboard Sederhana Backend)
app.get('/', async (req, res) => {
  try {
    // Mengambil statistik sederhana dari database
    const [songCount, liturgyCount, templateCount, pptCount] = await Promise.all([
      prisma.song.count(),
      prisma.liturgy.count(),
      prisma.liturgyTemplate.count(),
      prisma.pPTProject.count()
    ]);

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart Worship API Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #4F46E5;
            --bg: #F3F4F6;
            --card-bg: #FFFFFF;
            --text: #1F2937;
            --text-light: #6B7280;
          }
          body { 
            font-family: 'Inter', sans-serif; 
            background-color: var(--bg); 
            color: var(--text); 
            margin: 0; 
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
          }
          .header h1 {
            color: var(--primary);
            font-size: 2.5rem;
            margin-bottom: 10px;
          }
          .status-badge { 
            display: inline-block; 
            padding: 6px 16px; 
            background: #10B981; 
            color: white; 
            border-radius: 9999px; 
            font-weight: 600; 
            font-size: 0.875rem;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
          }
          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            width: 100%;
            max-width: 900px;
            margin-bottom: 40px;
          }
          .card {
            background: var(--card-bg);
            padding: 24px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            text-align: center;
            transition: all 0.2s;
            text-decoration: none;
            display: block;
            border: 2px solid transparent;
          }
          .card:hover {
            transform: translateY(-5px);
            border-color: var(--primary);
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
          }
          .card h3 {
            color: var(--text-light);
            font-size: 1rem;
            font-weight: 600;
            margin-top: 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .card .value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary);
            margin: 10px 0 0 0;
          }
          .endpoints {
            background: var(--card-bg);
            width: 100%;
            max-width: 900px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .endpoints-header {
            background: #F9FAFB;
            padding: 16px 24px;
            border-bottom: 1px solid #E5E7EB;
            font-weight: 600;
            color: var(--text);
          }
          .endpoint-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .endpoint-list li {
            padding: 16px 24px;
            border-bottom: 1px solid #F3F4F6;
            display: flex;
            align-items: center;
          }
          .endpoint-list li:last-child {
            border-bottom: none;
          }
          .method {
            background: var(--primary);
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-right: 16px;
            min-width: 40px;
            text-align: center;
          }
          .path {
            font-family: monospace;
            color: #374151;
            font-size: 0.95rem;
          }
        </style>
      </head>
      <body>
        
        <div class="header">
          <h1>✝️ Smart Worship API</h1>
          <p style="color: var(--text-light); font-size: 1.1rem;">Sistem Backend (Dapur Data)</p>
          <div class="status-badge">Sistem Online & Berjalan Normal</div>
          <p style="margin-top: 15px; font-size: 0.9rem; color: #6B7280;">*Klik kartu di bawah untuk melihat isi datanya</p>
        </div>

        <div class="dashboard-grid">
          <a href="/view/songs" class="card">
            <h3>Total Lagu</h3>
            <div class="value">${songCount}</div>
          </a>
          <a href="/view/liturgies" class="card">
            <h3>Jadwal Ibadah</h3>
            <div class="value">${liturgyCount}</div>
          </a>
          <a href="/view/templates" class="card">
            <h3>Template Liturgi</h3>
            <div class="value">${templateCount}</div>
          </a>
          <a href="/view/ppts" class="card">
            <h3>Proyek PPT</h3>
            <div class="value">${pptCount}</div>
          </a>
        </div>

        <div class="endpoints">
          <div class="endpoints-header">
            Daftar Jalur Akses (API Endpoints)
          </div>
          <ul class="endpoint-list">
            <li><span class="method" style="background:#10B981">GET</span> <span class="path">/health</span></li>
            <li><span class="method" style="background:#4F46E5">API</span> <span class="path">/api/songs</span></li>
            <li><span class="method" style="background:#4F46E5">API</span> <span class="path">/api/liturgy</span></li>
            <li><span class="method" style="background:#4F46E5">API</span> <span class="path">/api/liturgy-templates</span></li>
            <li><span class="method" style="background:#4F46E5">API</span> <span class="path">/api/multimedia</span></li>
            <li><span class="method" style="background:#4F46E5">API</span> <span class="path">/api/ppt</span></li>
            <li><span class="method" style="background:#4F46E5">API</span> <span class="path">/api/calendar</span></li>
          </ul>
        </div>

      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('Terjadi kesalahan saat memuat dashboard backend.');
  }
});

// Route untuk melihat isi data (Data Viewer)
app.get('/view/:model', async (req, res) => {
  const model = req.params.model;
  let data = [];
  let title = "";
  let columns = [];

  try {
    if (model === 'songs') {
      title = "Daftar Lagu";
      data = await prisma.song.findMany({ take: 100, orderBy: { number: 'asc' } });
      columns = ["number", "title", "songBook"];
    } else if (model === 'liturgies') {
      title = "Daftar Jadwal Ibadah";
      data = await prisma.liturgy.findMany({ take: 50, orderBy: { date: 'desc' } });
      columns = ["title", "theme", "date"];
    } else if (model === 'templates') {
      title = "Daftar Template Liturgi";
      data = await prisma.liturgyTemplate.findMany({ take: 50 });
      columns = ["title", "churchDay"];
    } else if (model === 'ppts') {
      title = "Daftar Proyek PPT";
      data = await prisma.pPTProject.findMany({ take: 50, orderBy: { date: 'desc' } });
      columns = ["title", "date"];
    } else {
      return res.status(404).send("Data tidak ditemukan");
    }

    // Buat HTML Table
    let tableRows = data.map(item => {
      return "<tr>" + columns.map(col => {
        let val = item[col];
        if (val instanceof Date) val = val.toLocaleDateString('id-ID');
        return `<td>${val || '-'}</td>`;
      }).join('') + "</tr>";
    }).join('');

    if (data.length === 0) tableRows = `<tr><td colspan="${columns.length}" style="text-align:center;">Belum ada data</td></tr>`;

    let tableHeaders = columns.map(col => `<th>${col.toUpperCase()}</th>`).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Data Viewer</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background: #F3F4F6; color: #1F2937; padding: 40px; }
          .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          h1 { color: #4F46E5; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #E5E7EB; }
          th { background-color: #F9FAFB; font-weight: 600; color: #4B5563; }
          tr:hover { background-color: #F3F4F6; }
          .back-btn { display: inline-block; padding: 8px 16px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 20px; }
          .back-btn:hover { background: #4338CA; }
        </style>
      </head>
      <body>
        <div class="container">
          <a href="/" class="back-btn">&larr; Kembali ke Dashboard</a>
          <h1>${title}</h1>
          <p>Menampilkan maksimal ${data.length} data terbaru.</p>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal mengambil data dari database.");
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Jalankan server (hanya jika dijalankan secara lokal, bukan oleh Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

// Wajib diexport untuk Vercel Serverless
export default app;