// Todos os modelos do jogo são montados aqui com formas simples (estilo low-poly).
// Para trocar por modelos feitos no Blender, veja assets/modelos/LEIA-ME.md:
// se existir um .glb com o nome certo, ele substitui o modelo daqui automaticamente.
import * as THREE from 'three';

const materiais = new Map();
export function mat(cor, extra = {}) {
  const chave = cor + JSON.stringify(extra);
  if (!materiais.has(chave)) {
    materiais.set(chave, new THREE.MeshStandardMaterial({ color: cor, flatShading: true, roughness: 0.8, metalness: 0, ...extra }));
  }
  return materiais.get(chave);
}

function malha(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

// ---------- Texturas desenhadas em canvas ----------

function textura(tamanho, desenhar, repetir = false) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = tamanho;
  const g = canvas.getContext('2d');
  desenhar(g, tamanho);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestMipmapLinearFilter;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// Gerador aleatório com semente: o cenário sai sempre igual.
export function aleatorio(semente = 1) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function salpicar(g, n, cores, tam, rnd) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = cores[Math.floor(rnd() * cores.length)];
    g.fillRect(Math.floor(rnd() * 64), Math.floor(rnd() * 64), tam, tam);
  }
}

const texGrama = textura(64, (g) => {
  const rnd = aleatorio(7);
  g.fillStyle = '#5fae3f'; g.fillRect(0, 0, 64, 64);
  salpicar(g, 260, ['#6fc04a', '#4f9a35', '#7fcf55', '#58a63c'], 2, rnd);
}, true);

const texTerra = textura(64, (g) => {
  const rnd = aleatorio(9);
  g.fillStyle = '#8a5a34'; g.fillRect(0, 0, 64, 64);
  salpicar(g, 200, ['#9b6a40', '#784b2a', '#a3744a', '#6c4224'], 3, rnd);
  g.fillStyle = '#5fae3f'; g.fillRect(0, 0, 64, 6);
  for (let x = 0; x < 64; x += 4) g.fillRect(x, 6, 2, 2 + ((x * 7) % 5));
}, true);

const texPedra = textura(64, (g) => {
  const rnd = aleatorio(3);
  g.fillStyle = '#8d8a80'; g.fillRect(0, 0, 64, 64);
  salpicar(g, 220, ['#9e9b90', '#7a776d', '#a8a597', '#6e6b62'], 3, rnd);
}, true);

function bordaMadeira(g, base, escura) {
  g.fillStyle = base; g.fillRect(0, 0, 64, 64);
  g.strokeStyle = escura; g.lineWidth = 2;
  for (let y = 16; y < 64; y += 16) { g.beginPath(); g.moveTo(6, y); g.lineTo(58, y); g.stroke(); }
  g.fillStyle = escura;
  g.fillRect(0, 0, 64, 6); g.fillRect(0, 58, 64, 6); g.fillRect(0, 0, 6, 64); g.fillRect(58, 0, 6, 64);
}

const desenhosCaixa = {
  comum: (g) => {
    bordaMadeira(g, '#c8873e', '#6b3b12');
    g.strokeStyle = '#6b3b12'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(6, 6); g.lineTo(58, 58); g.stroke();
  },
  mola: (g) => {
    bordaMadeira(g, '#c8873e', '#6b3b12');
    g.fillStyle = '#2bb24c';
    g.beginPath(); g.moveTo(32, 10); g.lineTo(52, 32); g.lineTo(40, 32); g.lineTo(40, 54);
    g.lineTo(24, 54); g.lineTo(24, 32); g.lineTo(12, 32); g.closePath(); g.fill();
    g.strokeStyle = '#0b5a20'; g.lineWidth = 2; g.stroke();
  },
  checkpoint: (g) => {
    bordaMadeira(g, '#5aa9e6', '#1d4e89');
    g.fillStyle = '#ffffff'; g.fillRect(20, 12, 4, 40);
    g.fillStyle = '#ffb703';
    g.beginPath(); g.moveTo(24, 12); g.lineTo(46, 20); g.lineTo(24, 28); g.closePath(); g.fill();
  },
  explosiva: (g) => {
    g.fillStyle = '#c1121f'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#1b1b1b';
    for (let i = -64; i < 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 0); g.lineTo(i + 72, 64); g.lineTo(i + 64, 64); g.fill(); }
    g.fillStyle = '#c1121f'; g.fillRect(10, 10, 44, 44);
    g.fillStyle = '#ffd60a'; g.fillRect(28, 14, 8, 24); g.fillRect(28, 42, 8, 8);
  },
  ferro: (g) => {
    g.fillStyle = '#8d99ae'; g.fillRect(0, 0, 64, 64);
    g.fillStyle = '#5c677d';
    g.fillRect(0, 0, 64, 5); g.fillRect(0, 59, 64, 5); g.fillRect(0, 0, 5, 64); g.fillRect(59, 0, 5, 64);
    g.fillStyle = '#c9d1dc';
    for (const [x, y] of [[10, 10], [50, 10], [10, 50], [50, 50]]) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
    g.fillStyle = '#7a869c'; g.fillRect(14, 29, 36, 6); g.fillRect(29, 14, 6, 36);
  },
};

export const materiaisCaixa = Object.fromEntries(
  Object.entries(desenhosCaixa).map(([tipo, d]) => [tipo, new THREE.MeshStandardMaterial({ map: textura(64, d), roughness: 0.9 })]),
);

export const TIPOS_SOLO = {
  grama: [new THREE.MeshStandardMaterial({ map: texTerra, roughness: 1 }), new THREE.MeshStandardMaterial({ map: texGrama, roughness: 1 })],
  pedra: [new THREE.MeshStandardMaterial({ map: texPedra, roughness: 1 }), new THREE.MeshStandardMaterial({ map: texPedra, roughness: 1 })],
};

// Caixa com UV em escala de mundo: a textura repete a cada 2 metros em vez de esticar.
export function blocoSolo(largura, altura, profundidade, tipo = 'grama') {
  const geo = new THREE.BoxGeometry(largura, altura, profundidade);
  const uv = geo.attributes.uv;
  const escalas = [[profundidade, altura], [profundidade, altura], [largura, profundidade], [largura, profundidade], [largura, altura], [largura, altura]];
  for (let face = 0; face < 6; face++) {
    const [u, v] = escalas[face];
    for (let i = 0; i < 4; i++) {
      const k = face * 4 + i;
      // Nas laterais a faixa de grama fica sempre no topo: v conta de cima para baixo.
      const vv = face === 2 || face === 3 ? uv.getY(k) * v / 2 : 1 - (1 - uv.getY(k)) * v / 2;
      uv.setXY(k, uv.getX(k) * u / 2, vv);
    }
  }
  const [lado, topo] = TIPOS_SOLO[tipo] ?? TIPOS_SOLO.grama;
  const m = new THREE.Mesh(geo, [lado, lado, topo, lado, lado, lado]);
  m.receiveShadow = true;
  m.castShadow = true;
  return m;
}

// ---------- Personagem: Zuca, o tatu ----------

export function criarZuca() {
  const raiz = new THREE.Group();
  const corpo = new THREE.Group();
  raiz.add(corpo);

  const casco = mat(0xc98a4b), faixa = mat(0x8a5a2b), pele = mat(0xe8b47a), clara = mat(0xf6dcb4);
  const preto = mat(0x161616), branco = mat(0xffffff), lenco = mat(0xe63946);

  const tronco = malha(new THREE.SphereGeometry(0.42, 10, 8), casco, 0, 0.55, 0);
  tronco.scale.set(1, 0.85, 1.15);
  corpo.add(tronco);
  for (const [z, r] of [[-0.22, 0.34], [0, 0.39], [0.22, 0.34]]) {
    const anel = malha(new THREE.TorusGeometry(r, 0.045, 5, 14), faixa, 0, 0.55, z);
    anel.scale.y = 0.85;
    corpo.add(anel);
  }
  const barriga = malha(new THREE.SphereGeometry(0.33, 8, 6), clara, 0, 0.42, 0.06);
  barriga.scale.set(1, 0.7, 1.1);
  corpo.add(barriga);

  const cabeca = new THREE.Group();
  cabeca.position.set(0, 0.72, 0.48);
  corpo.add(cabeca);
  cabeca.add(malha(new THREE.SphereGeometry(0.25, 8, 7), pele));
  const focinho = malha(new THREE.ConeGeometry(0.12, 0.34, 7), pele, 0, -0.04, 0.27);
  focinho.rotation.x = Math.PI / 2;
  cabeca.add(focinho);
  cabeca.add(malha(new THREE.SphereGeometry(0.055, 6, 5), preto, 0, -0.04, 0.45));
  for (const lado of [-1, 1]) {
    const orelha = malha(new THREE.ConeGeometry(0.08, 0.24, 5), pele, lado * 0.14, 0.24, -0.04);
    orelha.rotation.z = -lado * 0.35;
    cabeca.add(orelha);
    cabeca.add(malha(new THREE.SphereGeometry(0.075, 7, 6), branco, lado * 0.11, 0.08, 0.17));
    cabeca.add(malha(new THREE.SphereGeometry(0.04, 6, 5), preto, lado * 0.115, 0.08, 0.235));
  }
  const cachecol = malha(new THREE.TorusGeometry(0.2, 0.06, 5, 12), lenco, 0, 0.62, 0.34);
  cachecol.rotation.x = Math.PI / 2 - 0.35;
  corpo.add(cachecol);
  const ponta = malha(new THREE.BoxGeometry(0.1, 0.22, 0.04), lenco, 0.12, 0.5, 0.18);
  ponta.rotation.z = 0.5;
  corpo.add(ponta);

  const rabo = malha(new THREE.ConeGeometry(0.08, 0.42, 6), faixa, 0, 0.42, -0.62);
  rabo.rotation.x = -Math.PI / 2 - 0.4;
  corpo.add(rabo);

  const pernas = [];
  for (const [x, z] of [[-0.22, 0.24], [0.22, 0.24], [-0.22, -0.22], [0.22, -0.22]]) {
    const pivo = new THREE.Group();
    pivo.position.set(x, 0.3, z);
    pivo.add(malha(new THREE.CylinderGeometry(0.075, 0.09, 0.3, 6), pele, 0, -0.15, 0));
    corpo.add(pivo);
    pernas.push(pivo);
  }

  raiz.userData = { corpo, pernas, cabeca };
  return raiz;
}

// Anima o modelo feito em código. "estado" vem do jogador.
export function animarZuca(modelo, estado, tempo) {
  const { corpo, pernas, cabeca } = modelo.userData;
  if (!corpo) return;
  const correndo = estado.noChao && estado.velocidadeChao > 0.5;
  const fase = tempo * 14;
  pernas.forEach((p, i) => {
    const alvo = correndo ? Math.sin(fase + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.9 : estado.noChao ? 0 : (i < 2 ? -0.7 : 0.7);
    p.rotation.x += (alvo - p.rotation.x) * 0.3;
  });
  corpo.position.y = correndo ? Math.abs(Math.sin(fase)) * 0.06 : Math.sin(tempo * 3) * 0.015;
  cabeca.rotation.x = estado.noChao ? 0 : -0.25;
  if (estado.girando) {
    corpo.rotation.y += 0.9;
    corpo.scale.set(1.1, 0.85, 1.1);
  } else {
    corpo.rotation.y *= 0.6;
    const estica = estado.noChao ? 1 : 1 + Math.min(Math.abs(estado.vy) * 0.01, 0.12);
    corpo.scale.set(1 / Math.sqrt(estica), estica, 1 / Math.sqrt(estica));
  }
}

// ---------- Inimigo: besouro ----------

export function criarBesouro() {
  const raiz = new THREE.Group();
  const casca = malha(new THREE.SphereGeometry(0.45, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x6a2c91, { roughness: 0.35 }), 0, 0.22, 0);
  casca.scale.set(1, 0.9, 1.2);
  raiz.add(casca);
  raiz.add(malha(new THREE.CylinderGeometry(0.44, 0.44, 0.08, 10), mat(0x2b1240), 0, 0.22, 0));
  const cabeca = malha(new THREE.SphereGeometry(0.2, 7, 6), mat(0x241033), 0, 0.3, 0.5);
  raiz.add(cabeca);
  const chifre = malha(new THREE.ConeGeometry(0.06, 0.3, 5), mat(0xd9c9a3), 0, 0.48, 0.6);
  chifre.rotation.x = 0.6;
  raiz.add(chifre);
  for (const lado of [-1, 1]) raiz.add(malha(new THREE.SphereGeometry(0.06, 6, 5), mat(0xffd60a, { emissive: 0x664400 }), lado * 0.1, 0.36, 0.66));
  const patas = [];
  for (let i = 0; i < 6; i++) {
    const lado = i < 3 ? -1 : 1;
    const pata = malha(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 4), mat(0x241033), lado * 0.42, 0.12, ((i % 3) - 1) * 0.3);
    pata.rotation.z = lado * 1.0;
    raiz.add(pata);
    patas.push(pata);
  }
  raiz.userData = { patas };
  return raiz;
}

export function animarBesouro(modelo, tempo) {
  modelo.userData.patas?.forEach((p, i) => { p.rotation.x = Math.sin(tempo * 18 + i * 1.7) * 0.5; });
}

// ---------- Coletável: caju ----------

const geoCaju = new THREE.SphereGeometry(0.2, 8, 6);
const geoCastanha = new THREE.SphereGeometry(0.11, 6, 5);
export function criarCaju() {
  const raiz = new THREE.Group();
  const fruta = malha(geoCaju, mat(0xff7b00, { emissive: 0x401800 }));
  fruta.scale.set(0.9, 1.25, 0.9);
  raiz.add(fruta);
  const castanha = malha(geoCastanha, mat(0x9a8f5c), 0.04, 0.3, 0);
  castanha.scale.set(1.5, 0.7, 0.9);
  castanha.rotation.z = 0.4;
  raiz.add(castanha);
  return raiz;
}

// ---------- Cenário ----------

export function criarArvore(rnd) {
  const raiz = new THREE.Group();
  const altura = 2.5 + rnd() * 3;
  raiz.add(malha(new THREE.CylinderGeometry(0.18, 0.3, altura, 6), mat(0x7a4e2d), 0, altura / 2, 0));
  const verdes = [0x2f8f3a, 0x3fa34d, 0x26733a, 0x4caf50];
  if (rnd() < 0.5) {
    for (let i = 0; i < 3; i++) {
      const copa = malha(new THREE.IcosahedronGeometry(0.9 + rnd() * 0.7, 0), mat(verdes[Math.floor(rnd() * 4)]),
        (rnd() - 0.5) * 0.8, altura + (rnd() - 0.2) * 0.8, (rnd() - 0.5) * 0.8);
      copa.rotation.set(rnd() * 3, rnd() * 3, 0);
      raiz.add(copa);
    }
  } else {
    // palmeira
    for (let i = 0; i < 6; i++) {
      const folha = malha(new THREE.BoxGeometry(0.35, 0.05, 1.8), mat(verdes[i % 4]), 0, altura, 0);
      folha.geometry.translate(0, 0, 0.9);
      folha.rotation.set(0.45, (i / 6) * Math.PI * 2, 0);
      raiz.add(folha);
    }
  }
  raiz.rotation.y = rnd() * Math.PI * 2;
  return raiz;
}

export function criarArbusto(rnd) {
  const m = malha(new THREE.IcosahedronGeometry(0.4 + rnd() * 0.4, 0), mat(rnd() < 0.5 ? 0x3c9a46 : 0x2f7d38));
  m.scale.y = 0.7;
  m.position.y = 0.2;
  m.rotation.set(rnd() * 3, rnd() * 3, 0);
  return m;
}

export function criarPedra(rnd) {
  const m = malha(new THREE.DodecahedronGeometry(0.3 + rnd() * 0.5, 0), mat(0x9a968b));
  m.scale.y = 0.6;
  m.rotation.set(rnd() * 3, rnd() * 3, 0);
  return m;
}

export function criarFlor(rnd) {
  const raiz = new THREE.Group();
  raiz.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 4), mat(0x2f8f3a), 0, 0.15, 0));
  const cores = [0xff4d6d, 0xffd60a, 0xffffff, 0xc77dff];
  raiz.add(malha(new THREE.IcosahedronGeometry(0.08, 0), mat(cores[Math.floor(rnd() * 4)]), 0, 0.32, 0));
  return raiz;
}

export function criarChegada() {
  const raiz = new THREE.Group();
  const ouro = mat(0xffc300, { emissive: 0x6a4a00, metalness: 0.4, roughness: 0.3 });
  const anel = malha(new THREE.TorusGeometry(1.2, 0.16, 8, 24), ouro, 0, 1.6, 0);
  raiz.add(anel);
  const brilho = new THREE.Mesh(new THREE.CircleGeometry(1.05, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  brilho.position.y = 1.6;
  raiz.add(brilho);
  raiz.add(malha(new THREE.CylinderGeometry(0.9, 1.1, 0.3, 10), mat(0x8d8a80), 0, 0.15, 0));
  raiz.userData = { anel, brilho };
  return raiz;
}

// Sombra redonda embaixo do personagem: ajuda muito a saber onde ele vai cair.
export function criarSombraRedonda() {
  const tex = textura(64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
  });
  tex.magFilter = THREE.LinearFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.renderOrder = 1;
  return m;
}
