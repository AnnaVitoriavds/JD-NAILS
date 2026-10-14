/* =========================================================
STUDIO JD NAILS
SCRIPT PRINCIPAL
========================================================= */
const $ = (selector, scope = document) =>
scope.querySelector(selector);
const $$ = (selector, scope = document) =>
[...scope.querySelectorAll(selector)];
/* =========================================================
HEADER / MENU / SCROLL
========================================================= */
const header = $('.site-header');
const navToggle = $('#navToggle');
const mainNav = $('#mainNav');
const progress = $('#pageProgress');
function handleScroll() {
const y = window.scrollY;
header?.classList.toggle(
'scrolled',
y > 30
);
const max =
document.documentElement.scrollHeight -
window.innerHeight;
const percent =
max > 0
? (y / max) * 100
: 0;
if (progress) {
progress.style.width =
`${Math.min(100, percent)}%`;
}
}
window.addEventListener(
'scroll',
handleScroll,
{ passive: true }
);
handleScroll();
/* =========================================================
MENU MOBILE
========================================================= */
navToggle?.addEventListener(
'click',
() => {
const open =
mainNav?.classList.toggle('open');
navToggle.setAttribute(
'aria-expanded',
String(open)
);
}
);
$$('.main-nav a').forEach(link => {
link.addEventListener(
'click',
() => {
mainNav?.classList.remove('open');
navToggle?.setAttribute(
'aria-expanded',
'false'
);
}
);
});
/* =========================================================
ANIMAÇÃO REVEAL
========================================================= */
if ('IntersectionObserver' in window) {
const revealObserver =
new IntersectionObserver(
entries => {
entries.forEach(entry => {
if (
entry.isIntersecting
) {
entry.target
.classList
.add('visible');
revealObserver
.unobserve(
entry.target
);
}
});
},
{
threshold: 0.12,
rootMargin:
'0px 0px -30px 0px'
}
);
$$('.reveal').forEach(el => {
revealObserver.observe(el);
});
} else {
$$('.reveal').forEach(el => {
el.classList.add('visible');
});
}
/* =========================================================
MENU ATIVO POR SEÇÃO
========================================================= */
const sections =
$$('main section[id]');
const navLinks =
$$('.main-nav a[href^="#"]');
if ('IntersectionObserver' in window) {
const sectionObserver =
new IntersectionObserver(
entries => {
entries.forEach(entry => {
if (
!entry.isIntersecting
) {
return;
}
const id =
entry.target.id;
navLinks.forEach(link => {
link.classList.toggle(
'active',
link.getAttribute(
'href'
) === `#${id}`
);
});
});
},
{
rootMargin:
'-35% 0px -55% 0px',
threshold: 0
}
);
sections.forEach(section => {
sectionObserver.observe(
section
);
});
}
/* =========================================================
CONTADORES
========================================================= */
function animateCounter(el) {
const target =
Number(
el.dataset.counter || 0
);
const decimals =
Number(
el.dataset.decimals || 0
);
const duration = 1200;
const start =
performance.now();
function frame(now) {
const progress =
Math.min(
1,
(now - start) /
duration
);
const eased =
1 -
Math.pow(
1 - progress,
3
);
const value =
target * eased;
el.textContent =
value.toLocaleString(
'pt-BR',
{
minimumFractionDigits:
decimals,
maximumFractionDigits:
decimals
}
);
if (
progress < 1
) {
requestAnimationFrame(
frame
);
}
}
requestAnimationFrame(
frame
);
}
if ('IntersectionObserver' in window) {
const counterObserver =
new IntersectionObserver(
entries => {
entries.forEach(entry => {
if (
entry.isIntersecting
) {
animateCounter(
entry.target
);
counterObserver
.unobserve(
entry.target
);
}
});
},
{
threshold: 0.55
}
);
$$('[data-counter]')
.forEach(el => {
counterObserver.observe(el);
});
}
/* =========================================================
FILTRO DOS SERVIÇOS
========================================================= */
const filterButtons =
$$('.filter-btn');
const serviceCards =
$$('.service-card');
filterButtons.forEach(button => {
button.addEventListener(
'click',
() => {
const filter =
button.dataset.filter;
filterButtons
.forEach(btn => {
btn.classList
.remove('active');
});
button.classList
.add('active');
serviceCards
.forEach(card => {
const matches =
filter === 'all' ||
card.dataset.category ===
filter;
card.classList.toggle(
'is-hidden',
!matches
);
});
}
);
});
/* =========================================================
BOTÕES "AGENDAR ESTE SERVIÇO"
========================================================= */
const serviceSelect =
$('#service');
$$('.service-book')
.forEach(button => {
button.addEventListener(
'click',
() => {
if (
serviceSelect
) {
serviceSelect.value =
button.dataset.service ||
'';
}
$('#agendamento')
?.scrollIntoView({
behavior: 'smooth',
block: 'start'
});
setTimeout(
() => {
serviceSelect?.focus();
},
500
);
}
);
});
/* =========================================================
FAQ
========================================================= */
$$('.faq-item button')
.forEach(button => {
button.addEventListener(
'click',
() => {
const item =
button.closest(
'.faq-item'
);
if (!item) {
return;
}
const isOpen =
item.classList
.contains('open');
$$('.faq-item')
.forEach(other => {
other.classList
.remove('open');
const otherButton =
$('button', other);
if (
otherButton
) {
otherButton
.setAttribute(
'aria-expanded',
'false'
);
const icon =
$('b', otherButton);
if (icon) {
icon.textContent =
'+';
}
}
});
if (!isOpen) {
item.classList
.add('open');
button.setAttribute(
'aria-expanded',
'true'
);
const icon =
$('b', button);
if (icon) {
icon.textContent =
'−';
}
}
}
);
});
/* =========================================================
ELEMENTOS DO AGENDAMENTO
========================================================= */
const dateInput =
$('#date');
const timeInput =
$('#time');
const dateOptions =
$('#dateOptions');
const timeOptions =
$('#timeOptions');
const bookingForm =
$('#bookingForm');
const phoneInput =
$('#phone');
let publicConfig = null;
const AVAILABLE_DAYS_WINDOW = 45;
const bookedDateCache = new Map();

/* =========================================================
SUPABASE
========================================================= */
const SUPABASE_URL =
'https://uyquqxkydlgjzijtfobn.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
'sb_publishable_uwFqiXKLtNh9J4nkRsjF6A_3cj-ZMPU';
const db =
window.supabase?.createClient(
SUPABASE_URL,
SUPABASE_PUBLISHABLE_KEY
);
function serviceDuration(service) {
const durations = {
'Alongamento Molde F1': 120,
'Banho de Gel': 90,
'Blindagem': 90,
'Pézinho de Luxo': 60,
'Reconstrução': 30
};
return durations[service] || 60;
}
async function trackEvent(
tipo,
elemento = '',
servico = ''
) {
if (!db) return;
try {
await db
.from('eventos')
.insert({
tipo,
pagina: window.location.pathname,
elemento,
servico
});
} catch (error) {
console.warn('Evento não registrado:', error);
}
}
/* =========================================================
CONFIGURAÇÃO PADRÃO
========================================================= */
function localFallbackConfig() {
return {
settings: {
whatsapp:
'5561981735176',
hours: {
0: {
label:
'Domingo',
closed: true,
open: '',
close: ''
},
1: {
label:
'Segunda-feira',
closed: false,
open:
'09:00',
close:
'20:00'
},
2: {
label:
'Terça-feira',
closed: false,
open:
'09:00',
close:
'20:00'
},
3: {
label:
'Quarta-feira',
closed: false,
open:
'09:00',
close:
'20:00'
},
4: {
label:
'Quinta-feira',
closed: false,
open:
'09:00',
close:
'20:00'
},
5: {
label:
'Sexta-feira',
closed: false,
open:
'09:00',
close:
'20:00'
},
6: {
label:
'Sábado',
closed: false,
open:
'09:00',
close:
'15:00'
}
},
holidaysClosed:
true,
blockedDates: []
},
media: {
hero: '',
about: '',
portfolio: []
}
};
}
/* =========================================================
CARREGAR CONFIGURAÇÃO
========================================================= */
async function loadPublicConfig() {
const fallback =
localFallbackConfig();
publicConfig =
fallback;
if (!db) {
console.warn(
'Supabase não foi carregado. Usando configuração padrão.'
);
renderHours();
renderMedia();
await populateAvailableDates();
return;
}
try {
const [
hoursResult,
blockedResult
] =
await Promise.all([
db
.from('horarios_funcionamento')
.select(
'dia_semana,nome_dia,aberto,hora_abertura,hora_fechamento'
)
.order(
'dia_semana',
{ ascending: true }
),
db
.from('datas_bloqueadas')
.select('data')
]);
if (hoursResult.error) {
throw hoursResult.error;
}
if (blockedResult.error) {
throw blockedResult.error;
}
const hours = {
...fallback.settings.hours
};
(hoursResult.data || [])
.forEach(row => {
const day =
Number(row.dia_semana);
hours[day] = {
label:
row.nome_dia ||
fallback.settings.hours[day]?.label ||
`Dia ${day}`,
closed:
!row.aberto,
open:
row.hora_abertura
? String(row.hora_abertura).slice(0, 5)
: '',
close:
row.hora_fechamento
? String(row.hora_fechamento).slice(0, 5)
: ''
};
});
publicConfig = {
...fallback,
settings: {
...fallback.settings,
hours,
blockedDates:
(blockedResult.data || [])
.map(row => row.data)
.filter(Boolean)
}
};
} catch (error) {
console.warn(
'Não foi possível carregar horários do Supabase. Usando configuração padrão.',
error
);
publicConfig =
fallback;
}
renderHours();
await loadPublicMedia();
renderMedia();
await populateAvailableDates();
}
/* =========================================================
HORÁRIOS EXIBIDOS NO SITE
========================================================= */
function renderHours() {
const fallback =
localFallbackConfig();
const hours =
publicConfig
?.settings
?.hours ||
fallback.settings.hours;
const box =
$('#bookingHours');
/*
ORDEM CORRETA:
SEGUNDA
TERÇA
QUARTA
QUINTA
SEXTA
SÁBADO
DOMINGO
*/
const order =
[1, 2, 3, 4, 5, 6, 0];
if (box) {
box.innerHTML =
order
.filter(
day => hours[day]
)
.map(day => {
const h =
hours[day];
return `
<div class="hours-row">
<b>
${h.label}
</b>
<span>
${
h.closed
? 'Fechado'
: `${h.open} às ${h.close}`
}
</span>
</div>
`;
})
.join('');
}
const locationHours =
$('#locationHours');
if (
locationHours
) {
locationHours.textContent =
'Seg. a sex. 09h–20h • Sáb. 09h–15h • Dom. e feriados fechado';
}
}
/* =========================================================
FOTOS / MÍDIA
========================================================= */
async function loadPublicMedia() {
if (!db) return;
const media = { hero: '', about: '', portfolio: [] };
const areas = ['hero', 'about', 'portfolio'];
try {
for (const area of areas) {
const { data, error } = await db.storage
.from('site-images')
.list(area, {
limit: 100,
sortBy: { column: 'created_at', order: 'desc' }
});
if (error) {
console.warn(`Não foi possível listar imagens de ${area}.`, error);
continue;
}
const items = (data || [])
.filter(item => item?.name && !item.name.startsWith('.'))
.map(item => {
const path = `${area}/${item.name}`;
const { data: publicData } = db.storage
.from('site-images')
.getPublicUrl(path);
const cleanName = String(item.name)
.replace(/^\d+-/, '')
.replace(/\.[^.]+$/, '')
.replace(/[-_]+/g, ' ')
.trim();
return {
src: publicData?.publicUrl || '',
title: cleanName || 'Trabalho JD Nails',
category: 'Portfólio'
};
})
.filter(item => item.src);
if (area === 'portfolio') media.portfolio = items;
else if (items[0]) media[area] = items[0].src;
}
publicConfig = {
...(publicConfig || localFallbackConfig()),
media
};
} catch (error) {
console.warn('Não foi possível carregar as fotos enviadas pelo painel.', error);
}
}

function renderMedia() {
const media =
publicConfig?.media || {};
if (
media.hero &&
$('#heroImage')
) {
$('#heroImage').src =
media.hero;
}
if (
media.about &&
$('#aboutImage')
) {
$('#aboutImage').src =
media.about;
}
/*
Não substitui o portfólio
do HTML se não houver fotos
configuradas pelo painel.
*/
const grid =
$('#portfolioGrid');
if (
grid &&
Array.isArray(
media.portfolio
) &&
media.portfolio.length
) {
grid.innerHTML =
media.portfolio
.map(
item => `
<article
class="portfolio-item dynamic-photo reveal visible"
>
<img
src="${escapeHtml(item.src)}"
alt="${escapeHtml(
item.title ||
'Trabalho JD Nails'
)}"
>
<div
class="portfolio-caption"
>
<strong>
${escapeHtml(
item.title ||
'Trabalho JD Nails'
)}
</strong>
<span>
${escapeHtml(
item.category ||
'Portfólio'
)}
</span>
</div>
</article>
`
)
.join('');
}
}
function escapeHtml(
value = ''
) {
return String(value)
.replace(
/[&<>'"]/g,
char => ({
'&': '&amp;',
'<': '&lt;',
'>': '&gt;',
"'": '&#39;',
'"': '&quot;'
}[char])
);
}
/* =========================================================
FUNÇÕES INTERNAS DE DATA
A DATA EXISTE INTERNAMENTE
APENAS PARA CONTROLAR OS HORÁRIOS.
O CLIENTE NÃO VÊ A DATA.
========================================================= */
function parseDateLocal(
value
) {
const [
year,
month,
day
] =
String(
value || ''
)
.split('-')
.map(Number);
return new Date(
year,
month - 1,
day
);
}
function dateKey(date) {
const year =
date.getFullYear();
const month =
String(
date.getMonth() + 1
).padStart(
2,
'0'
);
const day =
String(
date.getDate()
).padStart(
2,
'0'
);
return (
`${year}-${month}-${day}`
);
}
function selectedDay() {
if (
!dateInput?.value
) {
return null;
}
return parseDateLocal(
dateInput.value
).getDay();
}
/* =========================================================
FERIADOS NACIONAIS
========================================================= */
function isBrazilNationalHoliday(
value
) {
if (
publicConfig
?.settings
?.holidaysClosed ===
false
) {
return false;
}
const date =
parseDateLocal(
value
);
const month =
String(
date.getMonth() + 1
).padStart(
2,
'0'
);
const day =
String(
date.getDate()
).padStart(
2,
'0'
);
const mmdd =
`${month}-${day}`;
const holidays =
new Set([
'01-01',
'04-21',
'05-01',
'09-07',
'10-12',
'11-02',
'11-15',
'11-20',
'12-25'
]);
return holidays.has(
mmdd
);
}
/* =========================================================
VERIFICAR SE O DIA ESTÁ DISPONÍVEL
========================================================= */
function isSelectableDate(
value
) {
if (!value) {
return false;
}
const fallback =
localFallbackConfig();
const settings =
publicConfig?.settings ||
fallback.settings;
const blockedDates =
settings.blockedDates ||
[];
if (
blockedDates.includes(
value
)
) {
return false;
}
if (
isBrazilNationalHoliday(
value
)
) {
return false;
}
const day =
parseDateLocal(
value
).getDay();
const hours =
settings.hours ||
fallback.settings.hours;
const schedule =
hours[day];
if (
!schedule
) {
return false;
}
if (
schedule.closed
) {
return false;
}
if (
!schedule.open ||
!schedule.close
) {
return false;
}
return true;
}
/* =========================================================
VERIFICAR SE A DATA AINDA TEM ALGUM HORÁRIO FUTURO
========================================================= */
function hasFutureSlot(value) {
if (!value) return false;
const fallback = localFallbackConfig();
const settings = publicConfig?.settings || fallback.settings;
const day = parseDateLocal(value).getDay();
const schedule = (settings.hours || fallback.settings.hours)[day];
if (!schedule || schedule.closed || !schedule.open || !schedule.close) return false;
const todayKey = dateKey(new Date());
if (value !== todayKey) return true;
return generateTimeSlots(schedule.open, schedule.close)
.some(slot => !isPastSlot(value, slot));
}

/* =========================================================
MOSTRAR SOMENTE O DIA DA SEMANA
========================================================= */
function prettyDate(
value
) {
const date =
parseDateLocal(
value
);
const text =
new Intl.DateTimeFormat(
'pt-BR',
{
weekday:
'long'
}
).format(
date
);
return (
text.charAt(0)
.toUpperCase() +
text.slice(1)
);
}
/* =========================================================
FORMATAÇÃO DAS DATAS DISPONÍVEIS
========================================================= */
function formatDateOption(value) {
const date = parseDateLocal(value);
const weekday = new Intl.DateTimeFormat('pt-BR', {
weekday: 'short'
}).format(date).replace('.', '');
const dayMonth = new Intl.DateTimeFormat('pt-BR', {
day: '2-digit',
month: '2-digit',
year: 'numeric'
}).format(date);
const prettyWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
return `${prettyWeekday}, ${dayMonth}`;
}

/* =========================================================
descobrir datas ocupadas
Tenta primeiro a RPC datas_ocupadas (mais rápida).
Se ela ainda não existir no Supabase, usa a RPC antiga
horarios_ocupados, uma data por vez.
========================================================= */
async function getBookedDatesForRange(dateValues = []) {
const result = new Set();
if (!db || !dateValues.length) {
return result;
}
const sorted = [...dateValues].sort();
try {
const { data, error } = await db.rpc('datas_ocupadas', {
p_inicio: sorted[0],
p_fim: sorted[sorted.length - 1]
});
if (!error && Array.isArray(data)) {
data.forEach(row => {
const value = row?.data || row?.p_data || row;
if (value) result.add(String(value).slice(0, 10));
});
return result;
}
} catch (error) {
console.warn('RPC datas_ocupadas indisponível. Usando verificação por dia.', error);
}

const checks = await Promise.all(
dateValues.map(async value => {
const times = await getBookedTimes(value);
return { value, occupied: times === null ? null : times.length > 0 };
})
);
checks.forEach(item => {
if (item.occupied === true) result.add(item.value);
/* Se não foi possível verificar a data, ela não é exibida.
   Isso evita oferecer um horário que pode já estar reservado. */
if (item.occupied === null) result.add(item.value);
});
return result;
}

/* =========================================================
PREENCHER SOMENTE DATAS REALMENTE DISPONÍVEIS
- próximos 45 dias
- exclui folgas, feriados e dias fechados
- exclui qualquer data que já tenha agendamento ativo
========================================================= */
async function populateAvailableDates() {
if (!dateInput || !dateOptions) return;

const previousValue = dateInput.value;
dateInput.value = '';
dateOptions.innerHTML = `
<div class="picker-loading">
<span class="mini-spinner" aria-hidden="true"></span>
Consultando a agenda…
</div>
`;
resetTimeOptions('Escolha uma data livre primeiro.');

const today = new Date();
today.setHours(0, 0, 0, 0);
const candidates = [];
for (let offset = 0; offset < AVAILABLE_DAYS_WINDOW; offset++) {
const date = new Date(today);
date.setDate(today.getDate() + offset);
const value = dateKey(date);
/*
Mostramos somente dias reais de atendimento.
Folgas manuais, feriados e dias fechados continuam escondidos.
Datas que já têm agendamento aparecem, mas bloqueadas.
*/
if (isSelectableDate(value) && hasFutureSlot(value)) candidates.push(value);
}

const occupiedDates = await getBookedDatesForRange(candidates);
occupiedDates.forEach(value => bookedDateCache.set(value, true));
candidates.forEach(value => {
if (!occupiedDates.has(value)) bookedDateCache.set(value, false);
});

if (!candidates.length) {
dateOptions.innerHTML = `
<div class="picker-placeholder">Nenhuma data de atendimento disponível no momento.</div>
`;
const help = $('#dateHelp');
if (help) help.textContent = 'No momento não há datas disponíveis. Fale com o Studio pelo WhatsApp.';
return;
}

const monthFmt = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const weekdayFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

dateOptions.innerHTML = candidates.map(value => {
const date = parseDateLocal(value);
const occupied = occupiedDates.has(value);
const weekday = weekdayFmt.format(date).replace('.', '');
const month = monthFmt.format(date).replace('.', '');
const aria = occupied
? `${formatDateOption(value)}, já agendado`
: `${formatDateOption(value)}, disponível`;
return `
<button
class="date-choice ${occupied ? 'is-booked' : 'is-free'}"
type="button"
data-date="${value}"
role="option"
aria-label="${aria}"
aria-selected="false"
${occupied ? 'disabled aria-disabled="true"' : ''}
>
<span class="date-choice-weekday">${weekday}</span>
<strong class="date-choice-day">${String(date.getDate()).padStart(2, '0')}</strong>
<span class="date-choice-month">${month}</span>
<span class="date-choice-status">${occupied ? '🔒 Agendado' : 'Livre'}</span>
</button>
`;
}).join('');

const freeDates = candidates.filter(value => !occupiedDates.has(value));
const help = $('#dateHelp');
if (help) {
help.textContent = freeDates.length
? `${freeDates.length} datas livres nos próximos ${AVAILABLE_DAYS_WINDOW} dias. As datas com cadeado já possuem agendamento.`
: 'Todas as próximas datas de atendimento estão ocupadas. Fale com o Studio pelo WhatsApp.';
}

if (previousValue && freeDates.includes(previousValue)) {
selectDateChoice(previousValue);
await refreshTimeOptions();
}
}

function selectDateChoice(value) {
if (!dateInput || !dateOptions) return;
const button = dateOptions.querySelector(`[data-date="${value}"]`);
if (!button || button.disabled) return;
dateInput.value = value;
dateOptions.querySelectorAll('.date-choice').forEach(item => {
const selected = item.dataset.date === value;
item.classList.toggle('is-selected', selected);
item.setAttribute('aria-selected', selected ? 'true' : 'false');
});
timeInput.value = '';
}

dateOptions?.addEventListener('click', async event => {
const button = event.target.closest('.date-choice');
if (!button || button.disabled) return;
selectDateChoice(button.dataset.date);
await refreshTimeOptions();
});

/* =========================================================
RESETAR HORÁRIOS
========================================================= */
function resetTimeOptions(
message =
'Escolha primeiro o dia'
) {
if (timeInput) timeInput.value = '';
if (!timeOptions) return;
timeOptions.innerHTML = `
<div class="picker-placeholder">${escapeHtml(message)}</div>
`;
}
/* =========================================================
CONVERTER HORÁRIO
========================================================= */
function toMinutes(
value
) {
const [
hour,
minute
] =
String(
value || '00:00'
)
.split(':')
.map(Number);
return (
hour * 60 +
minute
);
}
function fromMinutes(
total
) {
const hour =
String(
Math.floor(
total / 60
)
).padStart(
2,
'0'
);
const minute =
String(
total % 60
).padStart(
2,
'0'
);
return (
`${hour}:${minute}`
);
}
/* =========================================================
GERAR HORÁRIOS DE 30 EM 30 MINUTOS
========================================================= */
function generateTimeSlots(
open,
close
) {
const slots = [];
const start =
toMinutes(
open
);
const end =
toMinutes(
close
);
for (
let minutes = start;
minutes < end;
minutes += 30
) {
slots.push(
fromMinutes(
minutes
)
);
}
return slots;
}
/* =========================================================
IMPEDIR HORÁRIOS QUE JÁ PASSARAM
========================================================= */
function isPastSlot(
dateValue,
timeValue
) {
const date =
parseDateLocal(
dateValue
);
const [
hour,
minute
] =
timeValue
.split(':')
.map(Number);
date.setHours(
hour,
minute,
0,
0
);
return (
date.getTime() <=
Date.now()
);
}
/* =========================================================
BUSCAR HORÁRIOS JÁ RESERVADOS
SE NÃO HOUVER API,
USA O LOCALSTORAGE.
========================================================= */
async function getBookedTimes(
date
) {
if (!db || !date) {
return [];
}
try {
const {
data,
error
} =
await db.rpc(
'horarios_ocupados',
{
p_data: date
}
);
if (error) {
throw error;
}
return (data || [])
.map(row =>
String(row.horario)
.slice(0, 5)
);
} catch (error) {
console.warn(
'Não foi possível consultar horários ocupados.',
error
);
return null;
}
}
/* =========================================================
CARREGAR HORÁRIOS DISPONÍVEIS
========================================================= */
async function refreshTimeOptions() {
const help = $('#dateHelp');
if (!dateInput?.value) {
resetTimeOptions('Escolha uma data livre primeiro.');
if (help) help.textContent = 'Escolha uma das datas marcadas como Livre.';
return;
}
if (!isSelectableDate(dateInput.value)) {
resetTimeOptions('Este dia está indisponível.');
if (help) help.textContent = 'Este dia está indisponível. Escolha outra data.';
return;
}
const fallback = localFallbackConfig();
const hours = publicConfig?.settings?.hours || fallback.settings.hours;
const day = selectedDay();
const schedule = hours[day] || fallback.settings.hours[day];
if (!schedule || schedule.closed) {
resetTimeOptions('Este dia está fechado.');
return;
}
resetTimeOptions('Carregando horários…');
const booked = await getBookedTimes(dateInput.value);
if (booked === null) {
resetTimeOptions('Não foi possível verificar a agenda.');
if (help) help.textContent = 'Não foi possível confirmar a disponibilidade agora. Atualize a página ou tente novamente.';
return;
}
/*
REGRA PEDIDA: qualquer agendamento ativo bloqueia a DATA INTEIRA.
Mesmo que existam outros horários no expediente, a data não pode mais ser escolhida.
*/
if (booked.length > 0) {
bookedDateCache.set(dateInput.value, true);
resetTimeOptions('Esta data acabou de ser reservada.');
if (help) help.textContent = 'Esta data acabou de ser reservada por outra cliente. Escolha outra data livre.';
await populateAvailableDates();
return;
}
bookedDateCache.set(dateInput.value, false);
const allSlots = generateTimeSlots(schedule.open, schedule.close);
const freeSlots = allSlots.filter(slot => !isPastSlot(dateInput.value, slot));
if (!freeSlots.length) {
resetTimeOptions('Sem horários livres para este dia.');
if (help) help.textContent = 'Este dia não possui mais horários futuros. Escolha outra data.';
return;
}
if (!timeOptions) return;
timeOptions.innerHTML = freeSlots.map(slot => `
<button
class="time-choice"
type="button"
data-time="${slot}"
role="option"
aria-selected="false"
>
<span class="time-choice-icon" aria-hidden="true">◷</span>
${slot}
</button>
`).join('');
if (help) help.textContent = `Data livre. Escolha um horário entre ${schedule.open} e ${schedule.close}.`;
}

timeOptions?.addEventListener('click', event => {
const button = event.target.closest('.time-choice');
if (!button) return;
timeInput.value = button.dataset.time || '';
timeOptions.querySelectorAll('.time-choice').forEach(item => {
const selected = item === button;
item.classList.toggle('is-selected', selected);
item.setAttribute('aria-selected', selected ? 'true' : 'false');
});
});
/* =========================================================
SALVAR AGENDAMENTO
IMPORTANTE:
SE /api/bookings NÃO EXISTIR,
NÃO BLOQUEIA O WHATSAPP.
SALVA LOCALMENTE E CONTINUA.
========================================================= */
async function saveBooking(
payload
) {
if (!db) {
return {
ok: false,
message:
'Não foi possível conectar ao sistema de agendamento. Tente novamente.'
};
}
try {
/*
SALVA A CLIENTE.
Não precisamos expor o ID para o navegador.
*/
const clientResult =
await db
.from('clientes')
.insert({
nome:
payload.name,
telefone:
payload.phone,
observacoes:
payload.notes === 'Sem observações.'
? null
: payload.notes
});
if (clientResult.error) {
throw clientResult.error;
}
/*
SALVA O AGENDAMENTO.
O cliente_id pode ficar nulo porque nome e telefone
também ficam registrados no próprio agendamento.
*/
const bookingResult =
await db
.from('agendamentos')
.insert({
cliente_id:
null,
servico_id:
null,
nome_cliente:
payload.name,
telefone:
payload.phone,
servico_nome:
payload.service,
data:
payload.date,
horario:
payload.time,
duracao_minutos:
serviceDuration(
payload.service
),
status:
'pendente',
primeira_visita:
String(
payload.firstVisit
)
.trim()
.toLowerCase()
.startsWith('s'),
observacoes:
payload.notes === 'Sem observações.'
? null
: payload.notes
});
if (bookingResult.error) {
/*
23505 = horário já reservado.
*/
if (
bookingResult.error.code ===
'23505'
) {
return {
ok: false,
conflict: true,
message:
'Essa data acabou de ser reservada por outra cliente. Escolha outra data.'
};
}
throw bookingResult.error;
}
await trackEvent(
'agendamento',
'bookingForm',
payload.service
);
return {
ok: true
};
} catch (error) {
console.error(
'Erro ao salvar agendamento no Supabase:',
error
);
return {
ok: false,
message:
'Não foi possível registrar o agendamento. Confira sua internet e tente novamente.'
};
}
}
/* =========================================================
ENVIAR AGENDAMENTO
========================================================= */
bookingForm?.addEventListener(
'submit',
async event => {
event.preventDefault();
const status =
$('#formStatus');
/*
VALIDAÇÃO DOS CAMPOS
*/
if (
!bookingForm.checkValidity()
) {
bookingForm.reportValidity();
if (status) {
status.textContent =
'Preencha os campos obrigatórios para continuar.';
}
return;
}
if (
!dateInput?.value
) {
if (status) {
status.textContent =
'Escolha um dia disponível.';
}
return;
}
if (
!timeInput?.value
) {
if (status) {
status.textContent =
'Escolha um horário disponível.';
}
return;
}
/*
DADOS DO FORMULÁRIO
*/
const name =
$('#name')
?.value
?.trim() ||
'Cliente';
const phone =
$('#phone')
?.value
?.trim() ||
'Não informado';
const service =
$('#service')
?.value ||
'Não informado';
const selectedDate =
dateInput.value;
const selectedTime =
timeInput.value;

/*
REVALIDAÇÃO FINAL DA DATA.
Mesmo que duas clientes estejam com o site aberto ao mesmo tempo,
a data é conferida novamente antes de registrar o pedido.
*/
const currentBookedTimes = await getBookedTimes(selectedDate);
if (currentBookedTimes === null) {
if (status) {
status.textContent = 'Não foi possível confirmar a disponibilidade agora. Tente novamente em instantes.';
}
return;
}
if (currentBookedTimes.length > 0) {
bookedDateCache.set(selectedDate, true);
if (status) {
status.textContent = 'Essa data acabou de ser agendada por outra cliente. Escolha outra data disponível.';
}
await populateAvailableDates();
return;
}

const firstVisit =
$('#firstVisit')
?.value ||
'Não informado';
const notes =
$('#notes')
?.value
?.trim() ||
'Sem observações.';
/*
DIA VISÍVEL:
EXEMPLO "SEGUNDA-FEIRA"
*/
const weekDay =
prettyDate(
selectedDate
);
/*
PAYLOAD PARA SALVAR
*/
const payload = {
name,
phone,
service,
date:
selectedDate,
day:
weekDay,
time:
selectedTime,
firstVisit,
notes
};
if (status) {
status.textContent =
'Preparando seu agendamento...';
}
/*
TENTA SALVAR,
MAS NUNCA BLOQUEIA
O WHATSAPP.
*/
const saveResult =
await saveBooking(
payload
);
if (
!saveResult.ok
) {
if (status) {
status.textContent =
saveResult.message ||
'Não foi possível registrar o agendamento. Tente novamente.';
}
if (
saveResult.conflict
) {
bookedDateCache.set(selectedDate, true);
await populateAvailableDates();
}
return;
}
/* A partir daqui a data fica automaticamente indisponível no site. */
bookedDateCache.set(selectedDate, true);
/*
MENSAGEM COMPLETA
DO WHATSAPP
*/
const message = [
'Olá, Studio JD! 💗',
'',
'Gostaria de solicitar um agendamento.',
'',
`👤 Nome: ${name}`,
`📱 WhatsApp: ${phone}`,
`💅 Serviço: ${service}`,
`📅 Dia: ${weekDay}`,
`⏰ Horário: ${selectedTime}`,
`✨ Primeira visita: ${firstVisit}`,
`📝 Observações: ${notes}`,
'',
'Pode confirmar meu atendimento, por favor? 💗'
].join('\n');
/*
NÚMERO DO WHATSAPP
*/
let whatsapp =
publicConfig
?.settings
?.whatsapp ||
'5561981735176';
/*
REMOVE QUALQUER
CARACTERE QUE NÃO
SEJA NÚMERO.
*/
whatsapp =
String(
whatsapp
).replace(
/\D/g,
''
);
if (
!whatsapp
) {
whatsapp =
'5561981735176';
}
const whatsappURL =
`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
if (status) {
status.textContent =
'Tudo certo! Abrindo o WhatsApp…';
}
/*
REGISTRA O CLIQUE E ABRE O WHATSAPP
*/
await trackEvent(
'whatsapp_agendamento',
'bookingForm',
service
);
window.location.href =
whatsappURL;
}
);
/* =========================================================
MÁSCARA DO TELEFONE
========================================================= */
phoneInput?.addEventListener(
'input',
event => {
let value =
event.target.value
.replace(
/\D/g,
''
)
.slice(
0,
11
);
if (
value.length > 10
) {
value =
value.replace(
/(\d{2})(\d{5})(\d{4})/,
'($1) $2-$3'
);
} else if (
value.length > 6
) {
value =
value.replace(
/(\d{2})(\d{4})(\d{0,4})/,
'($1) $2-$3'
);
} else if (
value.length > 2
) {
value =
value.replace(
/(\d{2})(\d{0,5})/,
'($1) $2'
);
} else if (
value.length
) {
value =
value.replace(
/(\d{0,2})/,
'($1'
);
}
event.target.value =
value;
}
);
/* =========================================================
ANO AUTOMÁTICO
========================================================= */
const yearElement =
$('#year');
if (
yearElement
) {
yearElement.textContent =
new Date()
.getFullYear();
}
/* =========================================================
INICIAR SITE
========================================================= */
/* =========================================================
MÉTRICAS PÚBLICAS
========================================================= */
trackEvent(
'visita',
'pagina'
);
$$('.service-book')
.forEach(button => {
button.addEventListener(
'click',
() => {
trackEvent(
'clique_agendar',
'service-book',
button.dataset.service || ''
);
}
);
});
$$(
'a[href*="wa.me"], a[href*="whatsapp"]'
)
.forEach(link => {
link.addEventListener(
'click',
() => {
trackEvent(
'clique_whatsapp',
link.className || 'link-whatsapp'
);
}
);
});
loadPublicConfig();

/* Atualiza a agenda quando a cliente volta para a página. */
window.addEventListener('pageshow', () => {
if (publicConfig) populateAvailableDates();
});
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'visible' && publicConfig) {
populateAvailableDates();
}
});