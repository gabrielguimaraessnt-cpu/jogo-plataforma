// Ferramentas de visual: materiais em estilo desenho animado (toon), contorno escuro,
// texturas pintadas em canvas e formas arredondadas.
import * as THREE from 'three';

// Três faixas de luz: sombra, meio-tom e luz. Dá o visual de desenho.
const gradiente = (() => {
  const dados = new Uint8Array([90, 170, 255]);
  const t = new THREE.DataTexture(dados, 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const cache = new Map();
export function toon(cor, extra = {}) {
  const chave = cor + JSON.stringify(extra, (k, v) => (v?.isTexture ? v.uuid : v));
  if (!cache.has(chave)) cache.set(chave, new THREE.MeshToonMaterial({ color: cor, gradientMap: gradiente, ...extra }));
  return cache.get(chave);
}

export function brilho(cor, intensidade = 1) {
  return toon(cor, { emissive: cor, emissiveIntensity: intensidade });
}

export function malha(geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

// Contorno escuro "por fora" (técnica do casco invertido). Só para peças principais.
const matContorno = new THREE.MeshBasicMaterial({ color: 0x2a1a22, side: THREE.BackSide });
export function contornar(objeto, espessura = 0.018) {
  const alvos = [];
  objeto.traverse((o) => { if (o.isMesh && !o.userData.semContorno) alvos.push(o); });
  for (const m of alvos) {
    const geo = m.geometry.clone();
    if (!geo.attributes.normal) geo.computeVertexNormals();
    const pos = geo.attributes.position, nor = geo.attributes.normal;
    const escala = new THREE.Vector3();
    m.getWorldScale(escala);
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i,
        pos.getX(i) + nor.getX(i) * espessura / escala.x,
        pos.getY(i) + nor.getY(i) * espessura / escala.y,
        pos.getZ(i) + nor.getZ(i) * espessura / escala.z);
    }
    const c = new THREE.Mesh(geo, matContorno);
    c.userData.semContorno = true;
    c.castShadow = false;
    m.add(c);
  }
  return objeto;
}

export function textura(tamanho, desenhar, { repetir = false, suave = false, largura = tamanho } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = tamanho;
  const g = canvas.getContext('2d');
  desenhar(g, largura, tamanho);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (!suave) t.magFilter = THREE.NearestFilter;
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

export function salpicar(g, w, h, n, cores, tam, rnd) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = cores[Math.floor(rnd() * cores.length)];
    g.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), tam, tam);
  }
}

// Florzinha desenhada (para estampas de vestido, papel de presente etc.)
export function desenharFlor(g, x, y, r, corPetala, corMiolo, petalas = 5) {
  g.fillStyle = corPetala;
  for (let i = 0; i < petalas; i++) {
    const a = (i / petalas) * Math.PI * 2;
    g.beginPath();
    g.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.5, r * 0.32, a, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = corMiolo;
  g.beginPath(); g.arc(x, y, r * 0.28, 0, Math.PI * 2); g.fill();
}

// Caixa com cantos arredondados (fica bem menos "quadradona").
export function caixaArredondada(w, h, d, r = 0.08, segmentos = 3) {
  const forma = new THREE.Shape();
  const x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
  forma.moveTo(x, y - r);
  forma.lineTo(x + ww, y - r);
  forma.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y);
  forma.lineTo(x + ww + r, y + hh);
  forma.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
  forma.lineTo(x, y + hh + r);
  forma.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh);
  forma.lineTo(x - r, y);
  forma.quadraticCurveTo(x - r, y - r, x, y - r);
  const geo = new THREE.ExtrudeGeometry(forma, {
    depth: Math.max(d - 2 * r, 0.001), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.98, bevelSegments: segmentos, curveSegments: segmentos,
  });
  geo.translate(0, 0, -(d - 2 * r) / 2);
  geo.computeVertexNormals();
  return geo;
}

// Texto pintado numa placa (letreiros, logos).
export function texturaTexto(linhas, { largura = 512, altura = 256, fundo = '#ffffff', cor = '#222', fonte = 'bold 80px "Trebuchet MS", sans-serif', borda = null } = {}) {
  return textura(altura, (g, w, h) => {
    g.fillStyle = fundo; g.fillRect(0, 0, w, h);
    if (borda) { g.strokeStyle = borda; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); }
    g.fillStyle = cor; g.font = fonte; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lista = [].concat(linhas);
    lista.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lista.length - 1) / 2) * h / (lista.length + 0.6)));
  }, { largura, suave: true });
}
