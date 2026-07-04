/* ============================================================
   PIXEL GARAGE — interactivity (Pac-Man themed)
   ============================================================ */

/* ---------- mobile nav ---------- */
const toggle = document.querySelector('.nav-toggle');
const links  = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links?.addEventListener('click', e => {
  if (e.target.tagName === 'A') links.classList.remove('open');
});

/* ---------- palette ---------- */
const COLORS = ['#00000000', '#1c1633', '#ffe11a', '#ff5c39', '#00c2a8',
                '#7c5cff', '#ff5c9e', '#39a0ff', '#ffffff'];
let active = '#ffe11a';

const paletteEl = document.getElementById('palette');
COLORS.forEach((c) => {
  const b = document.createElement('b');
  b.style.background = c === '#00000000'
    ? 'repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0/10px 10px'
    : c;
  if (c === active) b.classList.add('sel');
  b.title = c === '#00000000' ? 'eraser' : c;
  b.addEventListener('click', () => {
    active = c;
    paletteEl.querySelectorAll('b').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
  });
  paletteEl.appendChild(b);
});

/* ---------- hero canvas: a pixel Pac-Man you can draw on ---------- */
/* 16x16 sprite. . = empty, Y = pac yellow, k = eye */
const PACMAN = [
  '................',
  '.....YYYYYY.....',
  '...YYYYYYYYYY...',
  '..YYYYYYYYYYYY..',
  '..YYYYkYYYY.....',
  '.YYYYYYYY.......',
  '.YYYYYYY........',
  '.YYYYYY.........',
  '.YYYYYY.........',
  '.YYYYYYY........',
  '.YYYYYYYY.......',
  '..YYYYYYYYY.....',
  '..YYYYYYYYYYYY..',
  '...YYYYYYYYYY...',
  '.....YYYYYY.....',
  '................'
];
const MAP = {
  Y: '#ffe11a',  // pac-man body
  k: '#1c1633'   // eye
};

const canvas = document.getElementById('pixelCanvas');
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    const ch = PACMAN[y][x];
    const cell = document.createElement('i');
    const col = MAP[ch] || 'transparent';
    cell.style.background = col;
    canvas.appendChild(cell);

    const paint = () => {
      cell.style.background = active === '#00000000' ? 'transparent' : active;
    };
    cell.addEventListener('mousedown', paint);
    cell.addEventListener('mouseenter', e => { if (e.buttons === 1) paint(); });
    cell.addEventListener('touchstart', e => { e.preventDefault(); paint(); }, { passive: false });
  }
}
canvas.addEventListener('touchmove', e => {
  const t = e.touches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);
  if (el && el.parentElement === canvas) {
    el.style.background = active === '#00000000' ? 'transparent' : active;
  }
}, { passive: true });

/* ---------- gallery: generate colourful pixel sprites ---------- */
const PAL = ['#ff5c39', '#ffd23f', '#00c2a8', '#7c5cff', '#ff5c9e', '#39a0ff'];
const BG  = ['#fdf3e3', '#1c1633', '#fce7c8', '#2a2350'];

// hand-made 8x8 sprites, cycled + recoloured
const SPRITES = [
  // Pac-Man
  ['..XXXX..','.XXXXXX.','XXXXX...','XXXX....','XXXX....','XXXXX...','.XXXXXX.','..XXXX..'],
  // ghost
  ['..XXXX..','.XXXXXX.','X.XX.X.X','X.XX.X.X','XXXXXXXX','XXXXXXXX','XXXXXXXX','X.X.X.X.'],
  // cherry
  ['......X.','.....X..','..XX.X..','.XXXXX..','XXXX.XX.','XXXXXXXX','.XXXXXX.','..XXXX..'],
  // heart
  ['.XX..XX.','XXXXXXXX','XXXXXXXX','XXXXXXXX','.XXXXXX.','..XXXX..','...XX...','........'],
  // mushroom
  ['..XXXX..','.XXXXXX.','XXXXXXXX','X.XXXX.X','XXXXXXXX','..X..X..','..X..X..','..XXXX..'],
  // star
  ['...XX...','...XX...','.XXXXXX.','XXXXXXXX','.XXXXXX.','.XX..XX.','.X....X.','........'],
  // sword
  ['......XX','.....XX.','....XX..','.X.XX...','.XXX....','XXX.....','XX......','X.......'],
  // slime
  ['........','..XXXX..','.XXXXXX.','XX.XX.XX','XXXXXXXX','XXXXXXXX','.XXXXXX.','X.X..X.X'],
  // coin
  ['..XXXX..','.XXXXXX.','XX.XX.XX','XX.XX.XX','XX.XX.XX','XX.XX.XX','.XXXXXX.','..XXXX..'],
  // potion
  ['..XX....','..XX....','.XXXX...','.X..X...','XXXXXX..','X....X..','XXXXXX..','.XXXX...'],
  // fish
  ['........','..XXXX.X','.XXXXXXX','XXX.XXX.','.XXXXXXX','..XXXX.X','........','........'],
  // ghost 2 (scared)
  ['..XXXX..','.XXXXXX.','XXXXXXXX','X.XX.X.X','XXXXXXXX','X.X.X.XX','XXXXXXXX','X.X.X.X.']
];

/* ---------- the crew: one person per sprite, shown on hover ---------- */
const TEAM = [
  { name: 'Saran Adhith', role: 'Founder',           bio: 'Leads the studio — apps, backend & launch.' },
  { name: 'Alwin Joseph', role: 'Co-Founder',        bio: 'Apps, web & client delivery.' },
  { name: 'Daraneesh',    role: 'Co-Founder',        bio: 'Design, UX & web builds.' },
  { name: 'Puranjothi',   role: 'Android Developer', bio: 'Builds our Android apps end to end.' },
  { name: 'Neha',         role: 'iOS Developer',     bio: 'Crafts native iOS experiences.' },
  { name: 'Jasmine',      role: 'Intern',            bio: 'Learning the ropes across the stack.' },
  { name: 'Michael',      role: 'Intern',            bio: 'Hands-on with builds & bug fixes.' },
  { name: 'Tejas',        role: 'Intern',            bio: 'Helping ship features & tests.' },
  { name: 'Rahul',        role: 'SEO Analyst',       bio: 'Gets our clients found on search.' },
  { name: 'Priya',        role: 'QA Tester',         bio: 'Breaks things so users don’t.' },
  { name: 'Arjun',        role: 'QA Tester',         bio: 'Tests every release before launch.' },
  { name: 'Sneha',        role: 'UI/UX Designer',    bio: 'Designs clean, friendly interfaces.' },
];

const grid = document.getElementById('gallery-grid');
for (let n = 0; n < 12; n++) {
  const cell = document.createElement('div');
  cell.className = 'gallery-cell';
  cell.tabIndex = 0;
  const bg = BG[n % BG.length];
  const fg = PAL[(n * 5) % PAL.length];
  const fg2 = PAL[(n * 3 + 2) % PAL.length];
  cell.style.background = bg;

  const px = document.createElement('div');
  px.className = 'px-grid';
  px.style.gridTemplateColumns = 'repeat(8, 1fr)';
  px.style.padding = '14%';
  const s = SPRITES[n % SPRITES.length];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const i = document.createElement('i');
      if (s[y][x] === 'X') {
        i.style.background = (x + y) % 3 === 0 ? fg2 : fg;
      }
      px.appendChild(i);
    }
  }
  cell.appendChild(px);

  const p = TEAM[n];
  const info = document.createElement('div');
  info.className = 'cell-info';
  info.innerHTML = `<b>${p.name}</b><span>${p.role}</span><em>${p.bio}</em>`;
  cell.appendChild(info);

  cell.setAttribute('role', 'img');
  cell.setAttribute('aria-label', `${p.name} — ${p.role}. ${p.bio}`);
  grid.appendChild(cell);
}

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = 1;
      e.target.style.transform = 'none';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.card, .gallery-cell, .member, .section-head').forEach((el, i) => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(16px)';
  el.style.transition = `opacity .4s steps(4) ${(i % 6) * 40}ms, transform .4s steps(4) ${(i % 6) * 40}ms`;
  io.observe(el);
});
