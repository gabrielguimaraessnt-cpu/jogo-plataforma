// Efeitos sonoros sintetizados na hora (sem arquivos de áudio).
// Para usar sons próprios depois, troque cada função por um <audio> ou AudioBuffer carregado.

let ctx = null;
let mudo = false;
try { mudo = localStorage.getItem('zuca-mudo') === '1'; } catch {}

function contexto() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function alternarSom() {
  mudo = !mudo;
  try { localStorage.setItem('zuca-mudo', mudo ? '1' : '0'); } catch {}
  return !mudo;
}

function tom({ tipo = 'square', de = 440, ate = de, duracao = 0.12, volume = 0.15, atraso = 0 }) {
  if (mudo) return;
  const c = contexto();
  const t = c.currentTime + atraso;
  const osc = c.createOscillator();
  const ganho = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(de, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(ate, 1), t + duracao);
  ganho.gain.setValueAtTime(volume, t);
  ganho.gain.exponentialRampToValueAtTime(0.001, t + duracao);
  osc.connect(ganho).connect(c.destination);
  osc.start(t);
  osc.stop(t + duracao + 0.02);
}

function ruido({ duracao = 0.2, volume = 0.25, corte = 1200, atraso = 0 }) {
  if (mudo) return;
  const c = contexto();
  const t = c.currentTime + atraso;
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * duracao), c.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < dados.length; i++) dados[i] = (Math.random() * 2 - 1) * (1 - i / dados.length);
  const fonte = c.createBufferSource();
  fonte.buffer = buffer;
  const filtro = c.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = corte;
  const ganho = c.createGain();
  ganho.gain.value = volume;
  fonte.connect(filtro).connect(ganho).connect(c.destination);
  fonte.start(t);
}

export const som = {
  pulo: () => tom({ de: 260, ate: 620, duracao: 0.14, volume: 0.08 }),
  giro: () => tom({ tipo: 'sawtooth', de: 900, ate: 300, duracao: 0.25, volume: 0.05 }),
  fruta: () => { tom({ tipo: 'sine', de: 1320, duracao: 0.06, volume: 0.1 }); tom({ tipo: 'sine', de: 1760, duracao: 0.1, volume: 0.1, atraso: 0.05 }); },
  caixa: () => { ruido({ duracao: 0.15, volume: 0.3, corte: 900 }); tom({ tipo: 'triangle', de: 180, ate: 90, duracao: 0.1, volume: 0.15 }); },
  mola: () => tom({ tipo: 'sine', de: 200, ate: 900, duracao: 0.3, volume: 0.15 }),
  checkpoint: () => [523, 659, 784].forEach((f, i) => tom({ tipo: 'triangle', de: f, duracao: 0.15, volume: 0.12, atraso: i * 0.08 })),
  pavio: () => tom({ tipo: 'square', de: 1000, duracao: 0.05, volume: 0.05 }),
  explosao: () => { ruido({ duracao: 0.7, volume: 0.5, corte: 500 }); tom({ tipo: 'sine', de: 120, ate: 30, duracao: 0.5, volume: 0.3 }); },
  inimigo: () => tom({ tipo: 'square', de: 500, ate: 120, duracao: 0.2, volume: 0.1 }),
  vida: () => [523, 659, 784, 1046].forEach((f, i) => tom({ tipo: 'square', de: f, duracao: 0.12, volume: 0.08, atraso: i * 0.09 })),
  morte: () => [400, 300, 200, 120].forEach((f, i) => tom({ tipo: 'square', de: f, ate: f * 0.9, duracao: 0.16, volume: 0.1, atraso: i * 0.14 })),
  vitoria: () => [523, 523, 659, 784, 659, 1046].forEach((f, i) => tom({ tipo: 'square', de: f, duracao: 0.16, volume: 0.08, atraso: i * 0.12 })),
};
