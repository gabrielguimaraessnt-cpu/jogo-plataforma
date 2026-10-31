// Temas visuais de cada mundo: céu, luz, chão, enfeites das laterais e cenário do fundo.
import * as THREE from 'three';
import { toon, brilho, malha, contornar, textura, salpicar, aleatorio, caixaArredondada, texturaTexto, desenharFlor } from './estilo3d.js';
import { criarPinheiro, criarPessoa, criarPudim, criarFlor } from './modelos/itens.js';
import { criarMaquininha } from './modelos/inimigos.js';
import { VILAO } from './config.js';

// ---------- texturas de chão ----------

const pintores = {
  grama: (g, w, h) => {
    const rnd = aleatorio(7);
    g.fillStyle = '#6cc04a'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 300, ['#7fd155', '#5cae3f', '#8adb5f', '#64b844'], 2, rnd);
  },
  terra: (g, w, h) => {
    const rnd = aleatorio(9);
    g.fillStyle = '#9a6a42'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 200, ['#a97a50', '#875a36', '#b3845a', '#7a4f2e'], 3, rnd);
    g.fillStyle = '#6cc04a'; g.fillRect(0, 0, w, 7);
    for (let x = 0; x < w; x += 4) g.fillRect(x, 7, 2, 2 + ((x * 7) % 5));
  },
  marmore: (g, w, h) => {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      g.fillStyle = (i + j) % 2 ? '#efe4d2' : '#c9b79c';
      g.fillRect(i * w / 2, j * h / 2, w / 2, h / 2);
    }
    g.strokeStyle = 'rgba(120,100,80,0.25)'; g.lineWidth = 1;
    const rnd = aleatorio(4);
    for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(rnd() * w, rnd() * h); g.bezierCurveTo(rnd() * w, rnd() * h, rnd() * w, rnd() * h, rnd() * w, rnd() * h); g.stroke(); }
  },
  pedraClara: (g, w, h) => {
    g.fillStyle = '#d8ccb8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b5a68e'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 16) % 2 * 16; x < w; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } }
  },
  xadrez: (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,111,145,0.55)';
    for (let i = 0; i < 4; i++) { g.fillRect(i * w / 4, 0, w / 8, h); g.fillRect(0, i * h / 4, w, h / 8); }
  },
  madeiraMesa: (g, w, h) => {
    g.fillStyle = '#c08552'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8c5a33'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + 3, w * 2 / 3, y - 3, w, y); g.stroke(); }
  },
  bambu: (g, w, h) => {
    g.fillStyle = '#e9d8a6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d4bf86';
    for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 2, h);
    g.fillStyle = '#b89b5e';
    for (let x = 0; x < w; x += 8) for (let y = (x * 3) % 20; y < h; y += 22) g.fillRect(x, y, 8, 2);
  },
  laca: (g, w, h) => {
    g.fillStyle = '#9d0208'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9d8a6'; g.fillRect(0, 0, w, 6);
    g.fillStyle = '#6a040f'; g.fillRect(0, h - 10, w, 10);
  },
  neon: (g, w, h) => {
    g.fillStyle = '#1b1035'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ff4ecd'; g.lineWidth = 3; g.strokeRect(2, 2, w / 2 - 4, h / 2 - 4); g.strokeRect(w / 2 + 2, h / 2 + 2, w / 2 - 4, h / 2 - 4);
    g.strokeStyle = '#3ef0ff'; g.strokeRect(w / 2 + 2, 2, w / 2 - 4, h / 2 - 4); g.strokeRect(2, h / 2 + 2, w / 2 - 4, h / 2 - 4);
  },
  neonLado: (g, w, h) => {
    g.fillStyle = '#120a26'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff4ecd'; g.fillRect(0, 0, w, 4);
    g.fillStyle = '#3ef0ff'; g.fillRect(0, 10, w, 2);
  },
  piso: (g, w, h) => {
    g.fillStyle = '#b8bec6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#9aa1ab'; g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
  },
  faixaPerigo: (g, w, h) => {
    g.fillStyle = '#ffd60a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1b1b1b';
    for (let i = -h; i < w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 0); g.lineTo(i + 8 + h, h); g.lineTo(i + h, h); g.fill(); }
  },
  nuvem: (g, w, h) => {
    g.fillStyle = '#fff7fb'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 80, ['#ffe5ec', '#ffffff', '#fbe0f0'], 4, aleatorio(2));
  },
  neve: (g, w, h) => {
    g.fillStyle = '#f4f9ff'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 160, ['#e3eefc', '#ffffff', '#d6e6f7'], 3, aleatorio(21));
  },
  neveLado: (g, w, h) => {
    g.fillStyle = '#7a5a43'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 150, ['#8a6a50', '#6a4a35'], 3, aleatorio(22));
    g.fillStyle = '#f4f9ff'; g.fillRect(0, 0, w, 10);
    for (let x = 0; x < w; x += 6) g.fillRect(x, 10, 4, 3 + ((x * 5) % 6));
  },
  gelo: (g, w, h) => {
    g.fillStyle = '#bfe3f7'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.5;
    const rnd = aleatorio(23);
    for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(rnd() * w, rnd() * h); g.lineTo(rnd() * w, rnd() * h); g.stroke(); }
  },
  carpete: (g, w, h) => {
    g.fillStyle = '#5b3a6b'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 200, ['#654276', '#523263', '#6d4a7e'], 2, aleatorio(24));
  },
  palco: (g, w, h) => {
    g.fillStyle = '#3a2a24'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2a1d18'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.fillStyle = '#ffd166'; g.fillRect(0, 0, w, 4);
  },
  rachado: (g, w, h) => {
    g.fillStyle = '#c9b79c'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 120, ['#b5a387', '#d8c8ae'], 3, aleatorio(41));
    g.strokeStyle = '#5c4a3a'; g.lineWidth = 2;
    const rnd = aleatorio(42);
    for (let k = 0; k < 5; k++) {
      g.beginPath(); let x = rnd() * w, y = rnd() * h; g.moveTo(x, y);
      for (let i = 0; i < 4; i++) { x += (rnd() - 0.5) * 24; y += (rnd() - 0.5) * 24; g.lineTo(x, y); }
      g.stroke();
    }
  },
  esteira: (g, w, h) => {
    g.fillStyle = '#2b2d42'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffd166';
    for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(w * 0.2, y + 12); g.lineTo(w / 2, y + 2); g.lineTo(w * 0.8, y + 12); g.lineTo(w * 0.65, y + 12); g.lineTo(w / 2, y + 7); g.lineTo(w * 0.35, y + 12); g.fill(); }
  },
  areia: (g, w, h) => {
    g.fillStyle = '#f4dba5'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 260, ['#ecd092', '#f8e6bd', '#e3c27e', '#fff1cf'], 2, aleatorio(31));
  },
  areiaLado: (g, w, h) => {
    g.fillStyle = '#d9b26f'; g.fillRect(0, 0, w, h);
    salpicar(g, w, h, 180, ['#c9a05c', '#e3c27e', '#bf9550'], 3, aleatorio(32));
    g.fillStyle = '#f4dba5'; g.fillRect(0, 0, w, 7);
  },
  gramaFlorida: (g, w, h) => {
    pintores.grama(g, w, h);
    const rnd = aleatorio(13);
    for (let i = 0; i < 14; i++) desenharFlor(g, rnd() * w, rnd() * h, 4, ['#ffffff', '#ffb3c6', '#ffd166'][i % 3], '#f4a261');
  },
};

const cacheMat = new Map();
function matChao(nome, emissivo = false) {
  const chave = nome + emissivo;
  if (!cacheMat.has(chave)) {
    const t = textura(64, pintores[nome], { repetir: true });
    cacheMat.set(chave, new THREE.MeshLambertMaterial({ map: t, ...(emissivo ? { emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.6 } : {}) }));
  }
  return cacheMat.get(chave);
}

// Bloco com UV em escala de mundo: a textura repete a cada 2 metros em vez de esticar.
export function bloco(largura, altura, profundidade, lado, topo) {
  const geo = new THREE.BoxGeometry(largura, altura, profundidade);
  const uv = geo.attributes.uv;
  const escalas = [[profundidade, altura], [profundidade, altura], [largura, profundidade], [largura, profundidade], [largura, altura], [largura, altura]];
  for (let face = 0; face < 6; face++) {
    const [u, v] = escalas[face];
    for (let i = 0; i < 4; i++) {
      const k = face * 4 + i;
      const vv = face === 2 || face === 3 ? uv.getY(k) * v / 2 : 1 - (1 - uv.getY(k)) * v / 2;
      uv.setXY(k, uv.getX(k) * u / 2, vv);
    }
  }
  const m = new THREE.Mesh(geo, [lado, lado, topo, lado, lado, lado]);
  m.receiveShadow = true;
  m.castShadow = true;
  return m;
}

// ---------- peças de cenário reaproveitadas ----------

function casinha(rnd) {
  const g = new THREE.Group();
  const cores = [0xffd6a5, 0xfdffb6, 0xcaffbf, 0x9bf6ff, 0xffc6ff, 0xffadad];
  const w = 3 + rnd() * 1.5, h = 2.4 + rnd();
  g.add(malha(caixaArredondada(w, h, 3, 0.1), toon(cores[Math.floor(rnd() * cores.length)]), 0, h / 2, 0));
  const telhado = malha(new THREE.CylinderGeometry(0.01, w * 0.78, 1.5, 4, 1), toon(0xc8553d), 0, h + 0.75, 0);
  telhado.rotation.y = Math.PI / 4;
  telhado.scale.z = 0.75;
  g.add(telhado);
  g.add(malha(new THREE.BoxGeometry(0.8, 1.4, 0.1), toon(0x8d5524), 0, 0.7, 1.51));
  for (const x of [-w / 3, w / 3]) {
    g.add(malha(new THREE.BoxGeometry(0.7, 0.7, 0.08), brilho(0xfff3b0, 0.4), x, h * 0.62, 1.51));
    g.add(malha(new THREE.BoxGeometry(0.9, 0.12, 0.15), toon(0xffffff), x, h * 0.62 - 0.42, 1.52));
  }
  return g;
}

function cerca(comprimento) {
  const g = new THREE.Group();
  const branco = toon(0xfffaf0);
  for (let z = 0; z < comprimento; z += 0.8) {
    const tabua = malha(new THREE.BoxGeometry(0.1, 0.7, 0.18), branco, 0, 0.35, -z);
    g.add(tabua);
  }
  for (const y of [0.25, 0.55]) g.add(malha(new THREE.BoxGeometry(0.06, 0.08, comprimento), branco, 0.05, y, -comprimento / 2));
  return g;
}

function balao(rnd, cores = [0xff4d6d, 0xffd166, 0x4cc9f0, 0xb8a1ff, 0x52b788]) {
  const g = new THREE.Group();
  const b = malha(new THREE.SphereGeometry(0.35, 12, 10), toon(cores[Math.floor(rnd() * cores.length)]), 0, 2.4, 0);
  b.scale.y = 1.2;
  g.add(b);
  g.add(malha(new THREE.CylinderGeometry(0.008, 0.008, 2, 3), toon(0xffffff), 0, 1.2, 0));
  const fase = rnd() * 6;
  g.userData.animar = (t) => { b.position.y = 2.4 + Math.sin(t * 1.5 + fase) * 0.12; };
  return g;
}

function mesaFarta(rnd) {
  const g = new THREE.Group();
  g.add(malha(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 20), toon(0xffffff), 0, 0.8, 0));
  g.add(malha(new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8), toon(0x8d5524), 0, 0.4, 0));
  // bolo de aniversário
  for (let i = 0; i < 2; i++) g.add(malha(new THREE.CylinderGeometry(0.35 - i * 0.1, 0.35 - i * 0.1, 0.25, 18), toon(i ? 0xffc8dd : 0xffafcc), 0, 0.97 + i * 0.25, 0));
  g.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 5), toon(0xfff3b0), 0, 1.4, 0));
  g.add(malha(new THREE.SphereGeometry(0.03, 6, 4), brilho(0xffa200, 2), 0, 1.5, 0));
  const pudim = criarPudim(false);
  pudim.position.set(0.6, 0.85, 0.2);
  pudim.scale.setScalar(1.2);
  g.add(pudim);
  return g;
}

function varal(rnd) {
  const g = new THREE.Group();
  for (const x of [-1.5, 1.5]) g.add(malha(new THREE.CylinderGeometry(0.05, 0.05, 2, 6), toon(0x8d5524), x, 1, 0));
  g.add(malha(new THREE.CylinderGeometry(0.01, 0.01, 3, 3), toon(0xffffff), 0, 1.9, 0));
  g.children[2].rotation.z = Math.PI / 2;
  const cores = [0xff8fab, 0x8ecae6, 0xffd166, 0xb5e48c];
  for (let i = 0; i < 4; i++) {
    const roupa = malha(new THREE.BoxGeometry(0.5, 0.6, 0.03), toon(cores[i]), -1.1 + i * 0.73, 1.55, 0);
    g.add(roupa);
  }
  return g;
}

function banco(comprimento = 3) {
  const g = new THREE.Group();
  const madeira = toon(0x7f4f24);
  g.add(malha(new THREE.BoxGeometry(comprimento, 0.1, 0.6), madeira, 0, 0.5, 0));
  g.add(malha(new THREE.BoxGeometry(comprimento, 0.6, 0.08), madeira, 0, 0.85, -0.28));
  for (const x of [-comprimento / 2 + 0.1, comprimento / 2 - 0.1]) g.add(malha(new THREE.BoxGeometry(0.1, 0.5, 0.55), madeira, x, 0.25, 0));
  return g;
}

function notaMusical(cor) {
  const g = new THREE.Group();
  const m = brilho(cor, 0.6);
  const bola = malha(new THREE.SphereGeometry(0.16, 10, 8), m);
  bola.scale.set(1.2, 0.85, 0.6);
  g.add(bola);
  g.add(malha(new THREE.BoxGeometry(0.04, 0.6, 0.04), m, 0.16, 0.3, 0));
  const ban = malha(new THREE.BoxGeometry(0.22, 0.06, 0.04), m, 0.26, 0.56, 0);
  ban.rotation.z = -0.4;
  g.add(ban);
  return g;
}

function carretelGigante(rnd) {
  const g = new THREE.Group();
  const cores = [0xff8fab, 0x8ecae6, 0xffd166, 0xb5e48c, 0xcdb4db];
  const r = 0.5 + rnd() * 0.5, h = 1.2 + rnd() * 1.2;
  g.add(malha(new THREE.CylinderGeometry(r, r, h, 20), toon(cores[Math.floor(rnd() * cores.length)]), 0, h / 2 + 0.12, 0));
  for (const y of [0.06, h + 0.18]) g.add(malha(new THREE.CylinderGeometry(r * 1.35, r * 1.35, 0.12, 20), toon(0xd4a373), 0, y, 0));
  return g;
}

function alfinete(rnd) {
  const g = new THREE.Group();
  const h = 1.5 + rnd() * 1.5;
  const haste = malha(new THREE.CylinderGeometry(0.03, 0.005, h, 6), toon(0xced4da), 0, h / 2, 0);
  g.add(haste);
  g.add(malha(new THREE.SphereGeometry(0.2, 10, 8), toon([0xe63946, 0x4361ee, 0xffd166][Math.floor(rnd() * 3)]), 0, h, 0));
  g.rotation.z = (rnd() - 0.5) * 0.6;
  return g;
}

function botao(rnd) {
  const g = new THREE.Group();
  const cor = [0xffafcc, 0xa2d2ff, 0xffd166, 0xcdb4db][Math.floor(rnd() * 4)];
  const disco = malha(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 24), toon(cor), 0, 0.08, 0);
  g.add(disco);
  for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) g.add(malha(new THREE.CylinderGeometry(0.08, 0.08, 0.17, 10), toon(0x333333), x, 0.08, z));
  return g;
}

function lapis(rnd) {
  const g = new THREE.Group();
  const cor = [0xe63946, 0x4361ee, 0x2a9d8f, 0xffb703, 0x9d4edd][Math.floor(rnd() * 5)];
  const h = 2.5 + rnd() * 1.5;
  g.add(malha(new THREE.CylinderGeometry(0.22, 0.22, h, 6), toon(cor), 0, h / 2 + 0.4, 0));
  g.add(malha(new THREE.ConeGeometry(0.22, 0.4, 6), toon(0xf5d6a0), 0, 0.2, 0));
  g.children[1].rotation.x = Math.PI;
  g.add(malha(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 6), toon(0xadb5bd), 0, h + 0.5, 0));
  g.add(malha(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 6), toon(0xffafcc), 0, h + 0.75, 0));
  g.rotation.z = (rnd() - 0.5) * 0.4;
  return g;
}

function manequim(rnd) {
  const g = new THREE.Group();
  g.add(malha(new THREE.CylinderGeometry(0.04, 0.04, 1, 6), toon(0x6c584c), 0, 0.5, 0));
  g.add(malha(new THREE.CylinderGeometry(0.3, 0.35, 0.05, 12), toon(0x6c584c), 0, 0.02, 0));
  const busto = malha(new THREE.LatheGeometry([[0.2, 0], [0.26, 0.15], [0.22, 0.35], [0.27, 0.55], [0.2, 0.7], [0.06, 0.78]].map(([r, y]) => new THREE.Vector2(r, y)), 18), toon(0xe8d5c4), 0, 1, 0);
  g.add(busto);
  const cores = [0xe76f51, 0x8ecae6, 0xffafcc, 0x52b788];
  const saia = malha(new THREE.ConeGeometry(0.45, 0.6, 18, 1, true), toon(cores[Math.floor(rnd() * 4)], { side: THREE.DoubleSide }), 0, 0.95, 0);
  g.add(saia);
  return g;
}

function tesoura() {
  const g = new THREE.Group();
  const metal = toon(0xced4da), cabo = toon(0xe63946);
  for (const lado of [-1, 1]) {
    const lamina = malha(new THREE.BoxGeometry(0.18, 0.06, 2.2), metal, 0, 0.05, -1);
    const braco = new THREE.Group();
    braco.add(lamina);
    const anel = malha(new THREE.TorusGeometry(0.3, 0.08, 6, 14), cabo, 0, 0.05, 0.4);
    anel.rotation.x = Math.PI / 2;
    braco.add(anel);
    braco.rotation.y = lado * 0.25;
    g.add(braco);
  }
  return g;
}

function sushi(rnd) {
  const g = new THREE.Group();
  if (rnd() < 0.5) { // nigiri
    const arroz = malha(new THREE.CapsuleGeometry(0.35, 0.6, 4, 10), toon(0xfdfcdc), 0, 0.3, 0);
    arroz.rotation.z = Math.PI / 2;
    arroz.scale.set(1, 1, 0.8);
    g.add(arroz);
    const peixe = malha(caixaArredondada(1.2, 0.18, 0.7, 0.08), toon(0xff8c61), 0, 0.62, 0);
    g.add(peixe);
    for (let i = -2; i <= 2; i++) g.add(malha(new THREE.BoxGeometry(0.04, 0.02, 0.6), toon(0xffd6c2), i * 0.2, 0.72, 0));
  } else { // maki
    g.add(malha(new THREE.CylinderGeometry(0.5, 0.5, 0.6, 18), toon(0x1b4332), 0, 0.3, 0));
    g.add(malha(new THREE.CylinderGeometry(0.42, 0.42, 0.62, 18), toon(0xfdfcdc), 0, 0.3, 0));
    g.add(malha(new THREE.CylinderGeometry(0.16, 0.16, 0.64, 10), toon(rnd() < 0.5 ? 0xff8c61 : 0x80b918), 0, 0.3, 0));
  }
  g.scale.setScalar(1.2 + rnd());
  return g;
}

function panelaEstrogonofe() {
  const g = new THREE.Group();
  g.add(malha(new THREE.CylinderGeometry(1, 0.9, 0.9, 24, 1, true), toon(0x9aa5b1, { side: THREE.DoubleSide }), 0, 0.45, 0));
  g.add(malha(new THREE.CylinderGeometry(0.95, 0.95, 0.05, 24), toon(0xc8814a), 0, 0.75, 0));
  for (let i = 0; i < 8; i++) g.add(malha(new THREE.SphereGeometry(0.15, 8, 6), toon(0xa0522d), Math.cos(i) * 0.5, 0.78, Math.sin(i * 1.3) * 0.5));
  for (let i = 0; i < 20; i++) g.add(malha(new THREE.BoxGeometry(0.2, 0.03, 0.03), toon(0xffd166), Math.cos(i * 2.4) * 0.6, 0.82, Math.sin(i * 1.7) * 0.6));
  for (const x of [-1.05, 1.05]) g.add(malha(new THREE.BoxGeometry(0.25, 0.08, 0.15), toon(0x495057), x, 0.75, 0));
  return g;
}

function lanterna(cor = 0xe63946) {
  const g = new THREE.Group();
  const corpo = malha(new THREE.SphereGeometry(0.35, 12, 10), brilho(cor, 0.7), 0, 0, 0);
  corpo.scale.y = 1.25;
  g.add(corpo);
  for (const y of [-0.43, 0.43]) g.add(malha(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 10), toon(0x1b1b1b), 0, y, 0));
  return g;
}

function caixaDeSom(altura = 2.2, corAnel = 0xff4ecd) {
  const g = new THREE.Group();
  g.add(malha(caixaArredondada(1.2, altura, 1, 0.08), toon(0x1f1b2e), 0, altura / 2, 0));
  const cones = [];
  for (const [y, r] of [[altura * 0.7, 0.35], [altura * 0.3, 0.45]]) {
    const c = malha(new THREE.CylinderGeometry(r, r * 0.6, 0.1, 20), toon(0x3a3550), 0, y, 0.52);
    c.rotation.x = Math.PI / 2;
    g.add(c);
    const anel = malha(new THREE.TorusGeometry(r, 0.03, 6, 24), brilho(corAnel, 1.2), 0, y, 0.52);
    g.add(anel);
    cones.push(c);
  }
  const fase = Math.random();
  g.userData.animar = (t) => { const s = 1 + Math.max(0, Math.sin(t * Math.PI * 4.26 + fase)) * 0.12; cones.forEach((c) => c.scale.set(s, 1, s)); };
  return g;
}

function globoEspelhado() {
  const g = new THREE.Group();
  const bola = malha(new THREE.IcosahedronGeometry(1, 2), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 1, roughness: 0.15, flatShading: true, emissive: 0x333344 }));
  g.add(bola);
  g.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 4, 4), toon(0x888888), 0, 2.5, 0));
  g.userData.animar = (t) => { bola.rotation.y = t * 0.8; };
  return g;
}

function holofote(cor) {
  const g = new THREE.Group();
  const facho = new THREE.Mesh(new THREE.ConeGeometry(2, 14, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  facho.position.y = -7;
  const pivo = new THREE.Group();
  pivo.add(facho);
  pivo.position.y = 14;
  g.add(pivo);
  const fase = Math.random() * 6;
  g.userData.animar = (t) => { pivo.rotation.z = Math.sin(t * 0.9 + fase) * 0.5; pivo.rotation.x = Math.cos(t * 0.7 + fase) * 0.3; };
  return g;
}

function prateleira(rnd) {
  const g = new THREE.Group();
  const metal = toon(0x6c757d);
  for (const x of [-1.4, 1.4]) g.add(malha(new THREE.BoxGeometry(0.1, 3.2, 0.8), metal, x, 1.6, 0));
  for (let i = 0; i < 3; i++) {
    g.add(malha(new THREE.BoxGeometry(2.9, 0.08, 0.8), metal, 0, 0.3 + i * 1.1, 0));
    for (let k = 0; k < 2; k++) {
      if (rnd() < 0.7) {
        const m = rnd() < 0.5 ? maquinaEstatica() : caixaPapelao(rnd);
        m.position.set(-0.7 + k * 1.4, 0.34 + i * 1.1, 0);
        m.scale.setScalar(0.8);
        g.add(m);
      }
    }
  }
  return g;
}

let protoMaquina;
function maquinaEstatica() {
  protoMaquina ??= (() => { const m = criarMaquininha(); m.userData.corpo.children.forEach((c) => { if (c.isGroup) c.visible = false; }); return m; })();
  const c = protoMaquina.clone();
  c.rotation.y = -Math.PI / 2;
  return c;
}

function caixaPapelao(rnd) {
  const g = new THREE.Group();
  const s = 0.5 + rnd() * 0.3;
  g.add(malha(new THREE.BoxGeometry(s, s * 0.8, s), toon(0xc9a36b), 0, s * 0.4, 0));
  g.add(malha(new THREE.BoxGeometry(s * 1.01, 0.05, 0.1), toon(0xe9d8a6), 0, s * 0.8, 0));
  return g;
}

function placa(linhas, { cor = '#ffffff', fundo = VILAO.css.principal, largura = 3, altura = 1.2, poste = 2.2 } = {}) {
  const g = new THREE.Group();
  const tex = texturaTexto(linhas, { largura: 512, altura: Math.round(512 * altura / largura), fundo, cor, fonte: 'bold 62px "Trebuchet MS", sans-serif', borda: '#ffffff' });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  p.position.y = poste + altura / 2;
  g.add(p);
  if (poste > 0) for (const x of [-largura / 2 + 0.2, largura / 2 - 0.2]) g.add(malha(new THREE.CylinderGeometry(0.06, 0.06, poste, 6), toon(0x495057), x, poste / 2, 0));
  return g;
}

function cadeiraConvidado(rnd) {
  const g = new THREE.Group();
  const branco = toon(0xffffff);
  g.add(malha(new THREE.BoxGeometry(0.5, 0.06, 0.5), branco, 0, 0.45, 0));
  g.add(malha(new THREE.BoxGeometry(0.5, 0.55, 0.05), branco, 0, 0.75, -0.23));
  for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) g.add(malha(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 5), branco, x, 0.22, z));
  const laco = malha(new THREE.TorusGeometry(0.08, 0.03, 5, 10), toon(0xffafcc), 0, 0.95, -0.2);
  laco.scale.x = 1.8;
  g.add(laco);
  if (rnd() < 0.75) {
    const p = criarPessoa(rnd, {});
    p.position.set(0, 0.1, 0);
    p.scale.multiplyScalar(0.85);
    g.add(p);
    g.userData.animar = p.userData.animar;
  }
  return g;
}

function coracao(cor = 0xff4d6d, tamanho = 1) {
  const forma = new THREE.Shape();
  forma.moveTo(0, -0.6);
  forma.bezierCurveTo(-0.9, 0, -0.6, 0.8, 0, 0.35);
  forma.bezierCurveTo(0.6, 0.8, 0.9, 0, 0, -0.6);
  const geo = new THREE.ExtrudeGeometry(forma, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3 });
  geo.center();
  const m = malha(geo, toon(cor));
  m.scale.setScalar(tamanho);
  return m;
}

function arvoreRedonda(rnd, cores = [0x52b788, 0x40916c, 0x74c69d]) {
  const g = new THREE.Group();
  const h = 2 + rnd() * 2;
  g.add(malha(new THREE.CylinderGeometry(0.15, 0.25, h, 7), toon(0x7f5539), 0, h / 2, 0));
  for (let i = 0; i < 3; i++) g.add(malha(new THREE.SphereGeometry(0.9 + rnd() * 0.5, 12, 10), toon(cores[i % cores.length]), (rnd() - 0.5) * 0.9, h + (rnd() - 0.2) * 0.7, (rnd() - 0.5) * 0.9));
  return g;
}

function arbusto(rnd, cor = 0x52b788, flores = true) {
  const g = new THREE.Group();
  const b = malha(new THREE.SphereGeometry(0.5 + rnd() * 0.3, 10, 8), toon(cor), 0, 0.3, 0);
  b.scale.y = 0.75;
  g.add(b);
  if (flores) for (let i = 0; i < 5; i++) g.add(malha(new THREE.SphereGeometry(0.08, 6, 4), toon([0xffffff, 0xff8fab, 0xffd166][i % 3]), (rnd() - 0.5) * 0.8, 0.45 + rnd() * 0.2, (rnd() - 0.5) * 0.8));
  return g;
}

function morros(raiz, zMin, zMax, rnd, cores, y = -6) {
  for (let z = zMax + 20; z > zMin - 60; z -= 16) {
    for (const lado of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(14 + rnd() * 10, 16, 10), toon(cores[Math.floor(rnd() * cores.length)]));
      m.position.set(lado * (36 + rnd() * 20), y, z - rnd() * 10);
      m.scale.y = 0.45 + rnd() * 0.3;
      raiz.add(m);
    }
  }
}

function nuvens(raiz, zMin, zMax, rnd, cor = 0xffffff) {
  for (let i = 0; i < 16; i++) {
    const n = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(1.5 + rnd() * 1.4, 10, 8), toon(cor, { emissive: cor, emissiveIntensity: 0.35 }));
      b.position.set(k * 1.8 - 2.7, rnd() * 0.8, rnd());
      n.add(b);
    }
    n.position.set((rnd() - 0.5) * 90, 20 + rnd() * 10, zMax - rnd() * (zMax - zMin + 60));
    raiz.add(n);
  }
}

function paredes(raiz, zMin, zMax, { cor, altura = 16, distancia = 24, enfeite }) {
  for (const lado of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1, altura, zMax - zMin + 80), toon(cor));
    p.position.set(lado * distancia, altura / 2 - 8, (zMax + zMin) / 2);
    raiz.add(p);
    if (enfeite) for (let z = zMax + 10; z > zMin - 30; z -= 9) { const e = enfeite(); e.position.set(lado * (distancia - 0.6), 0, z); e.rotation.y = -lado * Math.PI / 2; raiz.add(e); }
  }
}

function predios(raiz, zMin, zMax, rnd) {
  const janelas = textura(64, (c, w, h) => {
    c.fillStyle = '#1b1035'; c.fillRect(0, 0, w, h);
    for (let x = 4; x < w; x += 12) for (let y = 4; y < h; y += 12) {
      c.fillStyle = rnd() < 0.5 ? ['#ffd166', '#3ef0ff', '#ff4ecd'][Math.floor(rnd() * 3)] : '#2b1d50';
      c.fillRect(x, y, 6, 6);
    }
  }, { repetir: true });
  for (let z = zMax + 20; z > zMin - 60; z -= 9) {
    for (const lado of [-1, 1]) {
      const h = 12 + rnd() * 25, w = 6 + rnd() * 6;
      const t = janelas.clone();
      t.needsUpdate = true;
      t.repeat.set(w / 4, h / 4);
      const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, 7), new THREE.MeshBasicMaterial({ map: t }));
      p.position.set(lado * (28 + rnd() * 15), h / 2 - 8, z);
      raiz.add(p);
    }
  }
}

function estrelas(raiz) {
  const pts = [];
  const rnd = aleatorio(77);
  for (let i = 0; i < 400; i++) pts.push((rnd() - 0.5) * 300, 30 + rnd() * 80, (rnd() - 0.8) * 400);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  raiz.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, fog: false })));
}

function portalJapones() {
  const g = new THREE.Group();
  const vermelho = toon(0xc1121f);
  for (const x of [-5.5, 5.5]) g.add(malha(new THREE.CylinderGeometry(0.3, 0.35, 7, 10), vermelho, x, 3.5, 0));
  g.add(malha(new THREE.BoxGeometry(13.5, 0.5, 0.7), vermelho, 0, 6.6, 0));
  g.add(malha(new THREE.BoxGeometry(14.5, 0.35, 0.9), toon(0x1b1b1b), 0, 7.1, 0));
  g.add(malha(new THREE.BoxGeometry(12, 0.3, 0.5), vermelho, 0, 5.5, 0));
  return g;
}

// ---------- TEMAS ----------


// ---------- Igreja (louvor) ----------

function bateria() {
  const g = new THREE.Group();
  const casco = toon(0xc1121f), pele = toon(0xf8f4ec), metal = toon(0xced4da), ouro = toon(0xe9c46a);
  const bumbo = malha(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 20), casco, 0, 0.47, 0);
  bumbo.rotation.x = Math.PI / 2;
  g.add(bumbo);
  const frente = malha(new THREE.CircleGeometry(0.42, 20), pele, 0, 0.47, 0.205);
  g.add(frente);
  for (const [x, y, z, r] of [[-0.35, 0.95, 0, 0.2], [0.3, 0.95, 0, 0.2], [0.65, 0.65, -0.2, 0.25], [-0.75, 0.75, -0.1, 0.17]]) {
    g.add(malha(new THREE.CylinderGeometry(r, r, 0.22, 16), casco, x, y, z));
    g.add(malha(new THREE.CylinderGeometry(r * 0.98, r * 0.98, 0.01, 16), pele, x, y + 0.115, z));
  }
  for (const [x, y] of [[-0.9, 1.45], [0.85, 1.55]]) {
    g.add(malha(new THREE.CylinderGeometry(0.015, 0.015, y, 5), metal, x, y / 2, -0.2));
    const prato = malha(new THREE.CylinderGeometry(0.32, 0.32, 0.015, 18), ouro, x, y, -0.2);
    prato.rotation.z = 0.15;
    g.add(prato);
  }
  g.add(malha(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12), toon(0x222222), 0, 0.5, -0.75));
  return g;
}

function teclado() {
  const g = new THREE.Group();
  const teclas = textura(64, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#222'; for (let x = 0; x < w; x += 4) c.fillRect(x, 0, 1, h);
    for (let x = 2; x < w; x += 8) if ((x / 8) % 7 !== 2 && (x / 8) % 7 !== 6) c.fillRect(x, 0, 3, h * 0.6);
  }, { largura: 128, suave: true });
  g.add(malha(new THREE.BoxGeometry(1.4, 0.1, 0.4), toon(0x1b1b1b), 0, 0.9, 0));
  const topo = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.22), new THREE.MeshBasicMaterial({ map: teclas }));
  topo.rotation.x = -Math.PI / 2;
  topo.position.set(0, 0.952, 0.06);
  g.add(topo);
  for (const x of [-0.5, 0.5]) {
    const perna = malha(new THREE.BoxGeometry(0.05, 0.9, 0.05), toon(0x444444), x, 0.45, 0);
    perna.rotation.z = x > 0 ? 0.3 : -0.3;
    g.add(perna);
  }
  return g;
}

function guitarra(rnd) {
  const g = new THREE.Group();
  const cor = toon([0x2a9d8f, 0xe63946, 0xffb703, 0x1d3557][Math.floor(rnd() * 4)]);
  const corpo = new THREE.Group();
  corpo.add(malha(new THREE.SphereGeometry(0.28, 14, 10), cor, 0, 0, 0));
  corpo.add(malha(new THREE.SphereGeometry(0.21, 14, 10), cor, 0, 0.3, 0));
  corpo.children.forEach((c) => c.scale.z = 0.25);
  corpo.add(malha(new THREE.BoxGeometry(0.07, 0.8, 0.05), toon(0x6b4226), 0, 0.75, 0));
  corpo.add(malha(new THREE.BoxGeometry(0.12, 0.16, 0.05), toon(0x1b1b1b), 0, 1.2, 0));
  corpo.position.y = 0.55;
  corpo.rotation.z = 0.12;
  g.add(corpo);
  g.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 5), toon(0x333333), 0, 0.3, -0.12));
  return g;
}

function microfone() {
  const g = new THREE.Group();
  g.add(malha(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 14), toon(0x222222), 0, 0.02, 0));
  g.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6), toon(0x555555), 0, 0.77, 0));
  const mic = malha(new THREE.CapsuleGeometry(0.045, 0.12, 4, 8), toon(0x333333), 0, 1.55, 0.06);
  mic.rotation.x = 0.6;
  g.add(mic);
  return g;
}

function fileiraCadeiras(rnd) {
  const g = new THREE.Group();
  const estofado = toon(0x6d597a), ferro = toon(0x333333);
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Group();
    c.add(malha(caixaArredondada(0.5, 0.08, 0.5, 0.03), estofado, 0, 0.45, 0));
    c.add(malha(caixaArredondada(0.5, 0.5, 0.07, 0.03), estofado, 0, 0.75, -0.22));
    for (const [x, z] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) c.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 4), ferro, x, 0.22, z));
    c.position.x = (i - 1) * 0.6;
    g.add(c);
    if (rnd() < 0.35) {
      const p = criarPessoa(rnd);
      p.position.set(c.position.x, 0, 0.45);
      p.scale.multiplyScalar(0.9);
      g.add(p);
      g.userData.animar = p.userData.animar;
    }
  }
  return g;
}

function telao(texto) {
  const g = new THREE.Group();
  const tex = texturaTexto(texto, { largura: 512, altura: 288, fundo: '#1d2b4a', cor: '#ffffff', fonte: 'bold 64px "Trebuchet MS", sans-serif' });
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.6), new THREE.MeshBasicMaterial({ map: tex }));
  tela.position.y = 6;
  g.add(tela);
  g.add(malha(new THREE.BoxGeometry(6.7, 3.9, 0.15), toon(0x111111), 0, 6, -0.1));
  return g;
}

// ---------- Natal ----------

function bonecoDeNeve() {
  const g = new THREE.Group();
  const neve = toon(0xffffff);
  g.add(malha(new THREE.SphereGeometry(0.5, 16, 12), neve, 0, 0.45, 0));
  g.add(malha(new THREE.SphereGeometry(0.36, 16, 12), neve, 0, 1.1, 0));
  g.add(malha(new THREE.SphereGeometry(0.26, 16, 12), neve, 0, 1.6, 0));
  const nariz = malha(new THREE.ConeGeometry(0.05, 0.25, 8), toon(0xf77f00), 0, 1.6, 0.32);
  nariz.rotation.x = Math.PI / 2;
  g.add(nariz);
  for (const x of [-0.09, 0.09]) g.add(malha(new THREE.SphereGeometry(0.03, 6, 5), toon(0x111111), x, 1.68, 0.23));
  for (const y of [1.0, 1.15, 1.3]) g.add(malha(new THREE.SphereGeometry(0.035, 6, 5), toon(0x111111), 0, y, 0.34));
  g.add(malha(new THREE.TorusGeometry(0.24, 0.06, 6, 16), toon(0xc1121f), 0, 1.38, 0));
  g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  g.add(malha(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 14), toon(0x1b1b1b), 0, 1.82, 0));
  g.add(malha(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 14), toon(0x1b1b1b), 0, 1.98, 0));
  for (const s of [-1, 1]) {
    const braco = malha(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), toon(0x6b4226), s * 0.5, 1.2, 0);
    braco.rotation.z = s * -1;
    g.add(braco);
  }
  contornar(g, 0.012);
  return g;
}

function bengala() {
  const g = new THREE.Group();
  const listras = textura(32, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d62828';
    for (let i = -h; i < w + h; i += 12) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 6, 0); c.lineTo(i + 6 + h, h); c.lineTo(i + h, h); c.fill(); }
  }, { repetir: true, suave: true });
  listras.repeat.set(1, 6);
  const mat = toon(0xffffff, { map: listras });
  g.add(malha(new THREE.CylinderGeometry(0.1, 0.1, 2, 10), mat, 0, 1, 0));
  const curva = malha(new THREE.TorusGeometry(0.3, 0.1, 8, 14, Math.PI), mat, 0.3, 2, 0);
  g.add(curva);
  return g;
}

function casinhaNeve(rnd) {
  const g = casinha(rnd);
  const telhado = g.children[1];
  const neve = malha(new THREE.CylinderGeometry(0.01, telhado.geometry.parameters.radiusBottom * 1.04, 0.5, 4, 1), toon(0xffffff), 0, telhado.position.y + 0.55, 0);
  neve.rotation.y = Math.PI / 4;
  neve.scale.z = 0.75;
  g.add(neve);
  const cores = [0xffd60a, 0xff4d6d, 0x4cc9f0, 0x52b788];
  for (let i = 0; i < 9; i++) g.add(malha(new THREE.SphereGeometry(0.06, 6, 4), brilho(cores[i % 4], 1.3), -1.4 + i * 0.35, telhado.position.y - 0.72, 1.52));
  return g;
}

function pilhaPresentes(rnd) {
  const g = new THREE.Group();
  const cores = [0xd62828, 0x2d6a4f, 0xffd166, 0x4cc9f0, 0xb8a1ff];
  let y = 0;
  for (let i = 0; i < 3; i++) {
    const s = 0.6 - i * 0.15;
    g.add(malha(caixaArredondada(s, s, s, 0.04), toon(cores[Math.floor(rnd() * cores.length)]), (rnd() - 0.5) * 0.15, y + s / 2, 0));
    g.add(malha(new THREE.BoxGeometry(s * 1.02, s * 1.02, 0.08), toon(0xfff3b0), 0, y + s / 2, 0));
    y += s;
  }
  return g;
}

function estrelaNatal(tamanho = 1) {
  const forma = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.4 : 1;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    if (i === 0) forma.moveTo(Math.cos(a) * r, Math.sin(a) * r); else forma.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const geo = new THREE.ExtrudeGeometry(forma, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 });
  geo.center();
  const m = malha(geo, brilho(0xffd60a, 0.9));
  m.scale.setScalar(tamanho);
  return m;
}

function poste() {
  const g = new THREE.Group();
  g.add(malha(new THREE.CylinderGeometry(0.06, 0.08, 3, 8), toon(0x1b1b1b), 0, 1.5, 0));
  g.add(malha(new THREE.SphereGeometry(0.22, 12, 10), brilho(0xfff1c1, 1.4), 0, 3.15, 0));
  const laco = malha(new THREE.TorusGeometry(0.12, 0.04, 5, 10), toon(0xc1121f), 0, 2.6, 0.08);
  laco.scale.x = 1.8;
  g.add(laco);
  return g;
}

function neveCaindo(zMin, zMax) {
  const n = 2500;
  const pos = new Float32Array(n * 3);
  const rnd = aleatorio(31);
  for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - 0.5) * 50; pos[i * 3 + 1] = rnd() * 25 - 3; pos[i * 3 + 2] = zMax + 10 - rnd() * (zMax - zMin + 30); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pontos = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.9 }));
  let antes = 0;
  pontos.userData.animar = (t) => {
    const dt = Math.min(Math.max(t - antes, 0), 0.1);
    antes = t;
    const a = geo.attributes.position.array;
    for (let i = 0; i < n; i++) {
      a[i * 3 + 1] -= dt * (1.2 + (i % 5) * 0.2);
      a[i * 3] += Math.sin(t + i) * dt * 0.3;
      if (a[i * 3 + 1] < -3) a[i * 3 + 1] = 22;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pontos;
}

export const TEMAS = {
  familia: {
    mundo: 'Família',
    ceu: 0x9ad8ff, neblina: [0xcdeeff, 35, 110],
    luz: { ceu: 0xffffff, chao: 0x6a8f4e, forca: 1.3, sol: 0xfff1d6, forcaSol: 2.3 },
    chao: ['terra', 'grama'], margem: ['terra', 'grama'], plataforma: ['madeiraMesa', 'madeiraMesa'],
    baixo: { cor: 0x48cae4, opacidade: 0.9 },
    flor: 0xe63950, musica: 'familia',
    enfeite(rnd, dist) {
      const r = rnd();
      if (dist < 2.2 && r < 0.35) return criarPessoa(rnd, { crianca: rnd() < 0.3 });
      if (r < 0.25) return criarPinheiro(3 + rnd() * 2.5);
      if (r < 0.37 && dist > 4) return casinha(rnd);
      if (r < 0.45) return balao(rnd);
      if (r < 0.52 && dist > 3) return mesaFarta(rnd);
      if (r < 0.57 && dist > 3) return varal(rnd);
      if (r < 0.75) return arvoreRedonda(rnd);
      return arbusto(rnd);
    },
    beirada: (comp) => cerca(comp),
    fundo(raiz, zMin, zMax, rnd) { morros(raiz, zMin, zMax, rnd, [0x74c69d, 0x95d5b2, 0x52b788]); nuvens(raiz, zMin, zMax, rnd); },
  },

  igreja: {
    mundo: 'Igreja',
    ceu: 0x2a1f3d, neblina: [0x2a1f3d, 30, 90],
    luz: { ceu: 0xffeedd, chao: 0x4a3a5a, forca: 1.45, sol: 0xffe2b8, forcaSol: 1.8 },
    chao: ['palco', 'palco'], margem: ['carpete', 'carpete'], plataforma: ['palco', 'palco'],
    baixo: { cor: 0x1b1430, opacidade: 1 },
    flor: 0xf72585, musica: 'igreja',
    enfeite(rnd, dist) {
      const r = rnd();
      if (dist < 3 && r < 0.18) return bateria();
      if (dist < 3 && r < 0.32) return teclado();
      if (dist < 3 && r < 0.46) return guitarra(rnd);
      if (dist < 3 && r < 0.56) return microfone();
      if (dist < 3 && r < 0.66) return caixaDeSom(1.4 + rnd(), 0xffd166);
      if (r < 0.8) { const f = fileiraCadeiras(rnd); f.rotation.y = Math.PI / 2; return f; }
      if (r < 0.9) return criarPessoa(rnd);
      const n = notaMusical([0xffd166, 0xf72585, 0x4cc9f0][Math.floor(rnd() * 3)]);
      const base = new THREE.Group(); base.add(n);
      const f = rnd() * 6;
      base.userData.animar = (t) => { n.position.y = 2.5 + Math.sin(t * 2 + f) * 0.4; n.rotation.y = t + f; };
      return base;
    },
    beirada: null,
    fundo(raiz, zMin, zMax, rnd) {
      const textos = [['Ensaio da', 'Banda'], ['Bem-vindos!'], ['Louvor', '19h30'], ['Culto de', 'Domingo']];
      let i = 0;
      paredes(raiz, zMin, zMax, { cor: 0x3d3150, altura: 30, distancia: 18, enfeite: () => telao(textos[i++ % textos.length]) });
      for (let z = zMax - 4; z > zMin - 30; z -= 14) {
        for (const [cor, x] of [[0xffd166, -9], [0x4cc9f0, 9], [0xf72585, 0]]) {
          const h = holofote(cor);
          h.position.set(x, 4, z);
          raiz.add(h);
        }
      }
      for (let k = 0; k < 6; k++) {
        const luz = new THREE.PointLight(0xffd6a5, 30, 30);
        luz.position.set((k % 2 ? -1 : 1) * 10, 6, zMax - (k / 6) * (zMax - zMin));
        raiz.add(luz);
      }
    },
  },

  natal: {
    mundo: 'Natal',
    ceu: 0x1b2a4e, neblina: [0x2b3d66, 30, 100],
    luz: { ceu: 0xdbe9ff, chao: 0x5a6a8a, forca: 1.5, sol: 0xcfe0ff, forcaSol: 1.7 },
    chao: ['neveLado', 'neve'], margem: ['neveLado', 'neve'], plataforma: ['gelo', 'gelo'],
    baixo: { cor: 0x9ccbe8, opacidade: 1 },
    flor: 0xd62828, musica: 'natal',
    enfeite(rnd, dist) {
      const r = rnd();
      if (r < 0.3) return criarPinheiro(3 + rnd() * 3, { luzes: true, estrela: rnd() < 0.6, cor: 0x1b5e3a });
      if (r < 0.4 && dist > 4) return casinhaNeve(rnd);
      if (r < 0.5) return bonecoDeNeve();
      if (r < 0.6) return bengala();
      if (r < 0.72) return pilhaPresentes(rnd);
      if (r < 0.8 && dist < 3) return poste();
      if (r < 0.88 && dist < 4) return criarPessoa(rnd, { roupa: [0xc1121f, 0x2d6a4f, 0xffffff][Math.floor(rnd() * 3)] });
      return criarPinheiro(2 + rnd() * 2, { cor: 0x2d6a4f });
    },
    beirada: null,
    fundo(raiz, zMin, zMax, rnd) {
      morros(raiz, zMin, zMax, rnd, [0xf4f9ff, 0xe3eefc, 0xd6e6f7]);
      estrelas(raiz);
      raiz.add(neveCaindo(zMin, zMax));
      const lua = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshBasicMaterial({ color: 0xfff6d5, fog: false }));
      lua.position.set(-30, 40, zMin - 100);
      raiz.add(lua);
      for (let z = zMax - 20; z > zMin; z -= 40) {
        const e = estrelaNatal(0.8);
        e.position.set((z / 40) % 2 ? -6 : 6, 7, z);
        const g = new THREE.Group(); g.add(e);
        g.userData.animar = (t) => { e.rotation.y = t; };
        raiz.add(g);
      }
      // a árvore de Natal gigante do fim da fase
      const arvore = criarPinheiro(16, { luzes: true, estrela: true, cor: 0x1b5e3a });
      arvore.position.set(0, -2, zMin - 18);
      raiz.add(arvore);
    },
  },

  atelie: {
    mundo: 'Hobbies',
    ceu: 0xffe5ec, neblina: [0xffe5ec, 35, 100],
    luz: { ceu: 0xffffff, chao: 0xc9a0a0, forca: 1.3, sol: 0xfff7e6, forcaSol: 2.2 },
    chao: ['madeiraMesa', 'xadrez'], margem: ['madeiraMesa', 'madeiraMesa'], plataforma: ['madeiraMesa', 'xadrez'],
    baixo: { cor: 0xcdb4db, opacidade: 1 },
    flor: 0xff4d6d, musica: 'atelie',
    enfeite(rnd, dist) {
      const r = rnd();
      if (r < 0.2) return carretelGigante(rnd);
      if (r < 0.35) return alfinete(rnd);
      if (r < 0.48) return botao(rnd);
      if (r < 0.62) return lapis(rnd);
      if (r < 0.75 && dist > 2) return manequim(rnd);
      if (r < 0.8 && dist > 4) { const t = tesoura(); t.rotation.y = rnd() * 6; return t; }
      if (r < 0.9) return criarPudim(false);
      return carretelGigante(rnd);
    },
    beirada: null,
    fundo(raiz, zMin, zMax, rnd) {
      paredes(raiz, zMin, zMax, { cor: 0xfde2e4, altura: 40, distancia: 30 });
      for (let z = zMax; z > zMin - 30; z -= 30) {
        const m = maquinaEstatica();
        m.scale.setScalar(9);
        m.position.set((z / 30) % 2 ? -22 : 22, -2, z);
        m.rotation.y = (z / 30) % 2 ? -Math.PI / 2 : Math.PI / 2;
        raiz.add(m);
      }
    },
  },

  rodizio: {
    mundo: 'Hobbies',
    ceu: 0xffb38a, neblina: [0xffcfb0, 35, 110],
    luz: { ceu: 0xfff0e0, chao: 0x8a5a44, forca: 1.3, sol: 0xffd6a5, forcaSol: 2.2 },
    chao: ['laca', 'bambu'], margem: ['laca', 'bambu'], plataforma: ['laca', 'bambu'],
    baixo: { cor: 0x3a86ff, opacidade: 0.85 },
    flor: 0xff006e, musica: 'rodizio',
    enfeite(rnd, dist) {
      const r = rnd();
      if (r < 0.35) return sushi(rnd);
      if (r < 0.45 && dist > 2.5) return panelaEstrogonofe();
      if (r < 0.6) { const p = criarPudim(false); p.scale.setScalar(2.5 + rnd() * 2); return p; }
      if (r < 0.75) { const l = lanterna(rnd() < 0.5 ? 0xe63946 : 0xffb703); l.position.y = 2.5 + rnd(); const g = new THREE.Group(); g.add(l); return g; }
      if (r < 0.85) return criarPinheiro(3, { cor: 0x40916c });
      return arvoreRedonda(rnd, [0xffafcc, 0xffc8dd, 0xffe5ec]); // cerejeira
    },
    beirada: null,
    fundo(raiz, zMin, zMax, rnd) {
      morros(raiz, zMin, zMax, rnd, [0x9d4edd, 0xc77dff, 0x7b2cbf], -8);
      for (let z = zMax - 10; z > zMin; z -= 35) { const p = portalJapones(); p.position.z = z; raiz.add(p); }
      nuvens(raiz, zMin, zMax, rnd, 0xffe5ec);
    },
  },

  fitdance: {
    mundo: 'Hobbies',
    ceu: 0x140a2e, neblina: [0x1b0f3a, 30, 95],
    luz: { ceu: 0xb8a1ff, chao: 0x2b1d50, forca: 1.2, sol: 0xff9de2, forcaSol: 1.5 },
    chao: ['neonLado', 'neon'], margem: ['neonLado', 'neon'], plataforma: ['neonLado', 'neon'], emissivo: true,
    baixo: { cor: 0x0b0620, opacidade: 1 },
    flor: 0x3ef0ff, musica: 'fitdance',
    enfeite(rnd, dist) {
      const r = rnd();
      if (r < 0.25 && dist > 1.5) return caixaDeSom(1.6 + rnd() * 1.6);
      if (r < 0.55 && dist < 6) return criarPessoa(rnd, { roupa: [0xff4ecd, 0x3ef0ff, 0xffd60a, 0x7bf1a8][Math.floor(rnd() * 4)] });
      if (r < 0.65) return holofote([0xff4ecd, 0x3ef0ff, 0xffd60a][Math.floor(rnd() * 3)]);
      if (r < 0.8) { const n = notaMusical([0xff4ecd, 0x3ef0ff][Math.floor(rnd() * 2)]); const g = new THREE.Group(); g.add(n); const f = rnd() * 6; g.userData.animar = (t) => { n.position.y = 2.5 + Math.sin(t * 4.26 + f) * 0.3; }; return g; }
      return caixaDeSom(1.2);
    },
    beirada: null,
    fundo(raiz, zMin, zMax, rnd) {
      predios(raiz, zMin, zMax, rnd);
      estrelas(raiz);
      for (let z = zMax - 15; z > zMin; z -= 40) { const gl = globoEspelhado(); gl.position.set(0, 9, z); raiz.add(gl); }
    },
  },

  loja: {
    mundo: VILAO.nome,
    ceu: 0x4a4e69, neblina: [0x5c6070, 30, 95],
    luz: { ceu: 0xf1f3f5, chao: 0x4a4e69, forca: 1.4, sol: 0xffffff, forcaSol: 1.8 },
    chao: ['faixaPerigo', 'piso'], margem: ['piso', 'piso'], plataforma: ['faixaPerigo', 'piso'],
    baixo: { cor: 0x22223b, opacidade: 1 },
    flor: 0xffd60a, musica: 'loja',
    enfeite(rnd, dist) {
      const r = rnd();
      if (r < 0.4 && dist > 2) { const p = prateleira(rnd); p.rotation.y = Math.PI / 2; return p; }
      if (r < 0.55) return caixaPapelao(rnd);
      if (r < 0.7) return maquinaEstatica();
      if (r < 0.8 && dist > 2) return placa([['PROMOÇÃO!'], ['BATA A META!'], ['HORA EXTRA'], ['SEM FOLGA'], ['NÃO PODE', 'SENTAR']][Math.floor(rnd() * 5)], { largura: 2.4, altura: 1.1, poste: 1.6 });
      return caixaPapelao(rnd);
    },
    beirada: null,
    fundo(raiz, zMin, zMax, rnd) {
      paredes(raiz, zMin, zMax, { cor: 0xadb5bd, altura: 30, distancia: 22, enfeite: () => placa(VILAO.nome, { largura: 5, altura: 1.6, poste: 6, fundo: VILAO.css.principal }) });
      for (let z = zMax; z > zMin - 30; z -= 12) {
        const luz = malha(new THREE.BoxGeometry(6, 0.15, 0.6), brilho(0xffffff, 1.5), 0, 14, z);
        raiz.add(luz);
      }
    },
  },

  casamento: {
    mundo: 'Casamento',
    ceu: 0xffc4d6, neblina: [0xffd6e0, 35, 120],
    luz: { ceu: 0xfff0f5, chao: 0x9a7b8f, forca: 1.35, sol: 0xffd6a5, forcaSol: 2.3 },
    chao: ['terra', 'gramaFlorida'], margem: ['terra', 'gramaFlorida'], plataforma: ['nuvem', 'nuvem'],
    baixo: { cor: 0xffafcc, opacidade: 0.9 },
    flor: 0xffffff, musica: 'casamento',
    enfeite(rnd, dist) {
      const r = rnd();
      if (dist < 4 && r < 0.45) { const c = cadeiraConvidado(rnd); return c; }
      if (r < 0.65) return criarPinheiro(3 + rnd() * 3, { luzes: true, estrela: rnd() < 0.3 });
      if (r < 0.75) return balao(rnd, [0xffffff, 0xffafcc, 0xffd166]);
      if (r < 0.85) { const c = coracao([0xff4d6d, 0xffafcc][Math.floor(rnd() * 2)], 0.6); c.position.y = 2 + rnd() * 2; const g = new THREE.Group(); g.add(c); const f = rnd() * 6; g.userData.animar = (t) => { c.rotation.y = t + f; c.position.y = 2.5 + Math.sin(t * 2 + f) * 0.3; }; return g; }
      return arbusto(rnd, 0x52b788, true);
    },
    beirada: null,
    tapete: true,
    fundo(raiz, zMin, zMax, rnd) {
      morros(raiz, zMin, zMax, rnd, [0xffafcc, 0xcdb4db, 0xffc8dd]);
      nuvens(raiz, zMin, zMax, rnd, 0xfff0f5);
      const sol = new THREE.Mesh(new THREE.CircleGeometry(12, 32), new THREE.MeshBasicMaterial({ color: 0xffd6a5, fog: false }));
      sol.position.set(0, 18, zMin - 120);
      raiz.add(sol);
    },
  },
};

// ---------- Fase bônus: férias na praia ----------

function coqueiro(rnd) {
  const g = new THREE.Group();
  const h = 3.2 + rnd() * 1.8, curva = (rnd() - 0.5) * 0.8;
  const tronco = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(curva * 0.5, h * 0.5, 0), new THREE.Vector3(curva, h, 0)]);
  g.add(malha(new THREE.TubeGeometry(tronco, 10, 0.16, 7, false), toon(0xa47148)));
  for (let i = 0; i < 7; i++) {
    const folha = malha(new THREE.ConeGeometry(0.28, 2.2, 4), toon(i % 2 ? 0x2d6a4f : 0x40916c), curva, h, 0);
    folha.geometry.translate(0, 1.1, 0);
    folha.rotation.set(1.9, (i / 7) * Math.PI * 2, 0, 'YXZ');
    folha.scale.z = 0.25;
    g.add(folha);
  }
  for (let i = 0; i < 3; i++) g.add(malha(new THREE.SphereGeometry(0.15, 8, 6), toon(0x6b4226), curva + Math.cos(i * 2.1) * 0.18, h - 0.15, Math.sin(i * 2.1) * 0.18));
  return g;
}

function guardaSol(rnd) {
  const g = new THREE.Group();
  const cores = [[0xff4d6d, 0xffffff], [0x4cc9f0, 0xffffff], [0xffd166, 0xff8fab], [0x52b788, 0xfff3b0]][Math.floor(rnd() * 4)];
  g.add(malha(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 6), toon(0xf1f1f1), 0, 1.15, 0));
  for (let i = 0; i < 8; i++) {
    const gomo = malha(new THREE.ConeGeometry(1.3, 0.5, 3, 1, true, (i / 8) * Math.PI * 2, Math.PI / 4 + 0.01), toon(cores[i % 2], { side: THREE.DoubleSide }), 0, 2.3, 0);
    g.add(gomo);
  }
  g.rotation.z = (rnd() - 0.5) * 0.25;
  return g;
}

function cadeiraPraia(rnd) {
  const g = new THREE.Group();
  const tecido = toon([0xff8fab, 0x4cc9f0, 0xffd166][Math.floor(rnd() * 3)]);
  const assento = malha(new THREE.BoxGeometry(0.6, 0.05, 0.9), tecido, 0, 0.3, 0);
  g.add(assento);
  const encosto = malha(new THREE.BoxGeometry(0.6, 0.05, 0.8), tecido, 0, 0.6, -0.65);
  encosto.rotation.x = -0.9;
  g.add(encosto);
  for (const x of [-0.3, 0.3]) for (const z of [-0.4, 0.4]) g.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 4), toon(0xdddddd), x, 0.15, z));
  return g;
}

function casteloAreia(rnd) {
  const g = new THREE.Group();
  const areia = toon(0xe9c46a);
  g.add(malha(new THREE.CylinderGeometry(0.7, 0.8, 0.5, 10), areia, 0, 0.25, 0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    g.add(malha(new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8), areia, Math.cos(a) * 0.5, 0.75, Math.sin(a) * 0.5));
    g.add(malha(new THREE.ConeGeometry(0.22, 0.3, 8), areia, Math.cos(a) * 0.5, 1.2, Math.sin(a) * 0.5));
  }
  g.add(malha(new THREE.CylinderGeometry(0.28, 0.3, 0.9, 8), areia, 0, 0.9, 0));
  g.add(malha(new THREE.CylinderGeometry(0.01, 0.01, 0.4, 3), toon(0x6b4226), 0, 1.55, 0));
  g.add(malha(new THREE.BoxGeometry(0.2, 0.12, 0.01), toon(0xff4d6d), 0.1, 1.68, 0));
  return g;
}

function boia(rnd) {
  const g = new THREE.Group();
  const b = malha(new THREE.TorusGeometry(0.4, 0.16, 10, 18), toon([0xff4d6d, 0xffd166, 0x4cc9f0][Math.floor(rnd() * 3)]), 0, 0.16, 0);
  b.rotation.x = Math.PI / 2;
  g.add(b);
  return g;
}

function bolaPraia(rnd) {
  const g = new THREE.Group();
  const cores = [0xff4d6d, 0xffffff, 0x4cc9f0, 0xffd166, 0x52b788, 0xffffff];
  for (let i = 0; i < 6; i++) g.add(malha(new THREE.SphereGeometry(0.35, 12, 10, (i / 6) * Math.PI * 2, Math.PI / 3), toon(cores[i]), 0, 0.35, 0));
  return g;
}

function prancha(rnd) {
  const g = new THREE.Group();
  const p = malha(new THREE.CapsuleGeometry(0.28, 1.6, 4, 10), toon([0x4cc9f0, 0xff8fab, 0xffd166][Math.floor(rnd() * 3)]), 0, 1.1, 0);
  p.scale.z = 0.25;
  p.rotation.z = 0.15;
  g.add(p);
  return g;
}

function estrelaMar(rnd) {
  const forma = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.12 : 0.3, a = (i / 10) * Math.PI * 2;
    if (i === 0) forma.moveTo(Math.cos(a) * r, Math.sin(a) * r); else forma.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const m = malha(new THREE.ExtrudeGeometry(forma, { depth: 0.06, bevelEnabled: false }), toon(0xf77f00));
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.02;
  const g = new THREE.Group(); g.add(m);
  return g;
}

function mar(raiz, zMin, zMax) {
  for (const lado of [-1, 1]) {
    const agua = new THREE.Mesh(new THREE.PlaneGeometry(120, zMax - zMin + 200), new THREE.MeshLambertMaterial({ color: 0x29b6d6 }));
    agua.rotation.x = -Math.PI / 2;
    agua.position.set(lado * 85, -1.2, (zMax + zMin) / 2);
    raiz.add(agua);
    const espuma = new THREE.Mesh(new THREE.PlaneGeometry(3, zMax - zMin + 200), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }));
    espuma.rotation.x = -Math.PI / 2;
    espuma.position.set(lado * 26, -1.1, (zMax + zMin) / 2);
    raiz.add(espuma);
  }
}

TEMAS.ferias = {
  mundo: 'Férias',
  ceu: 0x7fd3f7, neblina: [0xbfe9ff, 35, 130],
  luz: { ceu: 0xffffff, chao: 0xc9a66b, forca: 1.4, sol: 0xfff3d6, forcaSol: 2.5 },
  chao: ['areiaLado', 'areia'], margem: ['areiaLado', 'areia'], plataforma: ['madeiraMesa', 'madeiraMesa'],
  baixo: { cor: 0x1fa2c4, opacidade: 0.95 },
  flor: 0xff4d6d, musica: 'ferias',
  enfeite(rnd, dist) {
    const r = rnd();
    if (r < 0.28) return coqueiro(rnd);
    if (r < 0.42) return guardaSol(rnd);
    if (r < 0.52) return cadeiraPraia(rnd);
    if (r < 0.6) return casteloAreia(rnd);
    if (r < 0.68) return boia(rnd);
    if (r < 0.75) return bolaPraia(rnd);
    if (r < 0.81) return prancha(rnd);
    if (r < 0.88 && dist < 4) return criarPessoa(rnd, { roupa: [0xff4d6d, 0x4cc9f0, 0xffd166, 0x52b788][Math.floor(rnd() * 4)] });
    return estrelaMar(rnd);
  },
  beirada: null,
  fundo(raiz, zMin, zMax, rnd) {
    mar(raiz, zMin, zMax);
    nuvens(raiz, zMin, zMax, rnd);
    const sol = new THREE.Mesh(new THREE.CircleGeometry(9, 32), new THREE.MeshBasicMaterial({ color: 0xffe066, fog: false }));
    sol.position.set(30, 45, zMin - 110);
    raiz.add(sol);
    for (let z = zMax - 30; z > zMin - 40; z -= 55) {
      const ilha = new THREE.Group();
      const morro = malha(new THREE.SphereGeometry(6, 14, 10), toon(0x52b788), 0, -2.5, 0);
      morro.scale.y = 0.5;
      ilha.add(morro);
      for (let i = 0; i < 3; i++) { const c = coqueiro(rnd); c.position.set(-2 + i * 2, 0, (rnd() - 0.5) * 2); ilha.add(c); }
      ilha.position.set((z / 55) % 2 ? -60 : 60, -1, z);
      raiz.add(ilha);
    }
  },
};

// ---------- Plaquinhas das fases ----------
// Placa de madeira arredondada, com a cor do mundo, ícone, texto em duas linhas e florzinhas no pé.
const ESTILO_PLACA = {
  familia:   { madeira: 0x9c6644, fundo: '#fff8ec', borda: '#9c6644', texto: '#6b3b12', flor: 0xff4d6d },
  igreja:    { madeira: 0x5a3e6b, fundo: '#f7f0ff', borda: '#7b2cbf', texto: '#3c096c', flor: 0xffd166 },
  atelie:    { madeira: 0xd291bc, fundo: '#fff0f6', borda: '#e0457b', texto: '#8a1c4a', flor: 0xff8fab },
  rodizio:   { madeira: 0x9d0208, fundo: '#fff7e6', borda: '#9d0208', texto: '#6a040f', flor: 0xffb703 },
  fitdance:  { madeira: 0x240046, fundo: '#1b1035', borda: '#ff4ecd', texto: '#3ef0ff', flor: 0x3ef0ff, brilho: true },
  loja:      { madeira: 0x495057, fundo: '#fffbe6', borda: '#d62828', texto: '#1d3557', flor: 0xffd60a },
  natal:     { madeira: 0x7f2c1b, fundo: '#fffaf5', borda: '#c1121f', texto: '#1b5e3a', flor: 0xd62828, neve: true },
  casamento: { madeira: 0xf1e3d3, fundo: '#fffdf8', borda: '#e9c46a', texto: '#9d174d', flor: 0xffffff },
  ferias:    { madeira: 0xd4a373, fundo: '#fffaf0', borda: '#0096c7', texto: '#005f73', flor: 0xff4d6d },
};

export function placaFase(texto, icone, temaNome) {
  const e = ESTILO_PLACA[temaNome] ?? ESTILO_PLACA.familia;
  const g = new THREE.Group();
  const madeira = toon(e.madeira);
  g.add(malha(new THREE.CylinderGeometry(0.08, 0.1, 1.5, 8), madeira, 0, 0.75, 0));
  g.add(malha(caixaArredondada(2.5, 1.25, 0.16, 0.05), madeira, 0, 1.95, 0));
  const linhas = [].concat(texto);
  const tex = textura(256, (c, w, h) => {
    c.fillStyle = e.fundo; c.fillRect(0, 0, w, h);
    c.strokeStyle = e.borda; c.lineWidth = 10; c.setLineDash([18, 10]);
    c.strokeRect(14, 14, w - 28, h - 28);
    c.setLineDash([]);
    const temIcone = !!icone;
    if (temIcone) { c.font = '96px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(icone, 82, h / 2 + 4); }
    c.fillStyle = e.texto; c.textAlign = temIcone ? 'left' : 'center'; c.textBaseline = 'middle';
    const x = temIcone ? 150 : w / 2;
    const maxW = w - x - (temIcone ? 26 : w / 2 - 26);
    linhas.forEach((l, i) => {
      let tam = i === 0 ? 62 : 48;
      do { c.font = `${i === 0 ? 800 : 600} ${tam}px "Baloo 2","Trebuchet MS",sans-serif`; tam -= 2; } while (c.measureText(l).width > (temIcone ? w - x - 30 : maxW * 2) && tam > 20);
      c.fillText(l, x, h / 2 + (i - (linhas.length - 1) / 2) * 76);
    });
  }, { largura: 512, suave: true });
  const frente = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.12),
    e.brilho ? new THREE.MeshBasicMaterial({ map: tex }) : new THREE.MeshLambertMaterial({ map: tex }));
  frente.position.set(0, 1.95, 0.1);
  frente.userData.semContorno = true;
  g.add(frente);
  if (e.neve) {
    const neve = malha(caixaArredondada(2.6, 0.16, 0.24, 0.07), toon(0xffffff), 0, 2.6, 0);
    g.add(neve);
  }
  // florzinhas no pé da placa
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const flor = criarFlor(e.flor);
    flor.scale.setScalar(0.55);
    flor.position.set(Math.cos(a) * 0.35, 0.12, Math.sin(a) * 0.35);
    g.add(flor);
  }
  contornar(g, 0.012);
  return g;
}

export function materiaisDe(lado, topo) { return [matChao(lado), matChao(topo)]; }

export function materiaisTema(tema, qual = 'chao') {
  const [lado, topo] = tema[qual];
  return [matChao(lado, !!tema.emissivo), matChao(topo, !!tema.emissivo)];
}

export { coracao, criarFlor, placa };
