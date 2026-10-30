// A Bia: cabelo escuro longo e ondulado, vestido (três opções, inspiradas nas fotos), brincos e colar.
// Proporção "chibi" (cabeça grande) para ficar fofa e legível de longe.
import * as THREE from 'three';
import { toon, malha, contornar, textura, desenharFlor, aleatorio } from '../estilo3d.js';

const PELE = 0xf3cdb0;
const CABELO = 0x2e1a14;
const LABIOS = 0xc0485f;
const OURO = 0xf2c14e;

function tecidoFlorido() {
  return textura(256, (g, w, h) => {
    const rnd = aleatorio(11);
    g.fillStyle = '#f4e6d4'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = rnd() * w, y = rnd() * h;
      g.fillStyle = '#8a5a3a';
      g.beginPath(); g.ellipse(x + 9, y + 4, 6, 2.5, rnd() * 3, 0, 7); g.fill();
      desenharFlor(g, x, y, 7 + rnd() * 5, rnd() < 0.5 ? '#e07a3f' : '#c0392b', '#7a3b1e');
    }
  }, { repetir: true, suave: true });
}

function tecidoAzul() {
  return textura(256, (g, w, h) => {
    const rnd = aleatorio(5);
    g.fillStyle = '#eef2fa'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w, y = rnd() * h;
      g.fillStyle = '#2c3e66';
      for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x + (rnd() - 0.5) * 30, y + (rnd() - 0.5) * 30, 14, 5, rnd() * 3, 0, 7); g.fill(); }
      desenharFlor(g, x, y, 16 + rnd() * 8, rnd() < 0.5 ? '#4a6fa5' : '#9db4d8', '#1d2b4a', 6);
    }
  }, { repetir: true, suave: true });
}

function tecidoVerde() {
  return textura(64, (g, w, h) => {
    g.fillStyle = '#56722f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#4b6528';
    for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h);
  }, { repetir: true, suave: true });
}

function tecidoCouro() {
  return textura(64, (g, w, h) => {
    g.fillStyle = '#231a17'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 40; i++) g.fillRect((i * 37) % w, (i * 23) % h, 6, 2);
    g.fillStyle = '#3a2c26'; g.fillRect(0, h - 4, w, 2);
  }, { repetir: true, suave: true });
}

function tecidoJeans() {
  return textura(64, (g, w, h) => {
    g.fillStyle = '#3d5a80'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
    for (let i = -h; i < w; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); }
    g.fillStyle = 'rgba(152,193,217,0.25)'; g.fillRect(w * 0.3, 0, w * 0.25, h);
  }, { repetir: true, suave: true });
}

// manga: 'flare' (3/4 bufante), 'longa' ou 'curta'. saia: altura da barra.
export const ROUPAS = {
  florido: { nome: 'Vestido florido', tecido: tecidoFlorido, manga: 'flare', barra: 0.42, cinto: null, repete: [9, 2] },
  verde: { nome: 'Vestido verde longo', tecido: tecidoVerde, manga: 'longa', barra: 0.1, cinto: 0x3f5622, repete: [6, 1] },
  azul: { nome: 'Vestido azul floral', tecido: tecidoAzul, manga: 'curta', barra: 0.3, cinto: null, repete: [6, 2] },
  jaqueta: { nome: 'Jaqueta de couro e jeans', tecido: tecidoCouro, manga: 'longa', barra: 0.6, cinto: 0x5c4033, repete: [4, 2], calca: tecidoJeans },
};

let materialJeans;
function jeans() {
  if (!materialJeans) {
    const t = tecidoJeans();
    t.repeat.set(2, 2);
    materialJeans = toon(0xffffff, { map: t });
  }
  return materialJeans;
}

const texturasRoupa = {};
function materialRoupa(chave) {
  if (!texturasRoupa[chave]) {
    const r = ROUPAS[chave];
    const t = r.tecido();
    t.repeat.set(...r.repete);
    texturasRoupa[chave] = toon(0xffffff, { map: t, side: THREE.DoubleSide });
  }
  return texturasRoupa[chave];
}

function torno(pontos, segmentos = 28) {
  return new THREE.LatheGeometry(pontos.map(([r, y]) => new THREE.Vector2(r, y)), segmentos);
}

function tuboOndulado(pontos, raio, segmentos = 32) {
  const curva = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curva, segmentos, raio, 8, false);
}

export function criarBia(roupaEscolhida = 'florido') {
  const roupa = ROUPAS[roupaEscolhida] ?? ROUPAS.florido;
  const tecido = materialRoupa(roupaEscolhida in ROUPAS ? roupaEscolhida : 'florido');
  const pele = toon(PELE), cabelo = toon(CABELO), ouro = toon(OURO, { emissive: 0x5a3a00, emissiveIntensity: 0.3 });

  const raiz = new THREE.Group();
  const corpo = new THREE.Group();
  raiz.add(corpo);

  // Pernas e sandálias
  const pernas = [];
  for (const lado of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(lado * 0.09, 0.6, 0);
    if (roupa.calca) {
      // calça jeans e botinha preta
      pivo.add(malha(new THREE.CapsuleGeometry(0.068, 0.42, 4, 10), jeans(), 0, -0.25, 0));
      pivo.add(malha(new THREE.CylinderGeometry(0.07, 0.065, 0.14, 12), toon(0x1b1b1b), 0, -0.49, 0));
      const bico = malha(new THREE.SphereGeometry(0.07, 12, 8), toon(0x1b1b1b), 0, -0.55, 0.04);
      bico.scale.set(0.9, 0.55, 1.4);
      pivo.add(bico);
    } else {
      pivo.add(malha(new THREE.CapsuleGeometry(0.06, 0.44, 4, 10), pele, 0, -0.27, 0));
      const sapato = malha(new THREE.SphereGeometry(0.07, 12, 8), toon(0xe9b7a1), 0, -0.55, 0.035);
      sapato.scale.set(0.9, 0.55, 1.4);
      pivo.add(sapato);
    }
    corpo.add(pivo);
    pernas.push(pivo);
  }

  // Vestido: tronco + saia (a saia abre quando ela gira)
  const perfilTronco = [[0.2, 0.72], [0.215, 0.78], [0.24, 0.86], [0.245, 0.9], [0.228, 0.96], [0.185, 1.0], [0.11, 1.035], [0.075, 1.04]];
  let saia;
  if (roupa.calca) {
    // camiseta branca por baixo e jaqueta aberta na frente
    corpo.add(malha(torno(perfilTronco.map(([r, y]) => [r * 0.97, y])), toon(0xf8f4ec)));
    const jaqueta = perfilTronco.map(([r, y]) => [r + 0.012, y]);
    jaqueta.unshift([0.232, 0.7]);
    corpo.add(malha(new THREE.LatheGeometry(jaqueta.map(([r, y]) => new THREE.Vector2(r, y)), 28, 0.42, Math.PI * 2 - 0.84), tecido));
    saia = malha(torno([[0.235, 0.58], [0.24, 0.64], [0.22, 0.71], [0.205, 0.76]]), jeans());
  } else {
    corpo.add(malha(torno(perfilTronco), tecido));
    const barra = roupa.barra;
    const meio = (0.74 + barra) / 2;
    saia = malha(torno([[0.37 + (0.42 - barra) * 0.2, barra], [0.35, barra + 0.03], [0.31, meio - 0.05], [0.26, meio + 0.06], [0.215, 0.7], [0.2, 0.76]]), tecido);
  }
  corpo.add(saia);
  if (roupa.cinto) {
    const cinto = malha(new THREE.TorusGeometry(0.205, 0.022, 6, 28), toon(roupa.cinto), 0, 0.75, 0);
    cinto.rotation.x = Math.PI / 2;
    corpo.add(cinto);
  }
  // decote em V
  const decote = new THREE.Shape();
  decote.moveTo(-0.075, 0); decote.lineTo(0.075, 0); decote.lineTo(0, -0.1); decote.closePath();
  const v = malha(new THREE.ShapeGeometry(decote), toon(PELE, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 1.035, 0.17);
  v.rotation.x = -0.55;
  v.userData.semContorno = true;
  corpo.add(v);

  // Braços
  const bracos = [];
  for (const lado of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(lado * 0.215, 0.965, 0);
    pivo.rotation.z = lado * 0.12;
    if (roupa.manga === 'flare') {
      pivo.add(malha(new THREE.CylinderGeometry(0.06, 0.12, 0.34, 14, 1, true), tecido, 0, -0.17, 0));
      pivo.add(malha(new THREE.CapsuleGeometry(0.042, 0.16, 4, 8), pele, 0, -0.34, 0));
    } else if (roupa.manga === 'longa') {
      pivo.add(malha(new THREE.CapsuleGeometry(0.058, 0.3, 4, 10), tecido, 0, -0.2, 0));
      pivo.add(malha(new THREE.CapsuleGeometry(0.042, 0.06, 4, 8), pele, 0, -0.39, 0));
    } else {
      pivo.add(malha(new THREE.CylinderGeometry(0.065, 0.08, 0.15, 12, 1, true), tecido, 0, -0.06, 0));
      pivo.add(malha(new THREE.CapsuleGeometry(0.045, 0.3, 4, 8), pele, 0, -0.24, 0));
    }
    pivo.add(malha(new THREE.SphereGeometry(0.05, 10, 8), pele, 0, -0.45, 0));
    corpo.add(pivo);
    bracos.push(pivo);
  }

  // Pescoço, colar e cabeça
  corpo.add(malha(new THREE.CylinderGeometry(0.048, 0.055, 0.12, 10), pele, 0, 1.08, 0));
  const colar = malha(new THREE.TorusGeometry(0.075, 0.007, 5, 20), ouro, 0, 1.055, 0.015);
  colar.rotation.x = Math.PI / 2 + 0.35;
  colar.userData.semContorno = true;
  corpo.add(colar);

  const cabeca = new THREE.Group();
  cabeca.position.set(0, 1.27, 0);
  cabeca.scale.setScalar(1.08);
  corpo.add(cabeca);
  const cranio = malha(new THREE.SphereGeometry(0.2, 26, 18), pele);
  cranio.scale.set(1.03, 1.04, 0.97);
  cabeca.add(cranio);

  const detalhe = (m) => { m.userData.semContorno = true; m.castShadow = false; return m; };
  const preto = toon(0x2a160f), branco = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const lado of [-1, 1]) {
    const olho = detalhe(malha(new THREE.SphereGeometry(0.05, 12, 10), toon(0x3b2016), lado * 0.08, 0.0, 0.166));
    olho.scale.set(0.78, 1.05, 0.4);
    cabeca.add(olho);
    cabeca.add(detalhe(malha(new THREE.SphereGeometry(0.012, 6, 5), branco, lado * 0.08 - 0.014, 0.018, 0.186)));
    const cilios = detalhe(malha(new THREE.TorusGeometry(0.043, 0.0075, 4, 10, Math.PI * 0.8), preto, lado * 0.08, 0.004, 0.17));
    cilios.rotation.z = Math.PI * 0.1 + (lado > 0 ? 0 : 0);
    cabeca.add(cilios);
    const sobrancelha = detalhe(malha(new THREE.CapsuleGeometry(0.008, 0.045, 3, 6), preto, lado * 0.078, 0.075, 0.178));
    sobrancelha.rotation.z = Math.PI / 2 + lado * 0.2;
    cabeca.add(sobrancelha);
    const bochecha = detalhe(malha(new THREE.CircleGeometry(0.03, 14), new THREE.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.45 }), lado * 0.12, -0.045, 0.158));
    bochecha.rotation.y = lado * 0.65;
    cabeca.add(bochecha);
    cabeca.add(malha(new THREE.SphereGeometry(0.035, 8, 6), pele, lado * 0.198, -0.01, 0));
    cabeca.add(detalhe(malha(new THREE.SphereGeometry(0.016, 8, 6), ouro, lado * 0.2, -0.06, 0.012)));
  }
  cabeca.add(detalhe(malha(new THREE.SphereGeometry(0.017, 8, 6), toon(0xe9b394), 0, -0.035, 0.198)));
  const boca = detalhe(malha(new THREE.TorusGeometry(0.038, 0.01, 5, 12, Math.PI), toon(LABIOS), 0, -0.08, 0.183));
  boca.rotation.z = Math.PI;
  cabeca.add(boca);

  // Cabelo: calota, franja de lado e mechas longas onduladas
  const cabeloGrupo = new THREE.Group();
  cabeca.add(cabeloGrupo);
  const calota = malha(new THREE.SphereGeometry(0.218, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), cabelo, 0, 0.012, -0.012);
  calota.rotation.x = -0.42;
  cabeloGrupo.add(calota);
  const nuca = malha(new THREE.SphereGeometry(0.205, 18, 14), cabelo, 0, -0.03, -0.1);
  nuca.scale.set(1.04, 1.08, 0.85);
  cabeloGrupo.add(nuca);
  cabeloGrupo.add(malha(tuboOndulado([[-0.07, 0.2, 0.1], [0.02, 0.17, 0.17], [0.12, 0.11, 0.17], [0.19, 0.02, 0.1]], 0.05, 20), cabelo));
  cabeloGrupo.add(malha(tuboOndulado([[-0.1, 0.18, 0.1], [-0.17, 0.08, 0.13], [-0.2, -0.04, 0.09]], 0.04, 14), cabelo));
  const mechas = [];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const a = Math.PI + (i / (N - 1) - 0.5) * Math.PI * 1.15; // em volta da nuca
    const ondas = [];
    const comprimento = 0.62 + Math.sin(i * 1.7) * 0.05;
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const r = 0.19 + t * 0.07;
      const desvio = Math.sin(t * Math.PI * 2.5 + i) * 0.035 * t;
      ondas.push([Math.sin(a) * r + Math.cos(a) * desvio, 0.06 - t * comprimento, Math.cos(a) * r - Math.sin(a) * desvio]);
    }
    const mecha = malha(tuboOndulado(ondas, 0.058 - Math.abs(i / (N - 1) - 0.5) * 0.02), cabelo);
    cabeloGrupo.add(mecha);
    const ponta = malha(new THREE.SphereGeometry(0.05, 8, 6), cabelo, ...ondas[ondas.length - 1]);
    cabeloGrupo.add(ponta);
    mechas.push(mecha);
  }
  // mechas da frente caindo sobre os ombros
  for (const lado of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      pts.push([lado * (0.18 + t * 0.06), 0.02 - t * 0.5, 0.06 + t * 0.06 + Math.sin(t * 7) * 0.02]);
    }
    cabeloGrupo.add(malha(tuboOndulado(pts, 0.045), cabelo));
  }

  contornar(raiz, 0.012);
  raiz.userData = { corpo, pernas, bracos, saia, cabeca, cabeloGrupo, calca: !!roupa.calca };
  return raiz;
}

// Anima a Bia conforme o estado do jogador.
export function animarBia(modelo, estado, tempo, dt) {
  const { corpo, pernas, bracos, saia, cabeca, cabeloGrupo, calca } = modelo.userData;
  if (!corpo) return;
  const suave = (atual, alvo, f = 12) => atual + (alvo - atual) * Math.min(dt * f, 1);
  const correndo = estado.noChao && estado.velocidadeChao > 0.5;
  const fase = tempo * 13;

  pernas.forEach((p, i) => {
    const s = i === 0 ? 1 : -1;
    const alvo = correndo ? Math.sin(fase) * 0.75 * s : estado.noChao ? 0 : (i === 0 ? -0.6 : 0.35);
    p.rotation.x = suave(p.rotation.x, alvo, 18);
  });

  bracos.forEach((b, i) => {
    const lado = i === 0 ? -1 : 1;
    let abre = 0.12, frente = 0;
    if (estado.girando) abre = 1.45;
    else if (!estado.noChao) { abre = 0.9; frente = -0.5; }
    else if (correndo) frente = -Math.sin(fase) * 0.7 * (i === 0 ? 1 : -1);
    else abre = 0.14 + Math.sin(tempo * 2) * 0.03;
    b.rotation.z = suave(b.rotation.z, lado * abre, 14);
    b.rotation.x = suave(b.rotation.x, frente, 14);
  });

  corpo.position.y = correndo ? Math.abs(Math.sin(fase)) * 0.05 : Math.sin(tempo * 2.2) * 0.008;
  cabeca.rotation.x = suave(cabeca.rotation.x, estado.noChao ? 0 : -0.15);
  cabeca.rotation.z = correndo ? Math.sin(fase) * 0.04 : Math.sin(tempo * 1.3) * 0.03;

  if (estado.girando) {
    corpo.rotation.y += dt * 26;
    saia.scale.x = saia.scale.z = suave(saia.scale.x, calca ? 1.03 : 1.35, 20);
    saia.scale.y = suave(saia.scale.y, calca ? 1 : 0.82, 20);
    cabeloGrupo.scale.x = cabeloGrupo.scale.z = suave(cabeloGrupo.scale.x, 1.18, 20);
  } else {
    corpo.rotation.y = suave(corpo.rotation.y % (Math.PI * 2), 0, 10);
    saia.scale.x = saia.scale.z = suave(saia.scale.x, 1 + (correndo ? 0.03 : 0));
    saia.scale.y = suave(saia.scale.y, 1);
    saia.rotation.z = correndo ? Math.sin(fase) * 0.05 : 0;
    cabeloGrupo.scale.x = cabeloGrupo.scale.z = suave(cabeloGrupo.scale.x, 1);
  }
  const vento = correndo ? 0.18 : !estado.noChao ? (estado.vy > 0 ? -0.1 : 0.25) : 0.02;
  cabeloGrupo.rotation.x = suave(cabeloGrupo.rotation.x, vento, 6);
}
