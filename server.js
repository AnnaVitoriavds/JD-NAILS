const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Arquivo não encontrado');
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.normalize(path.join(ROOT, relative));

    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Acesso negado');
    }

    fs.stat(filePath, (error, stat) => {
      if (error || !stat.isFile()) return send404(res);

      const ext = path.extname(filePath).toLowerCase();
      const headers = {
        'Content-Type': mime[ext] || 'application/octet-stream'
      };

      if (['.html', '.css', '.js', '.json'].includes(ext)) {
        headers['Cache-Control'] = 'no-store, max-age=0';
      }

      res.writeHead(200, headers);
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Erro interno do servidor');
  }
});

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(`\nA porta ${PORT} já está em uso.`);
    console.error('No Windows, feche o servidor anterior com Ctrl+C ou use: taskkill /F /IM node.exe');
    process.exit(1);
  }
  throw error;
});

server.listen(PORT, () => {
  console.log('\n========================================');
  console.log('JD Nails iniciado com sucesso 💗');
  console.log(`Site:  http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin.html`);
  console.log('Agenda, login e fotos: Supabase');
  console.log('Para encerrar: Ctrl+C');
  console.log('========================================\n');
});
