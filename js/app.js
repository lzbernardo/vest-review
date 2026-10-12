(() => {
'use strict';

const PROG_KEY = 'revest:progress';
const LAST_KEY = 'revest:last';
const GROUPS_KEY = 'revest:groups';
const NAV_KEY = 'revest:nav';
const DATA_DIR = 'revisoes/';
const GUIDE_ROUTE = 'criar';
const SKILL_FILE = 'downloads/revisao-vestibular.skill';
const REPO_URL = 'https://github.com/lzbernardo/vest-review';

const icon = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
// Each subject is matched against the normalized "disciplina" of a review; the first match wins.
// "name" is the standard title shown everywhere, whatever spelling the JSON used.
const SUBJECTS = [
  { key: 'matematica', name: 'Matemática', keys: ['matematica'], color: '#0071e3', icon: icon('<path d="M5 7.5h5M7.5 5v5M14.5 7.5h5M5.7 15.2l3.6 3.6M9.3 15.2l-3.6 3.6M14.5 17h5M17 14.3v.01M17 19.7v.01"/>') },
  { key: 'fisica', name: 'Física', keys: ['fisica'], color: '#f56300', icon: icon('<circle cx="12" cy="12" r="1.3" fill="currentColor"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>') },
  { key: 'quimica', name: 'Química', keys: ['quimica'], color: '#ae3ec9', icon: icon('<path d="M9 3h6M10 3v6.2L4.9 18.1A1.9 1.9 0 0 0 6.6 21h10.8a1.9 1.9 0 0 0 1.7-2.9L14 9.2V3M7.6 14.5h8.8"/>') },
  { key: 'biologia', name: 'Biologia', keys: ['biologia'], color: '#248a3d', icon: icon('<path d="M20 4C10.5 4 5 9 5 16.5c0 1 .2 2.3 .2 2.3s1.3 .2 2.3 .2C15 19 20 13.5 20 4zM4 20l9-9"/>') },
  { key: 'historia', name: 'História', keys: ['historia'], color: '#a2632a', icon: icon('<path d="M3 9l9-5 9 5M4.5 9h15M6.5 9v8M10.3 9v8M13.7 9v8M17.5 9v8M4.5 17h15M3 20h18"/>') },
  { key: 'geografia', name: 'Geografia', keys: ['geografia'], color: '#0c8599', icon: icon('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>') },
  { key: 'literatura', name: 'Literatura', keys: ['literatura'], color: '#c92a2a', icon: icon('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>') },
  { key: 'redacao', name: 'Redação', keys: ['redacao'], color: '#b08900', icon: icon('<path d="M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5 4 20zM14.5 6l3.5 3.5"/>') },
  { key: 'ingles', name: 'Inglês', keys: ['ingles'], color: '#3b5bdb', icon: icon('<path d="M4 5h16v11.5h-8.5L7 20v-3.5H4zM8 9.3h8M8 12.5h5"/>') },
  { key: 'portugues', name: 'Português', keys: ['portugues', 'gramatica', 'linguagens'], color: '#d6336c', icon: icon('<path d="M3.5 18L8.5 6h1l5 12M5.4 14h7.2M20.5 18v-5.5a2.5 2.5 0 0 0-5 0v3a2.5 2.5 0 0 0 5 0"/>') },
  { key: 'filosofia', name: 'Filosofia', keys: ['filosofia'], color: '#6741d9', icon: icon('<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.6 .5 1 1.3 1.1 2.2h5c.1-.9 .5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>') },
  { key: 'sociologia', name: 'Sociologia', keys: ['sociologia'], color: '#5c940d', icon: icon('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.2" cy="9" r="2.3"/><path d="M16.5 14.2c2.6 .4 4.5 2.7 4.5 5.8"/>') },
];
const OTHER = { key: 'outras', name: 'Outras', color: '#6e6e73', icon: icon('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>') };
const DIFF = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };
const TABS = [['resumo', 'Resumo'], ['conceitos', 'Conceitos'], ['questoes', 'Questões'], ['referencias', 'Provas']];
const X_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>';
const PLAY_ICON = '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7.3-4.4a.6.6 0 0 0 0-1L3.9 1.1a.6.6 0 0 0-.9.5z"/></svg>';
const EXT_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5H2.5v7h7v-2M7 2h3v3M10 2L5.5 6.5"/></svg>';

const $ = (id) => document.getElementById(id);
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
};

const state = {
  lib: [],          // index entries: { id, arquivo, titulo, disciplina, gerado_em, questoes }
  current: null,    // { id, data } of the open review
  openGroups: [],   // subject keys expanded in the sidebar
  subject: null,    // subject whose screen is open, when no theme is
  guide: false,     // the "create new reviews" screen is open
  pendingQ: null,   // practice question to scroll to once its review opens
  error: null,      // [title, text] shown in place of a review
  progress: {},     // { [reviewId]: { [questionId]: { choice?, revealed?, self? } } }
  currentId: null,
  tab: 'resumo',
  filter: 'todas',
  inst: 'todas',    // exam-board filter on the Provas tab
  query: '',
};

/* ---------- Text helpers ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const subject = (disciplina) => { const d = norm(disciplina); return SUBJECTS.find((s) => s.keys.some((k) => d.includes(k))) || OTHER; };
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : null);
const arr = (v) => (Array.isArray(v) ? v : []);

// Inline math is $...$. An opening $ followed by a space (as in "R$ 150") is currency, not math.
const MATH = /(?<!\\)\$(?!\s)((?:\\.|[^$\\])+?)(?<!\s)\$/g;
function rich(text) {
  // Math is swapped for placeholders first so Markdown markers can wrap around formulas
  const math = [];
  const src = String(text ?? '').replace(MATH, (_, code) => `${math.push(code) - 1}`);
  return esc(src)
    .replace(/^[ \t]*#{1,6}[ \t]+(.+)$/gm, '<strong>$1</strong>')
    .replace(/^([ \t]*)[-*][ \t]+/gm, '$1• ')
    .replace(/`([^`\n]+)`/g, '<code class="tex-raw">$1</code>')
    .replace(/\*\*(?!\s)([^\n]+?)(?<!\s)\*\*/g, '<strong>$1</strong>')
    .replace(/__(?!\s)([^\n]+?)(?<!\s)__/g, '<strong>$1</strong>')
    .replace(/(?<![*\w])\*(?![\s*])([^*\n]+?)(?<![\s*])\*(?![*\w])/g, '<em>$1</em>')
    .replace(/\*\*/g, '')
    .replace(/(\d+)/g, (_, i) => tex(math[+i]));
}
function tex(code) {
  if (window.katex) {
    try { return window.katex.renderToString(code, { throwOnError: false, strict: false }); } catch { /* fall through */ }
  }
  return `<span class="tex-raw">${esc(code)}</span>`;
}
function fmtDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return '';
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* ---------- Library ---------- */
const cache = new Map(); // id -> review JSON already fetched
const current = () => state.current;
const isReview = (d) => d && typeof d === 'object' && d.tema && typeof d.tema.titulo === 'string' && d.tema.titulo.trim();
const routeId = () => { try { return decodeURIComponent(location.hash.replace(/^#\/?/, '')); } catch { return ''; } };

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
function persist() {
  const ok = store.set(PROG_KEY, state.progress);
  if (!ok && !persist.warned && (persist.warned = true)) toast('Não foi possível salvar o progresso neste navegador.');
}
function select(id) {
  closeSidebar();
  if (routeId() !== id) location.hash = `#/${encodeURI(id)}`;
}

// The URL hash names the open review, so every theme has a shareable link
async function route() {
  const wanted = routeId();
  const entry = state.lib.find((e) => e.id === wanted) || null; // none means the home or a subject screen
  state.subject = (wanted.startsWith('@') && state.lib.find((e) => e.materia.key === wanted.slice(1))?.materia) || null;
  state.guide = !entry && wanted === GUIDE_ROUTE;
  state.currentId = entry?.id || null;
  state.error = null;
  closeFocus();
  renderSidebar();
  if (!entry) {
    state.current = null;
    state.pendingQ = null;
    renderMain();
    window.scrollTo(0, 0);
    return;
  }
  try {
    if (!cache.has(entry.id)) {
      const data = await getJson(DATA_DIR + entry.arquivo.split('/').map(encodeURIComponent).join('/'));
      if (!isReview(data)) throw new Error('formato');
      cache.set(entry.id, data);
    }
  } catch {
    if (state.currentId !== entry.id) return;
    state.current = null;
    state.error = ['Não foi possível abrir esta revisão', `O arquivo ${entry.arquivo} não carregou ou não está no formato esperado.`];
    renderMain();
    return;
  }
  if (state.currentId !== entry.id) return; // a newer navigation won
  state.current = { id: entry.id, data: cache.get(entry.id) };
  state.tab = 'resumo';
  state.filter = 'todas';
  store.set(LAST_KEY, entry.id);
  renderMain();
  window.scrollTo(0, 0);
  if (state.pendingQ) {
    const q = state.pendingQ;
    state.pendingQ = null;
    setTab('questoes');
    document.getElementById(`q-${q}`)?.scrollIntoView({ block: 'start' });
  }
}

/* ---------- Progress ---------- */
const progOf = (id) => state.progress[id] || (state.progress[id] = {});
function stats(entry) {
  const qs = arr(entry.data.questoes_reforco);
  const p = state.progress[entry.id] || {};
  let done = 0, right = 0;
  for (const q of qs) {
    const a = p[q.id];
    if (!a) continue;
    if (isMC(q) && a.choice) { done++; if (a.choice === q.gabarito) right++; }
    else if (!isMC(q) && a.self) { done++; if (a.self === 'ok') right++; }
  }
  return { total: qs.length, done, right };
}
const isMC = (q) => q.tipo === 'multipla_escolha' && arr(q.alternativas).length > 0;

/* ---------- Render: sidebar ---------- */
const doneCount = (id) => Object.values(state.progress[id] || {}).filter((a) => a.choice || a.self).length;
const byTitle = (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR');
const SIDEBAR_ICON = '<svg viewBox="0 0 18 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="1.5" width="15" height="13" rx="3"/><path d="M6.5 1.5v13"/></svg>';

// Subjects are collapsible groups; the one holding the open theme, and any the reader opened, stay expanded
function renderSidebar() {
  const q = norm(state.query);
  const shown = state.lib.filter((e) => !q || norm(`${e.titulo} ${e.materia.name} ${e.disciplina}`).includes(q));
  const groups = new Map();
  for (const e of shown) {
    if (!groups.has(e.materia)) groups.set(e.materia, []);
    groups.get(e.materia).push(e);
  }
  const subjects = [...groups.keys()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const currentKey = state.lib.find((e) => e.id === state.currentId)?.materia.key;
  $('lib-count').textContent = state.lib.length ? plural(state.lib.length, 'tema de revisão', 'temas de revisão') : 'Revisões de vestibular';
  $('search').hidden = state.lib.length < 2;
  const home = state.lib.length ? `
    <button class="item item-home" data-action="home" aria-current="${!state.currentId && !state.subject && !state.guide}">
      <span class="glyph">${HOME_ICON}</span>
      <span class="item-text"><span class="item-title">Início</span></span>
    </button>
    <div class="group-label">Matérias</div>` : '';
  $('lib').innerHTML = home + (subjects.map((subj) => {
    const open = !!q || state.openGroups.includes(subj.key) || subj.key === currentKey || subj === state.subject;
    const list = groups.get(subj).sort(byTitle);
    return `
    <div class="group" style="--tint:${subj.color}">
      <button class="group-head" data-action="group" data-key="${subj.key}" aria-expanded="${open}" aria-current="${subj === state.subject}">
        <span class="glyph">${subj.icon}</span>
        <span class="group-name">${esc(subj.name)}</span>
        <span class="group-count">${list.length}</span>
        ${CHEVRON}
      </button>
      <div class="group-items"><div>
        ${list.map((e) => {
          const done = Math.min(doneCount(e.id), e.questoes || 0);
          const sub = e.questoes ? (done ? `${done} de ${e.questoes} questões feitas` : plural(e.questoes, 'questão', 'questões')) : fmtDate(e.gerado_em);
          return `
          <button class="item" data-action="open" data-id="${esc(e.id)}" aria-current="${e.id === state.currentId}">
            <span class="item-text">
              <span class="item-title">${esc(e.titulo)}</span>
              <span class="item-sub">${esc(sub)}</span>
            </span>
          </button>`;
        }).join('')}
      </div></div>
    </div>`;
  }).join('') || (state.lib.length ? '<div class="group-label">Nada encontrado</div>' : '')) + (q ? '' : `
    <div class="group-label">Criar</div>
    <button class="item item-home" data-action="guide" aria-current="${state.guide}">
      <span class="glyph">${PLUS_ICON}</span>
      <span class="item-text"><span class="item-title">Novas revisões</span></span>
    </button>`);
}

/* ---------- Render: top bar ---------- */
// Present on every screen: the sidebar toggle plus a trail showing where the reader is
function topRow(subj, title) {
  const here = (text) => `<span aria-current="page">${esc(text)}</span>`;
  const home = '<button data-action="home">Início</button>';
  const trail = !subj ? (title ? [home, here(title)] : [here('Início')]) : [
    home,
    title ? `<button data-action="subject" data-key="${subj.key}">${esc(subj.name)}</button>` : here(subj.name),
    ...(title ? [here(title)] : []),
  ];
  return `
    <div class="top-row">
      <button class="menu-btn" data-action="menu" aria-label="Mostrar ou ocultar a lista de matérias" title="Mostrar ou ocultar matérias">${SIDEBAR_ICON}</button>
      <nav class="crumbs" aria-label="Você está em">${trail.join(CHEVRON)}</nav>
    </div>`;
}
function pagerHtml(entry) {
  const list = state.lib.filter((e) => e.materia === entry.materia).sort(byTitle);
  const i = list.indexOf(entry);
  const link = (e, label, cls) => (e ? `
    <button class="card pager-link ${cls}" data-action="open" data-id="${esc(e.id)}">
      <span class="pager-label">${label}</span>
      <span class="pager-title">${esc(e.titulo)}</span>
    </button>` : '<span></span>');
  if (list.length < 2) return '';
  return `<nav class="pager" aria-label="Outros temas de ${esc(entry.materia.name)}">${link(list[i - 1], 'Tema anterior', 'prev')}${link(list[i + 1], 'Próximo tema', 'next')}</nav>`;
}

/* ---------- Render: main ---------- */
function message(title, text) {
  return `
    <div class="empty"><div class="empty-box">
      <div class="empty-icon">${OTHER.icon}</div>
      <h2>${esc(title)}</h2>
      <p>${esc(text)}</p>
    </div></div>`;
}
function renderMain() {
  const entry = current();
  const main = $('main');
  if (!entry) {
    main.innerHTML = state.guide ? renderGuide() : state.error || !state.lib.length
      ? message(...(state.error || ['Nenhuma revisão publicada ainda', 'Assim que um tema for adicionado à pasta de revisões, ele aparece aqui.']))
      : state.subject ? renderSubject(state.subject) : renderHome();
    return;
  }
  const { tema } = entry.data;
  const meta = [entry.data.gerado_em && `Gerado em ${fmtDate(entry.data.gerado_em)}`].filter(Boolean).join(' · ');
  const item = state.lib.find((e) => e.id === entry.id);
  const subj = item.materia;
  main.style.setProperty('--tint', subj.color);
  main.innerHTML = `
    <div class="bar"><div class="wrap">
      ${topRow(subj, item.titulo)}
      <div class="seg" id="seg" role="tablist" style="--n:${TABS.length};--i:${TABS.findIndex((t) => t[0] === state.tab)}">
        <span class="seg-thumb" aria-hidden="true"></span>
        ${TABS.map(([key, label]) => `<button role="tab" data-action="tab" data-tab="${key}" aria-selected="${key === state.tab}">${label}</button>`).join('')}
      </div>
    </div></div>
    <div class="wrap hero">
      <div class="eyebrow">${subj.icon}${esc(subj.name)}</div>
      <h2>${esc(tema.titulo)}</h2>
      ${meta ? `<div class="meta">${esc(meta)}</div>` : ''}
      ${arr(tema.subtopicos).length ? `<div class="chips">${tema.subtopicos.map((s) => `<span class="chip">${rich(s)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="wrap"><div class="view" id="view" role="tabpanel"></div>${pagerHtml(item)}</div>`;
  renderView();
}

function renderView() {
  const entry = current();
  if (!entry) return;
  const view = $('view');
  view.innerHTML = VIEWS[state.tab](entry);
  view.style.animation = 'none';
  void view.offsetWidth;
  view.style.animation = '';
  fitFormulas();
}

const empty = (msg) => `<div class="card" style="color:var(--text-2)">${esc(msg)}</div>`;

const VIEWS = {
  resumo(entry) {
    const r = entry.data.resumo_pratico;
    if (!r) return empty('Este arquivo não traz resumo prático.');
    const bullets = (items, cls, mark) => `<div class="card"><ul class="list">${items.map((t, i) => `<li><span class="dot ${cls}">${mark ?? i + 1}</span><div class="rich">${rich(t)}</div></li>`).join('')}</ul></div>`;
    const cobra = Object.keys(r).filter((k) => k.startsWith('como_') && typeof r[k] === 'string');
    return `
      ${r.em_uma_frase ? `<h3 class="section-title">Em uma frase</h3><div class="card"><p class="lead rich">${rich(r.em_uma_frase)}</p></div>` : ''}
      ${arr(r.pontos_chave).length ? `<h3 class="section-title">Pontos-chave</h3>${bullets(r.pontos_chave, 'dot-key')}` : ''}
      ${arr(r.formulas).length ? `<h3 class="section-title">Fórmulas</h3><div class="formulas">${r.formulas.map((f) => `
        <div class="card">
          <div class="f-name">${rich(f.nome)}</div>
          <div class="f-expr rich">${rich(f.expressao)}</div>
          ${f.quando_usar ? `<div class="f-when rich">${rich(f.quando_usar)}</div>` : ''}
        </div>`).join('')}</div>` : ''}
      ${arr(r.erros_comuns).length ? `<h3 class="section-title">Erros comuns</h3>${bullets(r.erros_comuns, 'dot-err', '!')}` : ''}
      ${looseImages(entry.data).length ? `<h3 class="section-title">Figuras</h3><div class="card">${figures(entry.data, looseImages(entry.data))}</div>` : ''}
      ${cobra.map((k) => `<h3 class="section-title">${esc(cobraTitle(k))}</h3><div class="card"><div class="rich">${rich(r[k])}</div></div>`).join('')}`;
  },

  conceitos(entry) {
    const cs = arr(entry.data.conceitos);
    if (!cs.length) return empty('Este arquivo não traz conceitos.');
    return `
      <div class="play-row">
        <span>${plural(cs.length, 'conceito', 'conceitos')}</span>
        <button class="btn btn-primary btn-sm" data-action="play">${PLAY_ICON}Modo foco</button>
      </div>
      ${cs.map((c, i) => conceptCard(entry.data, c, i)).join('')}`;
  },

  questoes(entry) {
    const qs = arr(entry.data.questoes_reforco);
    if (!qs.length) return empty('Este arquivo não traz questões de reforço.');
    const levels = ['todas', ...Object.keys(DIFF).filter((d) => qs.some((q) => q.dificuldade === d))];
    const shown = qs.map((q, i) => [q, i]).filter(([q]) => state.filter === 'todas' || q.dificuldade === state.filter);
    return `
      <div class="q-tools">
        <div class="progress" id="progress">${progressHtml(entry)}</div>
        ${levels.length > 2 ? `<div class="filters">${levels.map((l) => `<button class="chip" data-action="filter" data-filter="${l}" aria-pressed="${state.filter === l}">${l === 'todas' ? 'Todas' : DIFF[l]}</button>`).join('')}</div>` : ''}
      </div>
      ${shown.map(([q, i]) => questionHtml(entry, q, i)).join('')}
      <div class="q-actions" style="justify-content:center;margin-top:1.75rem"><button class="btn btn-quiet btn-sm" data-action="reset">Recomeçar questões</button></div>`;
  },

  referencias(entry) {
    const refs = refsOf(entry.data);
    const fontes = arr(entry.data.fontes);
    if (!refs.length && !fontes.length) return empty('Este arquivo não traz questões de vestibular.');
    const insts = [...new Set(refs.map((r) => r.instituicao).filter(Boolean))];
    if (!insts.includes(state.inst)) state.inst = 'todas';
    const shown = refs.filter((r) => state.inst === 'todas' || r.instituicao === state.inst);
    return `
      ${refs.length ? `
        <h3 class="section-title">Questões de vestibular</h3>
        ${insts.length > 1 ? `<div class="filters ref-filters">${['todas', ...insts].map((i) => `<button class="chip" data-action="inst" data-inst="${esc(i)}" aria-pressed="${state.inst === i}">${i === 'todas' ? 'Todas' : esc(i)}</button>`).join('')}</div>` : ''}
        ${shown.map((r) => `<article class="card ref" id="r-${esc(r.id)}">${refBody(entry.data, r)}</article>`).join('')}` : ''}
      ${fontes.length ? `<h3 class="section-title">Fontes</h3><div class="card sources"><ul class="list">${fontes.map((f) => {
        const url = safeUrl(f.url);
        return `<li><div>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(f.titulo || url)}</a><span>${esc(url.replace(/^https?:\/\//, '').split(/[/?]/)[0])}</span>` : esc(f.titulo)}</div></li>`;
      }).join('')}</ul></div>` : ''}`;
  },
};

/* ---------- Schema helpers (versions 1.0 and 1.1) ---------- */
// 1.1 renamed "questoes_vestibular_referencia" to "questoes_indexadas" and split "link" in two
const refsOf = (data) => (arr(data.questoes_indexadas).length ? data.questoes_indexadas : arr(data.questoes_vestibular_referencia));
const byId = (list, id) => arr(list).find((x) => x.id === id);
const imagesOf = (data, ids) => arr(ids).map((id) => byId(data.imagens, id)).filter((img) => img && safeUrl(img.url));
const conceptsOf = (data, ids) => arr(ids).map((id) => byId(data.conceitos, id)).filter(Boolean);
const cap = (s) => String(s).replace(/^./, (c) => c.toUpperCase());
const refLabel = (r) => [r.instituicao, r.ano].filter(Boolean).join(' ');
const practiceChip = (data, q) => `<button class="chip" data-action="goto-q" data-q="${esc(q.id)}">Questão ${arr(data.questoes_reforco).indexOf(q) + 1}</button>`;
const linkRow = (label, chips) => (chips.length ? `<div class="q-foot"><span class="q-foot-label">${label}</span>${chips.join('')}</div>` : '');
const extLink = (url, label) => `<a class="ext" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label} ${EXT_ICON}</a>`;

function cobraTitle(key) {
  const who = key.replace(/^como_(a_|o_)?/, '').replace(/_cobra$/, '').replace(/_/g, ' ');
  return who ? `Como a ${who.replace(/^\w/, (c) => c.toUpperCase())} cobra` : 'Como é cobrado';
}

/* ---------- Figures ---------- */
function figureCredit(img) {
  const src = safeUrl(img.fonte_url) || safeUrl(img.url);
  const parts = [img.tipo && cap(img.tipo), img.credito, img.licenca].filter(Boolean).map(esc);
  parts.push(`<a href="${esc(src)}" target="_blank" rel="noopener noreferrer">Fonte</a>`);
  return parts.join(' · ');
}
function figureHtml(img) {
  return `
    <figure class="fig">
      <button class="fig-img" data-action="zoom" data-img="${esc(img.id)}" aria-label="Ampliar imagem">
        <img src="${esc(img.url)}" alt="${esc(img.alt)}" loading="lazy" decoding="async">
      </button>
      <div class="fig-missing">Imagem indisponível no momento.</div>
      <figcaption>${img.legenda ? `<div class="rich">${rich(img.legenda)}</div>` : ''}<small>${figureCredit(img)}</small></figcaption>
    </figure>`;
}
function figures(data, ids) {
  const imgs = imagesOf(data, ids);
  return imgs.length ? `<div class="figs" data-n="${Math.min(imgs.length, 2)}">${imgs.map(figureHtml).join('')}</div>` : '';
}
// Images no concept or question points to still deserve a place: they go at the end of the summary
function looseImages(data) {
  const used = new Set([...arr(data.conceitos), ...arr(data.questoes_reforco)].flatMap((x) => arr(x.imagens)));
  return arr(data.imagens).filter((img) => !used.has(img.id)).map((img) => img.id);
}

/* ---------- Concept and exam-question bodies (shared by the tabs and the sheet) ---------- */
function conceptBody(data, c) {
  const exams = refsOf(data).filter((r) => arr(r.conceitos).includes(c.id));
  const practice = arr(data.questoes_reforco).filter((q) => arr(q.conceitos).includes(c.id));
  return `
    <h3 id="sheet-title">${rich(c.nome)}</h3>
    <div class="rich">${rich(c.explicacao)}</div>
    ${figures(data, c.imagens)}
    ${c.exemplo ? `<div class="note"><span class="note-label">Exemplo</span><div class="rich">${rich(c.exemplo)}</div></div>` : ''}
    ${c.dica_de_prova ? `<div class="note note-tip"><span class="note-label">Dica de prova</span><div class="rich">${rich(c.dica_de_prova)}</div></div>` : ''}
    ${linkRow('Já caiu em', exams.map((r) => `<button class="chip chip-accent" data-action="ref" data-ref="${esc(r.id)}">${esc([refLabel(r), r.numero].filter(Boolean).join(' · '))}</button>`))}
    ${linkRow('Praticar', practice.map((q) => practiceChip(data, q)))}`;
}

const conceptCard = (data, c, i) => `<article class="card concept" id="c-${esc(c.id)}"><div class="num">Conceito ${i + 1}</div>${conceptBody(data, c)}</article>`;

function refBody(data, r) {
  const question = safeUrl(r.link_questao) || safeUrl(r.link);
  const answer = safeUrl(r.link_gabarito);
  const kind = { multipla_escolha: 'Múltipla escolha', dissertativa: 'Dissertativa' }[r.tipo];
  const practice = arr(data.questoes_reforco).filter((q) => q.inspirada_em === r.id);
  const links = [];
  if (question && answer === question) links.push(extLink(question, 'Ver questão e resolução'));
  else {
    if (question) links.push(extLink(question, 'Ver questão original'));
    if (answer) links.push(extLink(answer, 'Ver resolução'));
  }
  return `
    <div class="ref-src">${esc([refLabel(r), r.numero].filter(Boolean).join(' · '))}</div>
    <h3 id="sheet-title">${rich(r.assunto)}</h3>
    ${r.fase || kind ? `<div class="ref-fase">${esc([r.fase, kind].filter(Boolean).join(' · '))}</div>` : ''}
    ${r.o_que_cobra ? `<div class="rich">${rich(r.o_que_cobra)}</div>` : ''}
    ${r.gabarito_oficial ? `<details class="reveal"><summary>Ver gabarito oficial</summary><div class="rich">${r.tipo === 'dissertativa' ? '' : 'Alternativa '}<strong>${rich(r.gabarito_oficial)}</strong></div></details>` : ''}
    ${links.length ? `<div class="ext-row">${links.join('')}</div>` : ''}
    ${linkRow('Conceitos', conceptsOf(data, r.conceitos).map((c) => `<button class="chip" data-action="concept" data-concept="${esc(c.id)}">${rich(c.nome)}</button>`))}
    ${linkRow('Treine com', practice.map((q) => practiceChip(data, q)))}`;
}

function progressHtml(entry) {
  const s = stats(entry);
  const text = s.done ? `${s.done} de ${s.total} feitas · ${plural(s.right, 'acerto', 'acertos')}` : plural(s.total, 'questão', 'questões');
  return `<div class="progress-text">${text}</div><div class="track"><i style="--p:${s.total ? s.done / s.total : 0}"></i></div>`;
}

function questionHtml(entry, q, index) {
  const a = (state.progress[entry.id] || {})[q.id] || {};
  const mc = isMC(q);
  const answered = mc ? !!a.choice : !!a.revealed;
  const ref = q.inspirada_em && byId(refsOf(entry.data), q.inspirada_em);
  const concepts = conceptsOf(entry.data, q.conceitos);

  let body;
  if (mc) {
    body = `<div class="alts">${q.alternativas.map((alt) => {
      let cls = '';
      if (answered) cls = alt.letra === q.gabarito ? 'is-right' : alt.letra === a.choice ? 'is-wrong' : 'is-dim';
      return `<button class="alt ${cls}" data-action="answer" data-letter="${esc(alt.letra)}" ${answered ? 'disabled' : ''}>
        <span class="letter">${esc(alt.letra)}</span><span class="rich">${rich(alt.texto)}</span></button>`;
    }).join('')}</div>`;
    if (answered) {
      const ok = a.choice === q.gabarito;
      body += `<div class="solution">
        <div class="verdict ${ok ? 'ok' : 'no'}">${ok ? 'Correto' : `Não foi desta vez. A resposta é ${esc(q.gabarito)}`}</div>
        ${q.resolucao ? `<h4>Resolução</h4><div class="rich">${rich(q.resolucao)}</div>` : ''}
        <div class="q-actions"><button class="btn btn-quiet btn-sm" data-action="retry">Tentar de novo</button></div>
      </div>`;
    }
  } else if (!answered) {
    body = `<div class="q-actions"><button class="btn btn-primary btn-sm" data-action="reveal">Ver gabarito e resolução</button></div>`;
  } else {
    body = `<div class="solution">
      ${q.gabarito ? `<h4>Gabarito</h4><div class="rich">${rich(q.gabarito)}</div>` : ''}
      ${q.resolucao ? `<h4>Resolução</h4><div class="rich">${rich(q.resolucao)}</div>` : ''}
      <div class="q-actions">
        ${a.self
          ? `<span class="verdict ${a.self === 'ok' ? 'ok' : 'no'}" style="margin:0;align-self:center">${a.self === 'ok' ? 'Marcada como certa' : 'Marcada para rever'}</span>
             <button class="btn btn-quiet btn-sm" data-action="retry">Refazer</button>`
          : `<button class="btn btn-quiet btn-sm" data-action="self" data-self="ok">Acertei</button>
             <button class="btn btn-quiet btn-sm" data-action="self" data-self="no">Preciso rever</button>`}
      </div>
    </div>`;
  }

  return `
    <article class="card q" id="q-${esc(q.id)}" data-q="${esc(q.id)}" data-index="${index}">
      <div class="q-head">
        <span class="q-num">Questão ${index + 1}</span>
        ${DIFF[q.dificuldade] ? `<span class="chip chip-${q.dificuldade}">${DIFF[q.dificuldade]}</span>` : ''}
        <span class="chip">${mc ? 'Múltipla escolha' : 'Dissertativa'}</span>
        ${ref ? `<button class="chip chip-accent" data-action="ref" data-ref="${esc(ref.id)}">Inspirada em ${esc(refLabel(ref))}</button>` : ''}
      </div>
      <div class="rich">${rich(q.enunciado)}</div>
      ${figures(entry.data, q.imagens)}
      ${body}
      ${concepts.length ? `<div class="q-foot"><span class="q-foot-label">Conceitos</span>${concepts.map((c) => `<button class="chip" data-action="concept" data-concept="${esc(c.id)}">${rich(c.nome)}</button>`).join('')}</div>` : ''}
    </article>`;
}

function refreshQuestion(card) {
  const entry = current();
  const q = arr(entry.data.questoes_reforco).find((x) => x.id === card.dataset.q);
  card.outerHTML = questionHtml(entry, q, +card.dataset.index);
  const p = $('progress');
  if (p) {
    // Keep the bar element so its fill animates from the current value
    const s = stats(entry);
    const fresh = document.createElement('div');
    fresh.innerHTML = progressHtml(entry);
    p.querySelector('.progress-text').textContent = fresh.querySelector('.progress-text').textContent;
    p.querySelector('.track i').style.setProperty('--p', s.total ? s.done / s.total : 0);
  }
  persist();
  renderSidebar();
}

/* ---------- Render: home ---------- */
// Everything here comes from the index plus saved answers, so no review file needs to be fetched
function themeStats(e) {
  const p = state.progress[e.id] || {};
  const s = { total: arr(e.itens).length, done: 0, right: 0, wrong: [], diff: {} };
  arr(e.itens).forEach((it, i) => {
    const a = p[it.id] || {};
    const d = s.diff[it.dificuldade] || (s.diff[it.dificuldade] = { total: 0, done: 0, right: 0 });
    d.total++;
    const ok = it.gabarito ? (a.choice ? a.choice === it.gabarito : null) : (a.self ? a.self === 'ok' : null);
    if (ok === null) return;
    s.done++; d.done++;
    if (ok) { s.right++; d.right++; } else s.wrong.push({ id: it.id, n: i + 1 });
  });
  return s;
}
const sum = (list, key) => list.reduce((n, x) => n + x[key], 0);
const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);
const stackBar = (right, wrong, total) => `<span class="stack" aria-hidden="true"><i class="ok" style="width:${total ? (right / total) * 100 : 0}%"></i><i class="no" style="width:${total ? (wrong / total) * 100 : 0}%"></i></span>`;
const CHEVRON = '<svg class="chev" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 1.5l5.5 5.5-5.5 5.5"/></svg>';
const HOME_ICON = icon('<path d="M4 11l8-7 8 7M6 9.5V20h4.5v-5.5h3V20H18V9.5"/>');
const PLUS_ICON = icon('<path d="M12 5.5v13M5.5 12h13"/>');
const DOWNLOAD_ICON = icon('<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>');

const tile = (value, label, sub, extra = '') => `<div class="card tile"><div class="tile-label">${label}</div><div class="tile-value">${value}</div><div class="tile-sub">${sub}</div>${extra}</div>`;
const totals = (themes) => ({ total: sum(themes.map((t) => t.s), 'total'), done: sum(themes.map((t) => t.s), 'done'), right: sum(themes.map((t) => t.s), 'right') });

// Every subject gets the same tile, whatever the number or the length of its themes
function subjectTile(subj, themes) {
  const { total, done, right } = totals(themes);
  return `
    <button class="card subject" style="--tint:${subj.color}" data-action="subject" data-key="${subj.key}">
      <span class="subject-top"><span class="glyph">${subj.icon}</span>${CHEVRON}</span>
      <span class="subject-name">${esc(subj.name)}</span>
      <span class="subject-sub">${plural(themes.length, 'tema', 'temas')} · ${plural(total, 'questão', 'questões')}</span>
      ${stackBar(right, done - right, total)}
      <span class="subject-sub">${done ? `${done} de ${total} feitas · ${pct(right, done)}% de acerto` : 'Nenhuma questão feita'}</span>
    </button>`;
}
function reviewHtml(themes) {
  const review = themes.filter((t) => t.s.wrong.length);
  return `
    <h3 class="section-title">Para rever</h3>
    <div class="card">
      ${review.length ? `<ul class="list">${review.map(({ e, s }) => `
        <li><div>
          <div class="review-title">${esc(e.titulo)}</div>
          <div class="q-foot" style="margin-top:0.45rem">${s.wrong.map((w) => `<button class="chip chip-dificil" data-action="review-q" data-id="${esc(e.id)}" data-q="${esc(w.id)}">Questão ${w.n}</button>`).join('')}</div>
        </div></li>`).join('')}</ul>` : '<div style="color:var(--text-2)">Nenhuma questão errada ou marcada para rever. Bom trabalho.</div>'}
    </div>`;
}

function renderSubject(subj) {
  const themes = state.lib.filter((e) => e.materia === subj).sort(byTitle).map((e) => ({ e, s: themeStats(e) }));
  const { total, done, right } = totals(themes);
  const finished = themes.filter((t) => t.s.total && t.s.done === t.s.total).length;
  return `
    <div class="bar"><div class="wrap">${topRow(subj)}</div></div>
    <div class="wrap home" style="--tint:${subj.color}">
      <div class="hero">
        <div class="eyebrow">Matéria</div>
        <h2 class="subject-title"><span class="glyph">${subj.icon}</span>${esc(subj.name)}</h2>
        <div class="meta">${plural(themes.length, 'tema', 'temas')} · ${plural(total, 'questão de reforço', 'questões de reforço')}</div>
      </div>
      <div class="tiles tiles-3">
        ${tile(done, 'Questões respondidas', `de ${total}`, stackBar(right, done - right, total))}
        ${tile(done ? `${pct(right, done)}%` : '–', 'Aproveitamento', done ? `${plural(right, 'acerto', 'acertos')} em ${done}` : 'Responda questões para medir')}
        ${tile(finished, 'Temas concluídos', `de ${themes.length}`)}
      </div>
      <h3 class="section-title">Temas</h3>
      <div class="theme-cards">
        ${themes.map(({ e, s }) => `
          <button class="card theme-card" data-action="open" data-id="${esc(e.id)}">
            <span class="theme-text">
              <span class="theme-title">${esc(e.titulo)}</span>
              <span class="theme-sub">${s.done ? `${s.done} de ${s.total} feitas · ${pct(s.right, s.done)}% de acerto` : plural(s.total, 'questão', 'questões')}</span>
              ${stackBar(s.right, s.done - s.right, s.total)}
            </span>
            ${s.total && s.done === s.total ? '<span class="chip chip-facil">Concluído</span>' : ''}
            ${CHEVRON}
          </button>`).join('')}
      </div>
      ${done ? reviewHtml(themes) : ''}
    </div>`;
}

function renderHome() {
  const themes = state.lib.map((e) => ({ e, s: themeStats(e) }));
  const total = sum(themes.map((t) => t.s), 'total');
  const done = sum(themes.map((t) => t.s), 'done');
  const right = sum(themes.map((t) => t.s), 'right');
  const started = themes.filter((t) => t.s.done).length;
  const finished = themes.filter((t) => t.s.total && t.s.done === t.s.total).length;

  const subjects = new Map();
  for (const t of themes) {
    const name = t.e.materia.name;
    if (!subjects.has(name)) subjects.set(name, []);
    subjects.get(name).push(t);
  }
  const names = [...subjects.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const last = themes.find((t) => t.e.id === store.get(LAST_KEY, null));
  const next = last && last.s.done < last.s.total ? last : themes.find((t) => t.s.done && t.s.done < t.s.total);

  const diff = {};
  for (const t of themes) for (const [k, d] of Object.entries(t.s.diff)) {
    const acc = diff[k] || (diff[k] = { total: 0, done: 0, right: 0 });
    acc.total += d.total; acc.done += d.done; acc.right += d.right;
  }


  return `
    <div class="bar"><div class="wrap">${topRow()}</div></div>
    <div class="wrap home">
      <div class="hero">
        <div class="eyebrow">ReVest</div>
        <h2>Sua revisão</h2>
        <div class="meta">${plural(themes.length, 'tema', 'temas')} em ${plural(names.length, 'matéria', 'matérias')} · ${plural(total, 'questão de reforço', 'questões de reforço')}</div>
      </div>

      <div class="tiles">
        ${tile(done, 'Questões respondidas', `de ${total}`, stackBar(right, done - right, total))}
        ${tile(done ? `${pct(right, done)}%` : '–', 'Aproveitamento', done ? `${plural(right, 'acerto', 'acertos')} em ${done}` : 'Responda questões para medir')}
        ${tile(started, 'Temas iniciados', `de ${themes.length}`)}
        ${tile(finished, 'Temas concluídos', `de ${themes.length}`)}
      </div>

      ${next ? `
        <h3 class="section-title">Continue de onde parou</h3>
        <button class="card resume" style="--tint:${next.e.materia.color}" data-action="open" data-id="${esc(next.e.id)}">
          <span class="glyph">${next.e.materia.icon}</span>
          <span class="resume-text">
            <span class="resume-title">${esc(next.e.titulo)}</span>
            <span class="resume-sub">${esc(next.e.materia.name)} · ${next.s.done} de ${next.s.total} questões feitas</span>
          </span>
          ${CHEVRON}
        </button>` : ''}

      <h3 class="section-title">Matérias</h3>
      <div class="subjects">
        ${names.map((name) => subjectTile(subject(name), subjects.get(name))).join('')}
      </div>

      ${done ? `
        <h3 class="section-title">Desempenho por dificuldade</h3>
        <div class="card">
          ${Object.keys(DIFF).filter((k) => diff[k]).map((k) => `
            <div class="diff-row">
              <span class="chip chip-${k}">${DIFF[k]}</span>
              ${stackBar(diff[k].right, diff[k].done - diff[k].right, diff[k].total)}
              <span class="diff-num">${diff[k].done ? `${pct(diff[k].right, diff[k].done)}% de acerto` : 'Nenhuma feita'}<small>${diff[k].done} de ${diff[k].total}</small></span>
            </div>`).join('')}
        </div>

        ${reviewHtml(themes)}` : ''}
    </div>`;
}

/* ---------- Render: guide to creating new reviews ---------- */
function renderGuide() {
  const code = (s) => `<code class="tex-raw">${esc(s)}</code>`;
  const items = (list, cls, mark) => `<div class="card"><ul class="list">${list.map((t, i) => `<li><span class="dot ${cls}">${mark ?? i + 1}</span><div>${t}</div></li>`).join('')}</ul></div>`;
  return `
    <div class="bar"><div class="wrap">${topRow(null, 'Novas revisões')}</div></div>
    <div class="wrap home guide">
      <div class="hero">
        <div class="eyebrow">Criar</div>
        <h2>Crie novas revisões</h2>
        <div class="meta">Cada tema do ReVest é um arquivo JSON gerado pelo Claude com a skill revisao-vestibular. Baixe a skill, peça um tema e publique o arquivo.</div>
      </div>

      <div class="card skill">
        <span class="glyph">${DOWNLOAD_ICON}</span>
        <span class="resume-text">
          <span class="resume-title">revisao-vestibular.skill</span>
          <span class="resume-sub">Skill para o Claude · 15 KB · instruções, formato do arquivo, exemplo e validador</span>
        </span>
        <a class="btn btn-primary" href="${SKILL_FILE}" download>Baixar skill</a>
      </div>

      <h3 class="section-title">O que a skill faz</h3>
      <div class="card"><p>Uma skill é um pacote de instruções que ensina o Claude a executar uma tarefa sempre do mesmo jeito. Esta recebe um tema do ensino médio, pesquisa na web e entrega um único arquivo JSON, no formato exato que esta página lê. O arquivo traz:</p></div>
      ${items([
        '<strong>Resumo prático</strong>: o tema em uma frase, pontos-chave, erros comuns, como a Unicamp cobra e, quando o tema tem equações, um formulário.',
        '<strong>Conceitos</strong>: de 5 a 10, cada um com explicação curta, exemplo e dica de prova.',
        '<strong>Questões de vestibular</strong>: até 10 questões reais, com Comvest/Unicamp em primeiro lugar e Fuvest, Unesp e ENEM para completar. O enunciado não é copiado: a skill descreve o que a questão cobra e guarda o link para a prova e para o gabarito.',
        '<strong>Questões de reforço</strong>: cerca de 10 questões inéditas no estilo da Comvest, de múltipla escolha e dissertativas, com gabarito e resolução passo a passo.',
        '<strong>Imagens</strong>: gráficos, mapas e diagramas de fontes abertas, com legenda, crédito e licença.',
      ], 'dot-key', '•')}

      <h3 class="section-title">Como usar</h3>
      ${items([
        `<strong>Baixe a skill</strong> pelo botão acima. O arquivo ${code('.skill')} é um ZIP comum com outra extensão.`,
        `<strong>Instale no Claude.</strong> No aplicativo ou em claude.ai, abra as configurações, vá até a área de skills e envie o arquivo. No Claude Code, extraia o conteúdo em ${code('~/.claude/skills/')}, de modo que exista a pasta ${code('~/.claude/skills/revisao-vestibular/')}.`,
        'Deixe a <strong>busca na web</strong> ligada: a skill confirma prova, ano e número de cada questão antes de indexá-la.',
        `<strong>Peça o tema</strong> em uma conversa nova, por exemplo: <em>“Revisão de eletroquímica para o vestibular”</em>. Não é preciso citar a skill; o Claude a aciona sozinho. Um tema por pedido, pois cada arquivo cobre um tema.`,
        `<strong>Receba o arquivo</strong>, com nome no padrão ${code('quimica-eletroquimica.json')}. O Claude valida o resultado e informa quantas questões reais conseguiu confirmar.`,
        `<strong>Publique.</strong> Coloque o arquivo em ${code('revisoes/<matéria>/')} no <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer">repositório do ReVest</a> (ou em uma cópia sua) e envie para a branch ${code('main')}. O site é atualizado sozinho e o tema aparece no menu, dentro da matéria.`,
      ], 'dot-key')}

      <h3 class="section-title">Antes de publicar</h3>
      ${items([
        'Leia o resumo e resolva algumas questões de reforço. O conteúdo é gerado por IA e pode conter erros, mesmo com a validação.',
        'Abra os links das questões de vestibular e confira se levam à prova certa.',
        `Para atualizar um tema que já existe, mantenha o nome do arquivo: o progresso de quem estuda fica salvo no navegador, associado a esse nome.`,
      ], 'dot-err', '!')}
    </div>`;
}

/* ---------- Formula sheet layout ---------- */
// A formula never scrolls sideways: its card grows to span 2 or 3 grid columns as needed,
// and only when even the full row is too narrow (phones) the formula is scaled down to fit.
function fitFormulas() {
  const grid = document.querySelector('.formulas');
  if (!grid) return;
  const cards = [...grid.children];
  for (const card of cards) { card.style.gridColumn = ''; const e = card.querySelector('.f-expr'); e.style.fontSize = ''; e.style.overflowX = ''; }
  const style = getComputedStyle(grid);
  const cols = style.gridTemplateColumns.split(' ').length;
  const gap = parseFloat(style.columnGap) || 0;
  const colWidth = (grid.clientWidth - gap * (cols - 1)) / cols;
  const plans = cards.map((card) => {
    const expr = card.querySelector('.f-expr');
    const pad = card.clientWidth - expr.clientWidth;
    // the widest piece that cannot wrap decides how much room the card needs
    const need = Math.max(0, ...[...expr.querySelectorAll('.katex')].map((k) => k.getBoundingClientRect().width));
    const span = Math.min(cols, Math.max(1, Math.ceil((need + pad + gap) / (colWidth + gap))));
    return { card, expr, need, span, room: span * colWidth + (span - 1) * gap - pad };
  });
  for (const { card, expr, need, span, room } of plans) {
    if (span > 1) card.style.gridColumn = `span ${span}`;
    if (need > room) expr.style.fontSize = `${Math.max(0.6, room / need) * parseFloat(getComputedStyle(expr).fontSize)}px`;
    if (room / need < 0.6) expr.style.overflowX = 'auto'; // last resort for a formula too long even at the smallest size
  }
}

function render() { renderSidebar(); renderMain(); }

/* ---------- Sheet, sidebar drawer, toast ---------- */
let sheetReturn = null;
function openSheet(html, wide = false) {
  const sheet = $('sheet');
  sheetReturn = document.activeElement;
  sheet.innerHTML = `<button class="sheet-close" data-action="dismiss" aria-label="Fechar">${X_ICON}</button>${html}`;
  sheet.classList.toggle('wide', wide);
  sheet.scrollTop = 0;
  sheet.classList.add('on');
  $('scrim').classList.add('on');
  sheet.focus({ preventScroll: true });
}
function closeSheet() {
  if (!$('sheet').classList.contains('on')) return;
  $('sheet').classList.remove('on');
  if (!$('sidebar').classList.contains('on')) $('scrim').classList.remove('on');
  sheetReturn?.isConnected && sheetReturn.focus({ preventScroll: true });
}

/* ---------- Focus mode: one concept per screen ---------- */
// The slides sit in a horizontal scroll-snap track, so swiping and sideways scrolling work natively;
// the buttons and the arrow keys only scroll that same track.
const focusOn = () => $('focus').classList.contains('on');
let focusIndex = 0, focusReturn = null;
function openFocus(start = 0) {
  const entry = current();
  const cs = arr(entry?.data.conceitos);
  if (!cs.length) return;
  const el = $('focus');
  focusReturn = document.activeElement;
  el.style.setProperty('--tint', state.lib.find((e) => e.id === entry.id).materia.color);
  el.innerHTML = `
    <header class="focus-head">
      <div class="focus-title"><strong id="focus-count" aria-live="polite"></strong><span>${esc(entry.data.tema.titulo)}</span></div>
      <button class="sheet-close" data-action="focus-close" aria-label="Sair do modo foco">${X_ICON}</button>
    </header>
    <div class="track"><i id="focus-bar"></i></div>
    <div class="focus-track" id="focus-track">
      ${cs.map((c, i) => `<div class="focus-slide" tabindex="-1">${conceptCard(entry.data, c, i).replace(/ id="[^"]*"/, '')}</div>`).join('')}
    </div>
    <footer class="focus-foot">
      <button class="btn btn-quiet prev" data-action="focus-step" data-step="-1">${CHEVRON}Anterior</button>
      <button class="btn btn-quiet next" data-action="focus-step" data-step="1">Próximo${CHEVRON}</button>
    </footer>`;
  const track = $('focus-track');
  track.addEventListener('scroll', () => {
    if (!track.isConnected || !track.clientWidth) return; // a late event from a track already replaced
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== focusIndex) setFocusIndex(i);
  }, { passive: true });
  el.classList.add('on');
  document.body.classList.add('focus-on');
  focusIndex = -1;
  track.scrollTo({ left: start * track.clientWidth, behavior: 'instant' });
  setFocusIndex(start);
}
function setFocusIndex(i) {
  const slides = $('focus-track').children;
  focusIndex = Math.max(0, Math.min(slides.length - 1, i));
  $('focus-count').textContent = `Conceito ${focusIndex + 1} de ${slides.length}`;
  $('focus-bar').style.setProperty('--p', (focusIndex + 1) / slides.length);
  $('focus').querySelector('.prev').disabled = focusIndex === 0;
  $('focus').querySelector('.next').disabled = focusIndex === slides.length - 1;
  // the visible slide holds the focus so the keyboard scrolls its text
  if (!$('sheet').classList.contains('on')) slides[focusIndex].focus({ preventScroll: true });
}
function stepFocus(step) {
  const track = $('focus-track');
  const i = Math.max(0, Math.min(track.children.length - 1, focusIndex + step));
  if (i === focusIndex) return;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  track.scrollTo({ left: i * track.clientWidth, behavior: calm ? 'instant' : 'smooth' });
}
function closeFocus() {
  if (!focusOn()) return;
  $('focus').classList.remove('on');
  document.body.classList.remove('focus-on');
  focusReturn?.isConnected && focusReturn.focus({ preventScroll: true });
}

const isNarrow = () => window.matchMedia('(max-width: 56rem)').matches;
// Narrow screens get a drawer over the page; wide ones push the page and remember the choice
function toggleSidebar() {
  if (isNarrow()) {
    if ($('sidebar').classList.contains('on')) closeSidebar();
    else { $('sidebar').classList.add('on'); $('scrim').classList.add('on'); }
  } else {
    store.set(NAV_KEY, !document.body.classList.toggle('nav-collapsed'));
  }
}
function closeSidebar() {
  $('sidebar').classList.remove('on');
  if (!$('sheet').classList.contains('on')) $('scrim').classList.remove('on');
}

let toastTimer = 0, toastAction = null;
function toast(message, actionLabel, action) {
  const el = $('toast');
  toastAction = action || null;
  el.innerHTML = `<span>${esc(message)}</span>${actionLabel ? `<button data-action="toast-action">${esc(actionLabel)}</button>` : ''}`;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('on'); toastAction = null; }, action ? 6000 : 3500);
}

/* ---------- Events ---------- */
const ACTIONS = {
  open: (el) => select(el.dataset.id),
  home: () => { closeSidebar(); if (routeId()) location.hash = '#/'; },
  'review-q'(el) { state.pendingQ = el.dataset.q; select(el.dataset.id); },
  guide: () => { closeSidebar(); location.hash = `#/${GUIDE_ROUTE}`; },
  menu: toggleSidebar,
  group(el) {
    const key = el.dataset.key;
    const open = el.getAttribute('aria-expanded') !== 'true';
    el.setAttribute('aria-expanded', open);
    state.openGroups = state.openGroups.filter((k) => k !== key).concat(open ? [key] : []);
    store.set(GROUPS_KEY, state.openGroups);
  },
  subject(el) { closeSidebar(); location.hash = `#/@${el.dataset.key}`; },
  dismiss: () => { closeSheet(); closeSidebar(); },
  'toast-action': () => { toastAction?.(); toastAction = null; $('toast').classList.remove('on'); },
  tab(el) {
    setTab(el.dataset.tab);
    const top = $('view').getBoundingClientRect().top + window.scrollY - document.querySelector('.bar').offsetHeight;
    if (window.scrollY > top) window.scrollTo(0, top);
  },
  filter(el) { state.filter = el.dataset.filter; renderView(); },
  answer(el) {
    const card = el.closest('.q');
    progOf(state.currentId)[card.dataset.q] = { choice: el.dataset.letter };
    refreshQuestion(card);
  },
  reveal(el) {
    const card = el.closest('.q');
    progOf(state.currentId)[card.dataset.q] = { revealed: true };
    refreshQuestion(card);
  },
  self(el) {
    const card = el.closest('.q');
    progOf(state.currentId)[card.dataset.q] = { revealed: true, self: el.dataset.self };
    refreshQuestion(card);
  },
  retry(el) {
    const card = el.closest('.q');
    delete progOf(state.currentId)[card.dataset.q];
    refreshQuestion(card);
  },
  reset() {
    const id = state.currentId, before = state.progress[id];
    if (!before || !Object.keys(before).length) return;
    delete state.progress[id];
    persist(); renderView(); renderSidebar();
    toast('Respostas apagadas', 'Desfazer', () => { state.progress[id] = before; persist(); renderView(); renderSidebar(); });
  },
  inst(el) { state.inst = el.dataset.inst; renderView(); },
  play: () => openFocus(0),
  'focus-close': closeFocus,
  'focus-step': (el) => stepFocus(+el.dataset.step),
  concept(el) {
    const c = byId(current().data.conceitos, el.dataset.concept);
    if (c) openSheet(conceptBody(current().data, c));
  },
  ref(el) {
    const r = byId(refsOf(current().data), el.dataset.ref);
    if (r) openSheet(refBody(current().data, r));
  },
  zoom(el) {
    const img = byId(current().data.imagens, el.dataset.img);
    if (!img) return;
    openSheet(`
      <h3 id="sheet-title">${esc(cap(img.tipo || 'Figura'))}</h3>
      <img class="zoom-img" src="${esc(img.url)}" alt="${esc(img.alt)}">
      ${img.legenda ? `<div class="rich">${rich(img.legenda)}</div>` : ''}
      <small class="zoom-credit">${figureCredit(img)}</small>`, true);
  },
  // Jump from a concept or exam question to one of the practice questions
  'goto-q'(el) {
    const id = el.dataset.q;
    closeSheet();
    closeFocus();
    state.filter = 'todas';
    if (state.tab === 'questoes') renderView(); else setTab('questoes');
    document.getElementById(`q-${id}`)?.scrollIntoView({ block: 'start' });
  },
};

function setTab(tab) {
  if (state.tab === tab) return;
  state.tab = tab;
  const seg = $('seg');
  seg.style.setProperty('--i', TABS.findIndex((t) => t[0] === tab));
  seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
  renderView();
}

// A figure whose URL fails gives way to a short note; the source link in the caption still works
document.addEventListener('error', (e) => {
  if (e.target instanceof HTMLImageElement) e.target.closest('.fig')?.classList.add('is-broken');
}, true);

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el);
});
document.addEventListener('keydown', (e) => {
  const sheetOpen = $('sheet').classList.contains('on');
  if (e.key === 'Escape') { if (focusOn() && !sheetOpen) closeFocus(); else ACTIONS.dismiss(); }
  else if (focusOn() && !sheetOpen && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    e.preventDefault();
    stepFocus(e.key === 'ArrowRight' ? 1 : -1);
  }
});
$('search').addEventListener('input', (e) => { state.query = e.target.value; renderSidebar(); });
window.addEventListener('hashchange', route);

// Refit the formula sheet whenever the reading column changes width, and once the math fonts arrive
let fitWidth = 0;
new ResizeObserver(([entry]) => {
  const width = Math.round(entry.contentRect.width);
  if (width !== fitWidth) { fitWidth = width; fitFormulas(); }
}).observe($('main'));
window.addEventListener('resize', fitFormulas);
// the track is measured in slide widths, so a resize has to put the current slide back in place
window.addEventListener('resize', () => { if (focusOn()) $('focus-track').scrollTo({ left: focusIndex * $('focus-track').clientWidth, behavior: 'instant' }); });
document.fonts?.addEventListener('loadingdone', fitFormulas);

/* ---------- Boot ---------- */
async function boot() {
  state.progress = store.get(PROG_KEY, {});
  state.openGroups = arr(store.get(GROUPS_KEY, []));
  document.body.classList.toggle('nav-collapsed', store.get(NAV_KEY, true) === false);
  try {
    const index = await getJson(`${DATA_DIR}index.json`);
    state.lib = arr(index.revisoes).filter((e) => e && e.arquivo && e.titulo).map((e) => ({ ...e, id: e.arquivo.replace(/\.json$/i, ''), materia: subject(e.disciplina) }));
  } catch {
    state.error = location.protocol === 'file:'
      ? ['Abra o ReVest por um servidor', 'Aberta direto do disco, a página não consegue ler a pasta de revisões. Rode "node scripts/servir.mjs" na pasta do projeto e acesse o endereço indicado.']
      : ['Não foi possível carregar as revisões', 'O índice revisoes/index.json não foi encontrado. Gere-o com "node scripts/gerar-indice.mjs".'];
    render();
    return;
  }
  route();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
