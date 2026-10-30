// Teclado, controle de videogame e botões de toque, todos viram o mesmo conjunto de "teclas lógicas".

const MAPA_TECLADO = {
  KeyW: 'cima', ArrowUp: 'cima',
  KeyS: 'baixo', ArrowDown: 'baixo',
  KeyA: 'esquerda', ArrowLeft: 'esquerda',
  KeyD: 'direita', ArrowRight: 'direita',
  Space: 'pular', KeyZ: 'pular',
  // Girar: J, K, E ou X (o Shift saiu: no Windows ele abre a janela de "teclas de aderência").
  KeyJ: 'girar', KeyK: 'girar', KeyE: 'girar', KeyX: 'girar',
  KeyN: 'proximaMusica',
  Escape: 'pausa', KeyP: 'pausa',
  KeyM: 'som',
  Enter: 'confirmar', NumpadEnter: 'confirmar',
};

const seguradas = new Set();
const apertadasAgora = new Set();
const toque = new Set();

function apertar(nome) {
  if (!seguradas.has(nome)) apertadasAgora.add(nome);
  seguradas.add(nome);
}
function soltar(nome) { seguradas.delete(nome); }

addEventListener('keydown', (e) => {
  // Digitando o nome: só as setas para cima/baixo e o Esc saem do campo.
  if (e.target instanceof HTMLInputElement && !['ArrowUp', 'ArrowDown', 'Escape'].includes(e.code)) return;
  const nome = MAPA_TECLADO[e.code];
  if (!nome) return;
  e.preventDefault();
  if (!e.repeat) apertar(nome);
});
addEventListener('keyup', (e) => {
  const nome = MAPA_TECLADO[e.code];
  if (nome) soltar(nome);
});
addEventListener('blur', () => seguradas.clear());

export function iniciarToque() {
  const area = document.getElementById('toque');
  const ehToque = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!ehToque) return false;
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
  let x = (seguradas.has('direita') ? 1 : 0) - (seguradas.has('esquerda') ? 1 : 0);
  let z = (seguradas.has('baixo') ? 1 : 0) - (seguradas.has('cima') ? 1 : 0);
  if (eixos.x || eixos.y) { x = eixos.x; z = eixos.y; }
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
