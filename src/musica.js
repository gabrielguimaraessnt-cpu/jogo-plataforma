// Trilhas originais sintetizadas na hora, uma por mundo. Nada de arquivo de áudio.
// Cada trilha: andamento (bpm), escala, sequência de acordes e um "jeito" de tocar.
import { contexto, estaMudo, quandoMudarSom } from './som.js';
import { aleatorio } from './estilo3d.js';

const MAIOR = [0, 2, 4, 5, 7, 9, 11];
const MENOR = [0, 2, 3, 5, 7, 8, 10];
const PENTA = [0, 2, 4, 7, 9];

const TRILHAS = {
  menu:      { bpm: 100, raiz: 57, escala: MAIOR, acordes: [0, 5, 3, 4], estilo: 'pop', lead: 'triangle', semente: 1 },
  familia:   { bpm: 116, raiz: 60, escala: MAIOR, acordes: [0, 4, 5, 3], estilo: 'pop', lead: 'square', semente: 2 },
  igreja:    { bpm: 84, raiz: 55, escala: MAIOR, acordes: [0, 3, 4, 0, 5, 3, 1, 4], estilo: 'orgao', lead: 'sine', semente: 3 },
  atelie:    { bpm: 92, raiz: 62, escala: MAIOR, acordes: [0, 5, 1, 4], estilo: 'lofi', lead: 'triangle', semente: 4 },
  rodizio:   { bpm: 120, raiz: 62, escala: PENTA, acordes: [0, 3, 0, 4], estilo: 'pop', lead: 'triangle', semente: 5 },
  fitdance:  { bpm: 128, raiz: 57, escala: MENOR, acordes: [0, 5, 2, 6], estilo: 'eletronica', lead: 'sawtooth', semente: 6 },
  loja:      { bpm: 138, raiz: 52, escala: MENOR, acordes: [0, 0, 5, 4], estilo: 'tensa', lead: 'square', semente: 7 },
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
  const dur = tipo === 'caixa' ? 0.14 : 0.04;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const f = c.createBufferSource();
  f.buffer = buf;
  const filtro = c.createBiquadFilter();
  filtro.type = tipo === 'caixa' ? 'bandpass' : 'highpass';
  filtro.frequency.value = tipo === 'caixa' ? 1800 : 7000;
  const g = c.createGain();
  g.gain.value = vol * (tipo === 'caixa' ? 0.6 : 0.25);
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

  switch (tr.estilo) {
    case 'eletronica':
      if (p % 4 === 0) bateria(c, m, t, 'bumbo', 0.7);
      if (p % 4 === 2) bateria(c, m, t, 'chimbal', 0.8);
      if (p === 4 || p === 12) bateria(c, m, t, 'caixa', 0.5);
      if (p % 2 === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 1.5, tipo: 'sawtooth', vol: 0.12, filtro: 700 });
      if (p % 4 === 2) for (const k of [0, 2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, 0), dur: dur16 * 1.6, tipo: 'sawtooth', vol: 0.035, filtro: 2400 });
      break;
    case 'orgao':
      if (p === 0) for (const k of [0, 2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 15, tipo: 'sine', vol: 0.07, ataque: 0.15 });
      if (p === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 15, tipo: 'triangle', vol: 0.12, ataque: 0.1 });
      if (p % 4 === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde + [0, 2, 4, 2][p / 4], 1), dur: dur16 * 3, tipo: 'sine', vol: 0.05 });
      break;
    case 'romantica':
      if (p === 0) nota(c, m, { t, midi: grauParaMidi(tr, acorde, -2), dur: dur16 * 11, tipo: 'triangle', vol: 0.14, ataque: 0.05 });
      if (p === 4 || p === 8) for (const k of [2, 4]) nota(c, m, { t, midi: grauParaMidi(tr, acorde + k, -1), dur: dur16 * 3, tipo: 'sine', vol: 0.06 });
      break;
    case 'tensa':
      if (p % 4 === 0) bateria(c, m, t, 'bumbo', 0.6);
      if (p === 4 || p === 12) bateria(c, m, t, 'caixa', 0.6);
      if (p % 2 === 1) bateria(c, m, t, 'chimbal', 0.6);
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
  if (atual?.nome === nome) { if (!relogio && !estaMudo()) iniciar(); return; }
  pararMusica();
  const tr = TRILHAS[nome] ?? TRILHAS.menu;
  atual = { nome, tr, comp: compor(tr), passo: 0, proximo: 0 };
  if (estaMudo()) return;
  iniciar();
}

function iniciar() {
  if (!atual || relogio) return;
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

quandoMudarSom((mudo) => { if (mudo) pararMusica(); else iniciar(); });
