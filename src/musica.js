// Trilhas originais sintetizadas na hora, uma por mundo. Nada de arquivo de áudio.
// Cada trilha: andamento (bpm), escala, sequência de acordes e um "jeito" de tocar.
import { contexto, estaMudo, quandoMudarSom } from './som.js';
import { aleatorio } from './estilo3d.js';

const MAIOR = [0, 2, 4, 5, 7, 9, 11];
const MENOR = [0, 2, 3, 5, 7, 8, 10];
const PENTA = [0, 2, 4, 7, 9];

// Estilos: 'funkpop' (groove dançante de baixo, guitarrinha e metais), 'house' e 'eletronica' (batida reta),
// 'louvor' (banda da igreja), 'natal', 'tensa' e 'romantica'. Tudo composto aqui, nada copiado.
const TRILHAS = {
  menu:      { bpm: 112, raiz: 57, escala: MENOR, acordes: [0, 3, 5, 4], estilo: 'funkpop', lead: 'square', semente: 11 },
  familia:   { bpm: 114, raiz: 60, escala: MAIOR, acordes: [0, 4, 5, 3], estilo: 'funkpop', lead: 'square', semente: 2 },
  igreja:    { bpm: 92, raiz: 55, escala: MAIOR, acordes: [0, 4, 5, 3, 0, 4, 3, 4], estilo: 'louvor', lead: 'triangle', semente: 3 },
  natal:     { bpm: 120, raiz: 62, escala: MAIOR, acordes: [0, 3, 4, 0, 5, 1, 4, 0], estilo: 'natal', lead: 'sine', semente: 9 },
  atelie:    { bpm: 120, raiz: 62, escala: MAIOR, acordes: [0, 5, 1, 4], estilo: 'house', lead: 'triangle', semente: 4 },
  rodizio:   { bpm: 116, raiz: 62, escala: PENTA, acordes: [0, 3, 0, 4], estilo: 'funkpop', lead: 'triangle', semente: 5 },
  fitdance:  { bpm: 128, raiz: 57, escala: MENOR, acordes: [0, 5, 2, 6], estilo: 'eletronica', lead: 'sawtooth', semente: 6 },
  loja:      { bpm: 132, raiz: 52, escala: MENOR, acordes: [0, 0, 5, 4], estilo: 'tensa', lead: 'square', semente: 7 },
  ferias:    { bpm: 112, raiz: 60, escala: PENTA, acordes: [0, 3, 4, 0], estilo: 'house', lead: 'triangle', semente: 12 },
  casamento: { bpm: 76, raiz: 60, escala: MAIOR, acordes: [0, 4, 5, 3, 0, 3, 4, 4], estilo: 'romantica', lead: 'sine', semente: 8 },
};

const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

let atual = null;
let mestre = null;
let relogio = null;

function nota(c, destino, { t, midi, dur, tipo = 'triangle', vol = 0.2, ataque = 0.01, filtro = null }) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipo;
  o.frequency.value = freq(midi);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  let saida = o.connect(g);
  if (filtro) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filtro; saida = g.connect(f); }
  saida.connect(destino);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Três serras levemente desafinadas: o "som gordo" de música eletrônica.
function supersaw(c, destino, { t, midi, dur, vol = 0.03, filtro = 2600, ataque = 0.01 }) {
  for (const d of [-9, 0, 9]) {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq(midi);
    o.detune.value = d;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filtro;
    o.connect(g).connect(f).connect(destino);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

function bateria(c, destino, t, tipo, vol = 0.5) {
  if (tipo === 'bumbo') {
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(destino);
    o.start(t); o.stop(t + 0.2);
    return;
  }
  const dur = tipo === 'caixa' || tipo === 'palma' ? 0.14 : tipo === 'aberto' ? 0.16 : 0.04;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const f = c.createBufferSource();
  f.buffer = buf;
  const filtro = c.createBiquadFilter();
  filtro.type = tipo === 'caixa' || tipo === 'palma' ? 'bandpass' : 'highpass';
  filtro.frequency.value = tipo === 'caixa' ? 1800 : tipo === 'palma' ? 1200 : 7000;
  const g = c.createGain();
  g.gain.value = vol * (tipo === 'caixa' || tipo === 'palma' ? 0.6 : 0.25);
  f.connect(filtro).connect(g).connect(destino);
  f.start(t);
}

// Gera uma melodia fixa (mesma semente = mesma música) que respeita os acordes.
function compor(tr) {
  const rnd = aleatorio(tr.semente * 977);
  const passosPorCompasso = tr.estilo === 'romantica' ? 12 : 16;
  const melodia = [];
  let grau = 0;
  for (let compasso = 0; compasso < tr.acordes.length; compasso++) {
    for (let p = 0; p < passosPorCompasso; p++) {
      const forte = p % 4 === 0;
      const toca = forte ? rnd() < 0.85 : rnd() < (tr.estilo === 'orgao' || tr.estilo === 'romantica' ? 0.1 : 0.35);
      if (!toca) { melodia.push(null); continue; }
      if (forte) grau = tr.acordes[compasso] + [0, 2, 4][Math.floor(rnd() * 3)];
      else grau += [-1, 1, 1, -2, 2][Math.floor(rnd() * 5)];
      melodia.push(grau);
    }
  }
  return { melodia, passosPorCompasso };
}

function grauParaMidi(tr, grau, oitava = 0) {
  const n = tr.escala.length;
  const o = Math.floor(grau / n);
  return tr.raiz + tr.escala[((grau % n) + n) % n] + 12 * (o + oitava);
}

function agendarPasso(c, tr, comp, passo, t) {
  const total = comp.melodia.length;
  const i = passo % total;
  const ppc = comp.passosPorCompasso;
  const compasso = Math.floor(i / ppc);
  const p = i % ppc;
  const dur16 = 60 / tr.bpm / 4;
  const acorde = tr.acordes[compasso];
  const m = mestre;

  const volta = Math.floor(passo / total); // a cada volta da música, a batida fica mais cheia
  switch (tr.estilo) {
    case 'eletronica': // EDM: bumbo reto, chimbal aberto no contratempo, acordes "gordos"
      if (p % 4 === 0) bateria(c, m, t, 'bumbo', 0.75);
      if (p % 4 === 2) bateria(c, m, t, 'aberto', 0.9);
      if (p % 2 === 1) bateria(c, m, t, 'chimbal', 0.4);
      if (p === 4 || p === 12) bateria(c, m, t, 'palma', 0.7);
      if (p % 4 === 2) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 1.6, tipo: 'sawtooth', vol: 0.12, filtro: 600 });
      if (p % 4 === 2 || (volta % 2 && p % 4 === 3)) for (const k of [0, 2, 4]) supersaw(c, m, { t, midi: grauParaMidi(tr, acorde + k, 0), dur: dur16 * 1.4, vol: 0.016, filtro: 3200 });
      break;
    case 'house': // house: batida reta, órgão em acordes no contratempo, baixo saltitante
      if (p % 4 === 0) bateria(c, m, t, 'bumbo', 0.65);
      if (p % 4 === 2) bateria(c, m, t, 'aberto', 0.7);
      if (p === 4 || p === 12) bateria(c, m, t, 'palma', 0.55);
      if ([2, 6, 10, 14, 15].includes(p)) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2) + (p === 15 ? 12 : 0), dur: dur16 * 1.2, tipo: 'triangle', vol: 0.17 });
      if ([3, 6, 11].includes(p)) for (const k of [0, 2, 4, 6]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 1.3, tipo: 'square', vol: 0.018, filtro: 1500 });
      break;
    case 'funkpop': // groove dançante: baixo sincopado, guitarrinha abafada e metais
      if (p === 0 || p === 7 || p === 10) bateria(c, m, t, 'bumbo', 0.6);
      if (p === 4 || p === 12) { bateria(c, m, t, 'caixa', 0.55); bateria(c, m, t, 'palma', 0.35); }
      bateria(c, m, t, 'chimbal', p % 4 === 2 ? 0.55 : 0.3);
      if ([0, 3, 6, 8, 10, 11, 14].includes(p)) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2) + ([6, 11].includes(p) ? 12 : 0), dur: dur16 * 0.9, tipo: 'square', vol: 0.09, filtro: 900 });
      if (p % 2 === 1) nota(c, m, { t, midi: grauParaMidi(tr, acorde + [2, 4][(p >> 1) % 2], 0), dur: dur16 * 0.5, tipo: 'sawtooth', vol: 0.02, filtro: 2200 });
      if (p === 6 || p === 14 || (volta % 2 && p === 15)) for (const k of [0, 2, 4]) supersaw(c, m, { t, midi: grauParaMidi(tr, acorde + k, 0), dur: dur16 * 1.2, vol: 0.02, filtro: 2800 });
      break;
    case 'orgao':
      if (p === 0) for (const k of [0, 2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 15, tipo: 'sine', vol: 0.07, ataque: 0.15 });
      if (p === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 15, tipo: 'triangle', vol: 0.12, ataque: 0.1 });
      if (p % 4 === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde + [0, 2, 4, 2][p / 4], 1), dur: dur16 * 3, tipo: 'sine', vol: 0.05 });
      break;
    case 'louvor': // banda: bateria, baixo, teclado em acordes e guitarra suave
      if (p === 0 || p === 8 || p === 10) bateria(c, m, t, 'bumbo', 0.55);
      if (p === 4 || p === 12) bateria(c, m, t, 'caixa', 0.5);
      if (p % 2 === 0) bateria(c, m, t, 'chimbal', 0.45);
      if (p % 4 === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 3.5, tipo: 'triangle', vol: 0.17 });
      if (p === 0 || p === 8) for (const k of [0, 2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 7, tipo: 'sine', vol: 0.06, ataque: 0.04 });
      if (p % 2 === 1) nota(c, m, { t, midi: grauParaMidi(tr, acorde + [0, 2, 4, 2][(p >> 1) % 4], 0), dur: dur16 * 1.5, tipo: 'square', vol: 0.018, filtro: 1600 });
      break;
    case 'natal': // sininhos sobre batida eletrônica leve
      if (p % 4 === 0) bateria(c, m, t, 'bumbo', 0.5);
      if (p % 4 === 2) bateria(c, m, t, 'aberto', 0.5);
      if (p % 4 === 2) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 1.5, tipo: 'triangle', vol: 0.15 });
      if (p === 4 || p === 12) bateria(c, m, t, 'palma', 0.4);
      if (p % 4 === 2) for (const k of [0, 2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, 1), dur: dur16 * 2.5, tipo: 'sine', vol: 0.025 });
      break;
    case 'romantica':
      if (p === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 11, tipo: 'triangle', vol: 0.14, ataque: 0.05 });
      if (p === 4 || p === 8) for (const k of [2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 3, tipo: 'sine', vol: 0.06 });
      break;
    case 'tensa': // techno apressado (a pressão da meta!)
      if (p % 4 === 0) bateria(c, m, t, 'bumbo', 0.7);
      if (p === 4 || p === 12) bateria(c, m, t, 'palma', 0.6);
      if (p % 2 === 1) bateria(c, m, t, 'chimbal', 0.6);
      if (p % 4 === 2) supersaw(c, m, { t, midi: grauParaMidi(tr, acorde + 2, -1), dur: dur16, vol: 0.015, filtro: 1800 });
      if (p % 2 === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2) + (p % 8 === 6 ? 1 : 0), dur: dur16, tipo: 'square', vol: 0.07, filtro: 900 });
      break;
    case 'lofi':
      if (p === 0 || p === 10) bateria(c, m, t, 'bumbo', 0.4);
      if (p === 4 || p === 12) bateria(c, m, t, 'caixa', 0.3);
      if (p % 2 === 0) bateria(c, m, t, 'chimbal', 0.3);
      if (p === 0) for (const k of [0, 2, 4, 6]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 14, tipo: 'triangle', vol: 0.035, ataque: 0.05, filtro: 1200 });
      if (p === 0 || p === 8) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 6, tipo: 'sine', vol: 0.18 });
      break;
    default: // pop
      if (p % 8 === 0) bateria(c, m, t, 'bumbo', 0.55);
      if (p === 4 || p === 12) bateria(c, m, t, 'caixa', 0.45);
      if (p % 2 === 0) bateria(c, m, t, 'chimbal', 0.5);
      if ([0, 3, 6, 8, 11, 14].includes(p)) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 2, tipo: 'triangle', vol: 0.16 });
      if (p % 4 === 2) for (const k of [0, 2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 1.5, tipo: 'square', vol: 0.025, filtro: 1800 });
  }
  const g = comp.melodia[i];
  if (g !== null) {
    const longa = tr.estilo === 'orgao' || tr.estilo === 'romantica';
    nota(c, m, { t, midi: grauParaMidi(tr, g, 0), dur: dur16 * (longa ? 3.5 : 1.8), tipo: tr.lead, vol: tr.lead === 'sawtooth' || tr.lead === 'square' ? 0.045 : 0.09, filtro: tr.lead === 'sawtooth' ? 3000 : null });
  }
}

export function tocarMusica(nome) {
  if (usandoMinhas()) { pararMusica(); atual = { nome, tr: TRILHAS[nome] ?? TRILHAS.menu, passo: 0, proximo: 0 }; atual.comp = compor(atual.tr); tocarLista(); return; }
  if (atual?.nome === nome) { if (!relogio && !estaMudo()) iniciar(); return; }
  pararMusica();
  const tr = TRILHAS[nome] ?? TRILHAS.menu;
  atual = { nome, tr, comp: compor(tr), passo: 0, proximo: 0 };
  if (estaMudo()) return;
  iniciar();
}

function iniciar() {
  if (!atual || relogio || usandoMinhas()) return;
  let c;
  try { c = contexto(); } catch { return; }
  mestre = c.createGain();
  mestre.gain.value = 0.55;
  mestre.connect(c.destination);
  atual.proximo = c.currentTime + 0.1;
  relogio = setInterval(() => {
    if (c.state !== 'running') return;
    const dur16 = 60 / atual.tr.bpm / 4;
    while (atual.proximo < c.currentTime + 0.15) {
      agendarPasso(c, atual.tr, atual.comp, atual.passo, atual.proximo);
      atual.passo++;
      atual.proximo += dur16;
    }
  }, 30);
}

export function pararMusica() {
  clearInterval(relogio);
  relogio = null;
  if (mestre) { const m = mestre; try { m.gain.setTargetAtTime(0, m.context.currentTime, 0.05); setTimeout(() => m.disconnect(), 300); } catch {} }
  mestre = null;
}

quandoMudarSom((mudo) => {
  player.muted = mudo;
  if (mudo) pararMusica(); else if (usandoMinhas()) tocarLista(); else iniciar();
});

// ---------- Minhas músicas ----------
// A Bia escolhe arquivos de música do próprio aparelho. Eles ficam guardados só no navegador dela
// (IndexedDB) e tocam em sequência, embaralhados, no lugar da trilha do jogo.

const player = new Audio();
player.volume = 0.7;
player.muted = estaMudo();
let lista = [];
let posicao = 0;
let modo = 'jogo';
try { modo = localStorage.getItem('bia-musica-modo') ?? 'jogo'; } catch {}
const ouvintes = new Set();
export function aoMudarMinhasMusicas(fn) { ouvintes.add(fn); }
function avisar() { for (const fn of ouvintes) fn(estadoMinhasMusicas()); }

function usandoMinhas() { return modo === 'minhas' && lista.length > 0; }

export function estadoMinhasMusicas() {
  return { modo, quantidade: lista.length, tocando: usandoMinhas() ? lista[posicao]?.nome ?? '' : '' };
}

function banco() {
  return new Promise((ok, erro) => {
    const r = indexedDB.open('bia-musicas', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('musicas', { keyPath: 'id', autoIncrement: true });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => erro(r.error);
  });
}

async function operacao(tipo, fn) {
  const db = await banco();
  return new Promise((ok, erro) => {
    const tx = db.transaction('musicas', tipo);
    const pedido = fn(tx.objectStore('musicas'));
    tx.oncomplete = () => ok(pedido?.result);
    tx.onerror = () => erro(tx.error);
  });
}

function embaralhar(v) {
  for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; }
  return v;
}

export async function carregarMinhasMusicas() {
  try {
    const itens = await operacao('readonly', (loja) => loja.getAll());
    for (const m of lista) URL.revokeObjectURL(m.url);
    lista = embaralhar((itens ?? []).map((m) => ({ nome: m.nome, url: URL.createObjectURL(m.arquivo) })));
    posicao = 0;
  } catch { lista = []; }
  avisar();
}

export async function adicionarMinhasMusicas(arquivos) {
  for (const arquivo of arquivos) {
    if (!arquivo.type.startsWith('audio/') && !/\.(mp3|m4a|aac|ogg|wav|opus|flac)$/i.test(arquivo.name)) continue;
    const nome = arquivo.name.replace(/\.[^.]+$/, '');
    await operacao('readwrite', (loja) => loja.add({ nome, arquivo }));
  }
  await carregarMinhasMusicas();
}

export async function apagarMinhasMusicas() {
  try { await operacao('readwrite', (loja) => loja.clear()); } catch {}
  player.pause();
  await carregarMinhasMusicas();
  if (atual) { const nome = atual.nome; atual = null; tocarMusica(nome); }
}

export function escolherModoMusica(novo) {
  modo = novo;
  try { localStorage.setItem('bia-musica-modo', modo); } catch {}
  const nome = atual?.nome ?? 'menu';
  if (usandoMinhas()) { pararMusica(); tocarLista(); }
  else { player.pause(); atual = null; tocarMusica(nome); }
  avisar();
}

function tocarLista() {
  if (!usandoMinhas() || estaMudo()) return;
  if (!player.src || player.ended || player.src !== lista[posicao].url) player.src = lista[posicao].url;
  player.play().catch(() => {});
  avisar();
}

export function proximaMusica() {
  if (!usandoMinhas()) return;
  posicao = (posicao + 1) % lista.length;
  player.src = lista[posicao].url;
  tocarLista();
}

player.addEventListener('ended', proximaMusica);
// O navegador só deixa tocar depois de um toque/tecla: tenta de novo no primeiro gesto.
for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { if (usandoMinhas() && player.paused && !estaMudo()) tocarLista(); });
