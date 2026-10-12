(() => {
'use strict';

const PROG_KEY = 'revest:progress';
const DATA_DIR = 'revisoes/';

const icon = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
// Each subject is matched against the normalized "disciplina" of a review; the first match wins.
const SUBJECTS = [
  { keys: ['matematica'], color: '#0071e3', icon: icon('<path d="M5 7.5h5M7.5 5v5M14.5 7.5h5M5.7 15.2l3.6 3.6M9.3 15.2l-3.6 3.6M14.5 17h5M17 14.3v.01M17 19.7v.01"/>') },
  { keys: ['fisica'], color: '#f56300', icon: icon('<circle cx="12" cy="12" r="1.3" fill="currentColor"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)"/>') },
  { keys: ['quimica'], color: '#ae3ec9', icon: icon('<path d="M9 3h6M10 3v6.2L4.9 18.1A1.9 1.9 0 0 0 6.6 21h10.8a1.9 1.9 0 0 0 1.7-2.9L14 9.2V3M7.6 14.5h8.8"/>') },
  { keys: ['biologia'], color: '#248a3d', icon: icon('<path d="M20 4C10.5 4 5 9 5 16.5c0 1 .2 2.3 .2 2.3s1.3 .2 2.3 .2C15 19 20 13.5 20 4zM4 20l9-9"/>') },
  { keys: ['historia'], color: '#a2632a', icon: icon('<path d="M3 9l9-5 9 5M4.5 9h15M6.5 9v8M10.3 9v8M13.7 9v8M17.5 9v8M4.5 17h15M3 20h18"/>') },
  { keys: ['geografia'], color: '#0c8599', icon: icon('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>') },
  { keys: ['literatura'], color: '#c92a2a', icon: icon('<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>') },
  { keys: ['redacao'], color: '#b08900', icon: icon('<path d="M4 20l1-4.5L16.5 4a2.1 2.1 0 0 1 3 3L8 18.5 4 20zM14.5 6l3.5 3.5"/>') },
  { keys: ['ingles'], color: '#3b5bdb', icon: icon('<path d="M4 5h16v11.5h-8.5L7 20v-3.5H4zM8 9.3h8M8 12.5h5"/>') },
  { keys: ['portugues', 'gramatica', 'linguagens'], color: '#d6336c', icon: icon('<path d="M3.5 18L8.5 6h1l5 12M5.4 14h7.2M20.5 18v-5.5a2.5 2.5 0 0 0-5 0v3a2.5 2.5 0 0 0 5 0"/>') },
  { keys: ['filosofia'], color: '#6741d9', icon: icon('<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.6 .5 1 1.3 1.1 2.2h5c.1-.9 .5-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>') },
  { keys: ['sociologia'], color: '#5c940d', icon: icon('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.2" cy="9" r="2.3"/><path d="M16.5 14.2c2.6 .4 4.5 2.7 4.5 5.8"/>') },
];
const OTHER = { color: '#6e6e73', icon: icon('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>') };
const DIFF = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };
const TABS = [['resumo', 'Resumo'], ['conceitos', 'Conceitos'], ['questoes', 'Questões'], ['referencias', 'Provas']];
const X_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 2l8 8M10 2l-8 8"/></svg>';
const EXT_ICON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 2.5H2.5v7h7v-2M7 2h3v3M10 2L5.5 6.5"/></svg>';

const $ = (id) => document.getElementById(id);
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
};

const state = {
  lib: [],          // index entries: { id, arquivo, titulo, disciplina, gerado_em, questoes }
  current: null,    // { id, data } of the open review
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
  const entry = state.lib.find((e) => e.id === wanted) || state.lib[0] || null;
  state.currentId = entry?.id || null;
  state.error = null;
  renderSidebar();
  if (!entry) { state.current = null; renderMain(); return; }
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
  renderMain();
  window.scrollTo(0, 0);
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
function renderSidebar() {
  const q = norm(state.query);
  const shown = state.lib.filter((e) => !q || norm(`${e.titulo} ${e.disciplina}`).includes(q));
  const groups = new Map();
  for (const e of shown) {
    const d = e.disciplina || 'Outras';
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d).push(e);
  }
  const names = [...groups.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  $('lib-count').textContent = state.lib.length ? plural(state.lib.length, 'tema de revisão', 'temas de revisão') : 'Revisões de vestibular';
  $('search').hidden = state.lib.length < 2;
  $('lib').innerHTML = names.map((name) => {
    const subj = subject(name);
    return `
    <div class="group-label">${esc(name)}</div>
    ${groups.get(name).sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR')).map((e) => {
      const done = Math.min(doneCount(e.id), e.questoes || 0);
      const sub = e.questoes ? (done ? `${done} de ${e.questoes} questões feitas` : plural(e.questoes, 'questão', 'questões')) : fmtDate(e.gerado_em);
      return `
      <button class="item" style="--tint:${subj.color}" data-action="open" data-id="${esc(e.id)}" aria-current="${e.id === state.currentId}">
        <span class="glyph">${subj.icon}</span>
        <span class="item-text">
          <span class="item-title">${esc(e.titulo)}</span>
          <span class="item-sub">${esc(sub)}</span>
        </span>
      </button>`;
    }).join('')}`;
  }).join('') || (state.lib.length ? '<div class="group-label">Nada encontrado</div>' : '');
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
    main.innerHTML = message(...(state.error || ['Nenhuma revisão publicada ainda', 'Assim que um tema for adicionado à pasta de revisões, ele aparece aqui.']));
    return;
  }
  const { tema } = entry.data;
  const meta = [entry.data.gerado_em && `Gerado em ${fmtDate(entry.data.gerado_em)}`].filter(Boolean).join(' · ');
  const subj = subject(tema.disciplina);
  main.style.setProperty('--tint', subj.color);
  main.innerHTML = `
    <div class="wrap hero">
      <div class="eyebrow">${subj.icon}${esc(tema.disciplina || 'Revisão')}</div>
      <h2>${esc(tema.titulo)}</h2>
      ${meta ? `<div class="meta">${esc(meta)}</div>` : ''}
      ${arr(tema.subtopicos).length ? `<div class="chips">${tema.subtopicos.map((s) => `<span class="chip">${rich(s)}</span>`).join('')}</div>` : ''}
    </div>
    <div id="bar-anchor"></div>
    <div class="bar"><div class="wrap bar-in">
      <button class="menu-btn" data-action="menu" aria-label="Abrir biblioteca">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/></svg>
      </button>
      <div class="seg" id="seg" role="tablist" style="--n:${TABS.length};--i:${TABS.findIndex((t) => t[0] === state.tab)}">
        <span class="seg-thumb" aria-hidden="true"></span>
        ${TABS.map(([key, label]) => `<button role="tab" data-action="tab" data-tab="${key}" aria-selected="${key === state.tab}">${label}</button>`).join('')}
      </div>
    </div></div>
    <div class="wrap"><div class="view" id="view" role="tabpanel"></div></div>`;
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
    return cs.map((c, i) => `<article class="card concept" id="c-${esc(c.id)}"><div class="num">Conceito ${i + 1}</div>${conceptBody(entry.data, c)}</article>`).join('');
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
function openSidebar() { $('sidebar').classList.add('on'); $('scrim').classList.add('on'); }
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
  menu: openSidebar,
  dismiss: () => { closeSheet(); closeSidebar(); },
  'toast-action': () => { toastAction?.(); toastAction = null; $('toast').classList.remove('on'); },
  tab(el) {
    setTab(el.dataset.tab);
    const top = $('bar-anchor').getBoundingClientRect().top + window.scrollY;
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
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') ACTIONS.dismiss(); });
$('search').addEventListener('input', (e) => { state.query = e.target.value; renderSidebar(); });
window.addEventListener('hashchange', route);

/* ---------- Boot ---------- */
async function boot() {
  state.progress = store.get(PROG_KEY, {});
  try {
    const index = await getJson(`${DATA_DIR}index.json`);
    state.lib = arr(index.revisoes).filter((e) => e && e.arquivo && e.titulo).map((e) => ({ ...e, id: e.arquivo.replace(/\.json$/i, '') }));
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
