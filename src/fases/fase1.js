// FASE 1 — Floresta do Caju
//
// Como ler este arquivo:
// - O personagem corre para a frente, que é o Z negativo (z = 0 é o começo, z = -190 é o fim).
// - X é para os lados (o corredor vai mais ou menos de x = -4 a x = 4).
// - Y é a altura (o chão principal fica em y = 0).
//
// Para criar ou mudar a fase, edite as listas abaixo e recarregue a página.

// chao(de, ate, { y, largura, x, tipo }) cria um bloco de chão cujo TOPO fica na altura y.
function chao(de, ate, { y = 0, largura = 8, x = 0, espessura = 4, tipo = 'grama' } = {}) {
  return { pos: [x, y - espessura / 2, (de + ate) / 2], tam: [largura, espessura, Math.abs(de - ate)], tipo };
}
// bloco(x, y, z, largura, profundidade) = plataforma pequena com topo em y.
function bloco(x, y, z, largura = 3, profundidade = 3, tipo = 'pedra') {
  return { pos: [x, y - 0.5, z], tam: [largura, 1, profundidade], tipo };
}
// fila de frutas em linha reta entre dois pontos
function fila(a, b, quantidade) {
  const lista = [];
  for (let i = 0; i < quantidade; i++) {
    const t = quantidade === 1 ? 0 : i / (quantidade - 1);
    lista.push(a.map((v, k) => v + (b[k] - v) * t));
  }
  return lista;
}
// arco de frutas (bom para mostrar onde pular)
function arco(a, b, altura, quantidade) {
  return fila(a, b, quantidade).map((p, i) => {
    const t = i / (quantidade - 1);
    return [p[0], p[1] + Math.sin(t * Math.PI) * altura, p[2]];
  });
}
// Caixa apoiada no chão de altura y (a caixa tem 1 m; "andar" empilha).
const cx = (tipo, x, y, z, andar = 0) => ({ tipo, pos: [x, y + 0.5 + andar, z] });

export default {
  numero: 1,
  nome: 'Floresta do Caju',
  ceu: 0x8fd3ff,
  neblina: [0xbfe6ff, 30, 95],
  inicio: [0, 0, 2],
  sementeCenario: 42,

  plataformas: [
    // 1. Começo: chão largo para aprender a andar, pular e girar
    chao(6, -30),
    // buraco de -30 a -34
    chao(-34, -56),
    // 2. Degrau para cima
    chao(-56, -76, { y: 1.5 }),
    // 3. Abismo com plataformas que se mexem (veja "moveis") de -76 a -96
    chao(-96, -116, { y: 1.5 }),
    // 4. Pedras flutuantes
    bloco(-2, 2.2, -120), bloco(2, 3, -125), bloco(-1.5, 3.6, -130.5), bloco(1.5, 3, -136),
    // 5. Muro de metal com mola na frente
    chao(-140, -162, { y: 2 }),
    // 6. Reta final
    chao(-165, -192, { y: 2, largura: 10 }),
  ],

  // Plataformas que se movem: vão de "pos" até "pos + desloca" e voltam. "vel" = idas por segundo (mais alto = mais rápido).
  moveis: [
    { pos: [-3, 1, -81], tam: [3, 0.5, 3], desloca: [6, 0, 0], vel: 0.35 },
    { pos: [3, 1, -87], tam: [3, 0.5, 3], desloca: [-6, 0, 0], vel: 0.4 },
    { pos: [0, 1, -93], tam: [3, 0.5, 3], desloca: [0, 1.5, 0], vel: 0.5 },
    { pos: [0, 1.75, -163.5], tam: [3, 0.5, 2.5], desloca: [0, 0, 0], vel: 0 }, // ponte estreita (parada)
  ],

  // tipos: comum, mola, checkpoint, explosiva, ferro
  caixas: [
    cx('comum', -2, 0, -8), cx('comum', 2, 0, -11), cx('comum', 0, 0, -17), cx('comum', 0, 0, -17, 1),
    cx('mola', 3, 0, -25), cx('comum', 3, 0, -25, 4),
    cx('checkpoint', 0, 0, -37),
    cx('comum', 2.5, 0, -42), cx('comum', 2.5, 0, -42, 1), cx('comum', 2.5, 0, -42, 2),
    cx('explosiva', -2, 0, -45),
    cx('comum', -2.5, 0, -50), cx('ferro', -1.5, 0, -50), cx('comum', -0.5, 0, -50),
    cx('comum', 1, 1.5, -62), cx('comum', -1, 1.5, -62),
    cx('explosiva', 0, 1.5, -68), cx('comum', 2.8, 1.5, -71), cx('comum', -2.8, 1.5, -71),
    cx('checkpoint', 0, 1.5, -99),
    cx('comum', -2, 1.5, -104), cx('comum', 2, 1.5, -104), cx('mola', 0, 1.5, -110), cx('comum', 0, 1.5, -110, 5),
    cx('comum', 2, 3, -125),
    cx('checkpoint', 0, 2, -143),
    cx('mola', 0, 2, -148),
    // muro de metal (3 de altura, corredor inteiro)
    ...[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].flatMap((x) => [cx('ferro', x, 2, -151), cx('ferro', x, 2, -151, 1), cx('ferro', x, 2, -151, 2)]),
    cx('comum', -2, 2, -157), cx('comum', 2, 2, -157), cx('comum', 0, 2, -159), cx('comum', 0, 2, -159, 1),
    cx('explosiva', -3, 2, -172), cx('explosiva', 3, 2, -172), cx('comum', 0, 2, -176), cx('comum', 0, 2, -176, 1), cx('comum', 0, 2, -176, 2),
    cx('comum', -4, 2, -182), cx('comum', 4, 2, -182),
  ],

  frutas: [
    ...fila([0, 1, -3], [0, 1, -15], 5),
    ...arco([0, 1, -28], [0, 1, -36], 2.5, 6),
    ...fila([-2.5, 1, -40], [-2.5, 1, -48], 4),
    ...fila([0, 2.5, -58], [0, 2.5, -74], 6),
    ...fila([-3, 2.3, -81], [3, 2.3, -81], 4),
    ...fila([3, 2.3, -87], [-3, 2.3, -87], 4),
    ...fila([0, 2.3, -93], [0, 3.8, -93], 3),
    ...arco([-2, 3.2, -120], [2, 4, -125], 1.5, 4),
    ...arco([-1.5, 4.6, -130.5], [1.5, 4, -136], 1.5, 4),
    ...fila([0, 5, -147], [0, 8, -151], 4),
    ...fila([-3, 3, -165], [-3, 3, -190], 8),
    ...fila([3, 3, -165], [3, 3, -190], 8),
  ],

  // Inimigos andam de "de" até "ate" e voltam. vel em metros por segundo.
  inimigos: [
    { tipo: 'besouro', de: [-3, 0, -22], ate: [3, 0, -22], vel: 2.2 },
    { tipo: 'besouro', de: [3, 1.5, -65], ate: [-3, 1.5, -65], vel: 2.5 },
    { tipo: 'besouro', de: [-3, 1.5, -107], ate: [3, 1.5, -107], vel: 3 },
    { tipo: 'besouro', de: [-3, 2, -168], ate: [3, 2, -168], vel: 3 },
    { tipo: 'besouro', de: [3, 2, -179], ate: [-3, 2, -179], vel: 3.5 },
  ],

  chegada: [0, 2, -188],
};
