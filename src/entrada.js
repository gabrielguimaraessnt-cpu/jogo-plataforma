// Teclado, controle de videogame e botões de toque, todos viram o mesmo conjunto de "teclas lógicas".

// Ações que a pessoa pode trocar de tecla (Controles no menu). Cada uma tem duas teclas.
export const ACOES = [
  ['cima', 'Andar para a frente'], ['baixo', 'Andar para trás'], ['esquerda', 'Andar para a esquerda'],
  ['direita', 'Andar para a direita'], ['pular', 'Pular'], ['girar', 'Giro do Fit Dance'], ['pausa', 'Pausar'],
];
const PADRAO = {
  cima: ['KeyW', 'ArrowUp'], baixo: ['KeyS', 'ArrowDown'], esquerda: ['KeyA', 'ArrowLeft'], direita: ['KeyD', 'ArrowRight'],
  // O giro não usa Shift: no Windows ele abre a janela de "teclas de aderência".
  pular: ['Space', 'KeyZ'], girar: ['KeyJ', 'KeyX'], pausa: ['Escape', 'KeyP'],
};
const FIXAS = { KeyM: 'som', KeyN: 'proximaMusica', Enter: 'confirmar', NumpadEnter: 'confirmar' };
// Setas e Esc sempre funcionam nos menus, mesmo se a pessoa trocar os controles.
const RESERVA = { ArrowUp: 'cima', ArrowDown: 'baixo', ArrowLeft: 'esquerda', ArrowRight: 'direita', Escape: 'pausa' };

let teclas = structuredClone(PADRAO);
try {
  const salvas = JSON.parse(localStorage.getItem('bia-teclas') ?? 'null');
  if (salvas) for (const [acao] of ACOES) if (Array.isArray(salvas[acao])) teclas[acao] = salvas[acao].slice(0, 2);
} catch {}
let mapa = {};
function remontar() {
  mapa = { ...FIXAS };
  for (const [acao, codigos] of Object.entries(teclas)) for (const c of codigos) if (c) mapa[c] = acao;
}
remontar();
const acaoDe = (codigo) => mapa[codigo] ?? RESERVA[codigo];

export function teclasAtuais() { return structuredClone(teclas); }
export function definirTecla(acao, posicao, codigo) {
  for (const lista of Object.values(teclas)) for (let i = 0; i < lista.length; i++) if (lista[i] === codigo) lista[i] = null;
  teclas[acao][posicao] = codigo;
  try { localStorage.setItem('bia-teclas', JSON.stringify(teclas)); } catch {}
  remontar();
}
export function restaurarTeclas() {
  teclas = structuredClone(PADRAO);
  try { localStorage.removeItem('bia-teclas'); } catch {}
  remontar();
}

const NOMES = { Space: 'Espaço', Escape: 'Esc', Enter: 'Enter', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
  ShiftLeft: 'Shift', ShiftRight: 'Shift dir.', ControlLeft: 'Ctrl', ControlRight: 'Ctrl dir.', AltLeft: 'Alt', AltRight: 'Alt Gr',
  Tab: 'Tab', Backspace: 'Apagar', CapsLock: 'Caps Lock', Semicolon: 'Ç', Quote: '~', BracketLeft: '´', BracketRight: '[', Backslash: ']',
  Comma: ',', Period: '.', Slash: ';', IntlRo: '/', Minus: '-', Equal: '=' };
export function nomeTecla(codigo) {
  if (!codigo) return '—';
  if (NOMES[codigo]) return NOMES[codigo];
  if (codigo.startsWith('Key')) return codigo.slice(3);
  if (codigo.startsWith('Digit')) return codigo.slice(5);
  if (codigo.startsWith('Numpad')) return 'Num ' + codigo.slice(6);
  return codigo;
}

// Esperando a pessoa apertar a tecla nova (tela de Controles).
let capturando = null;
export function capturarTecla(fn) { capturando = fn; }

const seguradas = new Set();
const apertadasAgora = new Set();
const teclasSeguradas = new Set();
const toque = new Set();

function apertar(nome) {
  if (!seguradas.has(nome)) apertadasAgora.add(nome);
  seguradas.add(nome);
}
function soltar(nome) { seguradas.delete(nome); }

addEventListener('keydown', (e) => {
  if (capturando) {
    e.preventDefault();
    const fn = capturando;
    capturando = null;
    fn(e.code === 'Escape' ? null : e.code);
    return;
  }
  // Digitando o nome: só as setas para cima/baixo e o Esc saem do campo.
  if (e.target instanceof HTMLInputElement && !['ArrowUp', 'ArrowDown', 'Escape'].includes(e.code)) return;
  const nome = acaoDe(e.code);
  if (!nome) return;
  e.preventDefault();
  teclasSeguradas.add(e.code);
  if (!e.repeat) apertar(nome);
});
addEventListener('keyup', (e) => {
  teclasSeguradas.delete(e.code);
  const nome = acaoDe(e.code);
  // Só solta a ação se nenhuma outra tecla dela continuar apertada.
  if (nome && ![...teclasSeguradas].some((c) => acaoDe(c) === nome)) soltar(nome);
});
addEventListener('blur', () => { seguradas.clear(); teclasSeguradas.clear(); });

export function iniciarToque() {
  const area = document.getElementById('toque');
  const ehToque = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!ehToque) return false;
  iniciarJoystick();
  for (const botao of area.querySelectorAll('[data-tecla]')) {
    const nome = botao.dataset.tecla;
    const liga = (e) => { e.preventDefault(); toque.add(nome); apertar(nome); botao.classList.add('ativo'); };
    const desliga = (e) => { e.preventDefault(); toque.delete(nome); soltar(nome); botao.classList.remove('ativo'); };
    botao.addEventListener('pointerdown', liga);
    botao.addEventListener('pointerup', desliga);
    botao.addEventListener('pointercancel', desliga);
    botao.addEventListener('pointerleave', desliga);
  }
  return true;
}

// Joystick na tela: o dedo encosta em qualquer ponto da metade esquerda, o joystick aparece ali
// e arrastar para qualquer lado (inclusive na diagonal) anda naquela direção.
let eixoToque = null;
function iniciarJoystick() {
  const zona = document.getElementById('zona-joystick');
  const base = document.getElementById('joystick');
  const pino = base.querySelector('.pino');
  const RAIO = 55;
  let dedo = null, centro = null;
  // Com o celular em pé a página está girada 90°: converte o toque para o "papel" girado.
  const local = (e) => document.body.classList.contains('girado')
    ? { x: e.clientY, y: innerWidth - e.clientX } : { x: e.clientX, y: e.clientY };
  const repousar = () => {
    base.classList.remove('ativo');
    base.style.left = ''; base.style.top = '';
    pino.style.transform = '';
    eixoToque = null;
    dedo = null;
  };
  zona.addEventListener('pointerdown', (e) => {
    if (dedo !== null) return;
    e.preventDefault();
    dedo = e.pointerId;
    zona.setPointerCapture?.(e.pointerId);
    const caixa = zona.getBoundingClientRect();
    const p = local(e);
    const origem = document.body.classList.contains('girado') ? { x: caixa.top, y: innerWidth - caixa.right } : { x: caixa.left, y: caixa.top };
    centro = p;
    base.style.left = `${p.x - origem.x}px`;
    base.style.top = `${p.y - origem.y}px`;
    base.classList.add('ativo');
    eixoToque = { x: 0, z: 0 };
  });
  zona.addEventListener('pointermove', (e) => {
    if (e.pointerId !== dedo) return;
    e.preventDefault();
    const p = local(e);
    let dx = p.x - centro.x, dy = p.y - centro.y;
    const d = Math.hypot(dx, dy);
    if (d > RAIO) { dx *= RAIO / d; dy *= RAIO / d; }
    pino.style.transform = `translate(${dx}px, ${dy}px)`;
    const forca = Math.min(d / RAIO, 1);
    eixoToque = forca < 0.18 ? { x: 0, z: 0 } : { x: (dx / RAIO), z: (dy / RAIO) };
  });
  for (const ev of ['pointerup', 'pointercancel']) zona.addEventListener(ev, (e) => { if (e.pointerId === dedo) repousar(); });
}

// Controle (Xbox/PlayStation): A pula, X/Quadrado gira, Start pausa.
const controleAntes = new Set();
function lerControle() {
  const agora = new Set();
  const eixos = { x: 0, y: 0 };
  for (const c of navigator.getGamepads?.() ?? []) {
    if (!c) continue;
    const b = (i) => c.buttons[i]?.pressed;
    if (b(0)) agora.add('pular');
    if (b(2) || b(1)) agora.add('girar');
    if (b(9)) agora.add('pausa');
    if (b(12)) agora.add('cima');
    if (b(13)) agora.add('baixo');
    if (b(14)) agora.add('esquerda');
    if (b(15)) agora.add('direita');
    const [ax = 0, ay = 0] = c.axes;
    if (Math.abs(ax) > 0.2) eixos.x = ax;
    if (Math.abs(ay) > 0.2) eixos.y = ay;
    // analógico empurrado até o fim também conta como seta (para andar nos menus)
    if (ax < -0.6) agora.add('esquerda');
    if (ax > 0.6) agora.add('direita');
    if (ay < -0.6) agora.add('cima');
    if (ay > 0.6) agora.add('baixo');
  }
  for (const n of agora) if (!controleAntes.has(n)) apertar(n);
  for (const n of controleAntes) if (!agora.has(n) && !toque.has(n)) soltar(n);
  controleAntes.clear();
  for (const n of agora) controleAntes.add(n);
  return eixos;
}

// Chamar uma vez por quadro. Devolve o estado do quadro e limpa os "apertou agora".
export function lerEntrada() {
  const eixos = lerControle();
  // Uma batidinha rápida na tecla (apertou e soltou entre dois quadros) também conta.
  const ativa = (n) => seguradas.has(n) || apertadasAgora.has(n);
  let x = (ativa('direita') ? 1 : 0) - (ativa('esquerda') ? 1 : 0);
  let z = (ativa('baixo') ? 1 : 0) - (ativa('cima') ? 1 : 0);
  if (eixos.x || eixos.y) { x = eixos.x; z = eixos.y; }
  if (eixoToque && (eixoToque.x || eixoToque.z)) { x = eixoToque.x; z = eixoToque.z; }
  const tamanho = Math.hypot(x, z);
  if (tamanho > 1) { x /= tamanho; z /= tamanho; }
  const estado = {
    x, z,
    segurandoPulo: seguradas.has('pular'),
    pulou: apertadasAgora.has('pular'),
    girou: apertadasAgora.has('girar'),
    pausou: apertadasAgora.has('pausa'),
    som: apertadasAgora.has('som'),
    proximaMusica: apertadasAgora.has('proximaMusica'),
    // para os menus: o que foi apertado neste quadro
    menu: {
      anterior: apertadasAgora.has('cima') || apertadasAgora.has('esquerda'),
      proximo: apertadasAgora.has('baixo') || apertadasAgora.has('direita'),
      escolher: apertadasAgora.has('confirmar') || apertadasAgora.has('pular'),
      voltar: apertadasAgora.has('pausa') || apertadasAgora.has('girar'),
    },
  };
  apertadasAgora.clear();
  return estado;
}
