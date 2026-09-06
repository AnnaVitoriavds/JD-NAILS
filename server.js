const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'jdnails';
const ADMIN_PASS = process.env.ADMIN_PASS || 'jd2026';
const sessions = new Map();

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const defaultStore = {
  settings: {
    whatsapp: '5561981735176',
    hours: {
      0: { label: 'Domingo', closed: true, open: '', close: '' },
      1: { label: 'Segunda-feira', closed: false, open: '09:00', close: '20:00' },
      2: { label: 'Terça-feira', closed: false, open: '09:00', close: '20:00' },
      3: { label: 'Quarta-feira', closed: false, open: '09:00', close: '20:00' },
      4: { label: 'Quinta-feira', closed: false, open: '09:00', close: '20:00' },
      5: { label: 'Sexta-feira', closed: false, open: '09:00', close: '20:00' },
      6: { label: 'Sábado', closed: false, open: '09:00', close: '15:00' }
    },
    holidaysClosed: true,
    blockedDates: []
  },
  media: { hero: '', about: '', portfolio: [] },
  bookings: []
};

function readStore() {
  try { return { ...defaultStore, ...JSON.parse(fs.readFileSync(STORE_FILE, 'utf8')) }; }
  catch { writeStore(defaultStore); return JSON.parse(JSON.stringify(defaultStore)); }
}
function writeStore(data) { fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2)); }
if (!fs.existsSync(STORE_FILE)) writeStore(defaultStore);

const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};
function json(res, status, payload) { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(payload)); }
function body(req) { return new Promise((resolve,reject)=>{ let b=''; req.on('data',c=>{ b+=c; if(b.length>12*1024*1024){ reject(new Error('Payload muito grande')); req.destroy(); }}); req.on('end',()=>{ try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}}); req.on('error',reject); }); }
function tokenFrom(req) { const h=req.headers.authorization||''; return h.startsWith('Bearer ')?h.slice(7):''; }
function isAuth(req) { const t=tokenFrom(req); return t && sessions.has(t); }
function safePublicStore(store) { return { settings: store.settings, media: store.media }; }
function saveDataUrl(dataUrl, area) {
  const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/i.exec(dataUrl || '');
  if (!m) throw new Error('Imagem inválida');
  const ext = m[1].toLowerCase().replace('jpeg','jpg');
  const file = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${area}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, file), Buffer.from(m[2], 'base64'));
  return `/uploads/${file}`;
}
function parseDateLocal(s) { const [y,m,d]=(s||'').split('-').map(Number); return new Date(y,m-1,d); }
function isBrazilNationalHoliday(settings, dateStr) {
  if (settings.holidaysClosed === false) return false;
  const d=parseDateLocal(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const mmdd=`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return new Set(['01-01','04-21','05-01','09-07','10-12','11-02','11-15','11-20','12-25']).has(mmdd);
}
function isBlocked(settings, dateStr) {
  if (!dateStr) return true;
  if ((settings.blockedDates||[]).includes(dateStr)) return true;
  if (isBrazilNationalHoliday(settings, dateStr)) return true;
  const d=parseDateLocal(dateStr); if (Number.isNaN(d.getTime())) return true;
  const h=settings.hours?.[d.getDay()]; return !h || !!h.closed;
}
function toMinutes(value){ const [h,m]=String(value||'00:00').split(':').map(Number); return h*60+m; }
function validSlot(time, open, close){
  const t=toMinutes(time), start=toMinutes(open), end=toMinutes(close);
  return /^\d{2}:\d{2}$/.test(String(time||'')) && t>=start && t<end && (t-start)%30===0;
}

const server = http.createServer(async (req,res)=>{
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = decodeURIComponent(url.pathname);

    if (p === '/api/public' && req.method === 'GET') return json(res,200,safePublicStore(readStore()));

    if (p === '/api/availability' && req.method === 'GET') {
      const date=url.searchParams.get('date')||'';
      const store=readStore();
      if(isBlocked(store.settings,date)) return json(res,200,{date,bookedTimes:[],closed:true});
      const bookedTimes=store.bookings
        .filter(b=>b.date===date && !['cancelado'].includes(b.status))
        .map(b=>b.time);
      return json(res,200,{date,bookedTimes:[...new Set(bookedTimes)].sort(),closed:false});
    }

    if (p === '/api/login' && req.method === 'POST') {
      const b=await body(req);
      if (b.username===ADMIN_USER && b.password===ADMIN_PASS) {
        const t=crypto.randomBytes(32).toString('hex'); sessions.set(t,{created:Date.now()});
        return json(res,200,{ok:true,token:t});
      }
      return json(res,401,{ok:false,message:'Login ou senha inválidos.'});
    }
    if (p === '/api/logout' && req.method === 'POST') { sessions.delete(tokenFrom(req)); return json(res,200,{ok:true}); }
    if (p === '/api/admin' && req.method === 'GET') { if(!isAuth(req)) return json(res,401,{message:'Não autorizado'}); return json(res,200,readStore()); }

    if (p === '/api/bookings' && req.method === 'POST') {
      const b=await body(req); const store=readStore();
      const required=['name','phone','service','date','time'];
      if(required.some(k=>!String(b[k]||'').trim())) return json(res,400,{message:'Preencha os campos obrigatórios.'});
      if(isBlocked(store.settings,b.date)) return json(res,400,{message:'Esta data está fechada, é feriado ou está bloqueada.'});
      const day=parseDateLocal(b.date).getDay(); const h=store.settings.hours[day];
      if(!validSlot(b.time,h.open,h.close)) return json(res,400,{message:'Escolha um dos horários disponíveis exibidos pelo site.'});
      const occupied=store.bookings.some(x=>x.date===b.date && x.time===b.time && !['cancelado'].includes(x.status));
      if(occupied) return json(res,409,{message:'Esse horário acabou de ser solicitado por outra cliente. Escolha outro horário livre.'});
      const booking={id:crypto.randomUUID(),createdAt:new Date().toISOString(),status:'pendente',...b};
      store.bookings.unshift(booking); writeStore(store); return json(res,201,{ok:true,booking});
    }

    if (p === '/api/settings' && req.method === 'PUT') {
      if(!isAuth(req)) return json(res,401,{message:'Não autorizado'}); const b=await body(req); const store=readStore();
      store.settings={...store.settings,...b}; writeStore(store); return json(res,200,{ok:true,settings:store.settings});
    }
    if (p === '/api/bookings/status' && req.method === 'PUT') {
      if(!isAuth(req)) return json(res,401,{message:'Não autorizado'}); const b=await body(req); const store=readStore();
      const item=store.bookings.find(x=>x.id===b.id); if(!item) return json(res,404,{message:'Agendamento não encontrado'});
      item.status=b.status||item.status; writeStore(store); return json(res,200,{ok:true});
    }
    if (p === '/api/bookings/delete' && req.method === 'POST') {
      if(!isAuth(req)) return json(res,401,{message:'Não autorizado'}); const b=await body(req); const store=readStore();
      store.bookings=store.bookings.filter(x=>x.id!==b.id); writeStore(store); return json(res,200,{ok:true});
    }
    if (p === '/api/media' && req.method === 'POST') {
      if(!isAuth(req)) return json(res,401,{message:'Não autorizado'}); const b=await body(req); const store=readStore();
      const area=['hero','about','portfolio'].includes(b.area)?b.area:'portfolio'; const src=saveDataUrl(b.dataUrl,area);
      if(area==='portfolio') store.media.portfolio.push({id:crypto.randomUUID(),src,title:b.title||'Trabalho JD Nails',category:b.category||'Portfólio'});
      else store.media[area]=src;
      writeStore(store); return json(res,201,{ok:true,media:store.media});
    }
    if (p === '/api/media/delete' && req.method === 'POST') {
      if(!isAuth(req)) return json(res,401,{message:'Não autorizado'}); const b=await body(req); const store=readStore();
      if(b.area==='portfolio') store.media.portfolio=store.media.portfolio.filter(x=>x.id!==b.id);
      else if(b.area==='hero'||b.area==='about') store.media[b.area]='';
      writeStore(store); return json(res,200,{ok:true,media:store.media});
    }

    let filePath = p==='/' ? path.join(ROOT,'index.html') : path.join(ROOT,p.replace(/^\//,''));
    const normalized=path.normalize(filePath);
    if(!normalized.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
    fs.stat(normalized,(err,stat)=>{
      if(err||!stat.isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Arquivo não encontrado');}
      const ext = path.extname(normalized).toLowerCase();
      const headers = {'Content-Type': mime[ext] || 'application/octet-stream'};
      if (['.html','.css','.js','.json'].includes(ext)) headers['Cache-Control'] = 'no-store, max-age=0';
      res.writeHead(200, headers);
      fs.createReadStream(normalized).pipe(res);
    });
  } catch(err) { console.error(err); json(res,500,{message:'Erro interno do servidor.'}); }
});
server.on('error', err => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`\nA porta ${PORT} já está em uso.`);
    console.error('Feche o servidor anterior com Ctrl+C ou, no Windows, execute: taskkill /F /IM node.exe');
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

server.listen(PORT,()=>{
  console.log('\n========================================');
  console.log('JD Nails iniciado com sucesso 💗');
  console.log(`Site:  http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin.html`);
  console.log('Login: jdnails | Senha: jd2026');
  console.log('Para encerrar: Ctrl+C');
  console.log('========================================\n');
});
