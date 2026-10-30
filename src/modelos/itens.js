// Coletáveis, caixas (presentes), chegada, pinheiros e pessoas.
import * as THREE from 'three';
import { toon, brilho, malha, contornar, caixaArredondada, texturaTexto, textura } from '../estilo3d.js';
import { VILAO } from '../config.js';

// ---------- Flor (coletável principal) ----------

const prototiposFlor = new Map();
export function criarFlor(cor = 0xe63950) {
  if (!prototiposFlor.has(cor)) {
    const g = new THREE.Group();
    const petala = toon(cor, { emissive: cor, emissiveIntensity: 0.25 });
    const miolo = malha(new THREE.SphereGeometry(0.1, 10, 8), petala, 0, 0.05, 0);
    miolo.scale.set(0.9, 1.1, 0.9);
    g.add(miolo);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = malha(new THREE.SphereGeometry(0.09, 8, 6), petala, Math.cos(a) * 0.09, 0.02, Math.sin(a) * 0.09);
      p.scale.set(1, 0.7, 0.55);
      p.rotation.y = -a;
      p.rotation.z = 0.5;
      g.add(p);
    }
    const verde = toon(0x3c9a46);
    g.add(malha(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 5), verde, 0, -0.15, 0));
    const folha = malha(new THREE.SphereGeometry(0.06, 6, 4), verde, 0.05, -0.14, 0);
    folha.scale.set(1.3, 0.3, 0.6);
    g.add(folha);
    g.scale.setScalar(1.25);
    prototiposFlor.set(cor, g);
  }
  return prototiposFlor.get(cor).clone();
}

// ---------- Aliança (uma escondida em cada fase) ----------

export function criarAlianca() {
  const g = new THREE.Group();
  const ouro = toon(0xffd166, { emissive: 0xb07a00, emissiveIntensity: 0.6 });
  const anel = malha(new THREE.TorusGeometry(0.22, 0.05, 10, 28), ouro);
  g.add(anel);
  const pedra = malha(new THREE.OctahedronGeometry(0.08, 0), brilho(0xdff9ff, 0.8), 0, 0.27, 0);
  pedra.scale.y = 1.3;
  g.add(pedra);
  contornar(g, 0.01);
  return g;
}

// ---------- Pudim (protege de um golpe; vira companheiro) ----------

export function criarPudim(comCarinha = true) {
  const g = new THREE.Group();
  const perfil = [[0.0, 0], [0.24, 0], [0.25, 0.02], [0.2, 0.2], [0.17, 0.23], [0.06, 0.24], [0.06, 0.18], [0.0, 0.18]];
  const corpo = malha(new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(r, y)), 24), toon(0xf6c66b));
  g.add(corpo);
  const calda = malha(new THREE.LatheGeometry([[0.06, 0.245], [0.175, 0.24], [0.205, 0.19], [0.21, 0.15]].map(([r, y]) => new THREE.Vector2(r, y)), 24), toon(0x8a4210, { side: THREE.DoubleSide }));
  g.add(calda);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const pingo = malha(new THREE.CapsuleGeometry(0.025, 0.05 + (i % 3) * 0.03, 3, 6), toon(0x8a4210), Math.cos(a) * 0.205, 0.13 - (i % 3) * 0.015, Math.sin(a) * 0.205);
    g.add(pingo);
  }
  const prato = malha(new THREE.CylinderGeometry(0.32, 0.28, 0.03, 24), toon(0xffffff), 0, -0.015, 0);
  g.add(prato);
  if (comCarinha) {
    for (const lado of [-1, 1]) {
      const olho = malha(new THREE.SphereGeometry(0.025, 8, 6), toon(0x2a160f), lado * 0.07, 0.12, 0.19);
      olho.userData.semContorno = true;
      g.add(olho);
      const b = malha(new THREE.CircleGeometry(0.025, 10), new THREE.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.6 }), lado * 0.12, 0.09, 0.2);
      b.rotation.y = lado * 0.5;
      b.userData.semContorno = true;
      g.add(b);
    }
    const boca = malha(new THREE.TorusGeometry(0.025, 0.007, 4, 8, Math.PI), toon(0x2a160f), 0, 0.09, 0.205);
    boca.rotation.z = Math.PI;
    boca.userData.semContorno = true;
    g.add(boca);
  }
  contornar(g, 0.012);
  return g;
}

// ---------- Pinheiro (marca registrada da Bia Pinheiro) ----------

export function criarPinheiro(altura = 3, { luzes = false, estrela = false, cor = 0x2d6a4f } = {}) {
  const g = new THREE.Group();
  g.add(malha(new THREE.CylinderGeometry(altura * 0.04, altura * 0.06, altura * 0.3, 8), toon(0x7a4e2d), 0, altura * 0.15, 0));
  const camadas = 4;
  for (let i = 0; i < camadas; i++) {
    const t = i / camadas;
    const r = altura * (0.38 - t * 0.24);
    const h = altura * 0.36;
    const cone = malha(new THREE.ConeGeometry(r, h, 10), toon(i % 2 ? cor : new THREE.Color(cor).offsetHSL(0, 0, 0.05).getHex()), 0, altura * (0.32 + t * 0.52), 0);
    g.add(cone);
    if (luzes) {
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2 + i;
        const cores = [0xffd60a, 0xff4d6d, 0x4cc9f0, 0xffffff];
        g.add(malha(new THREE.SphereGeometry(altura * 0.018, 6, 4), brilho(cores[(k + i) % 4], 1.2), Math.cos(a) * r * 0.8, altura * (0.22 + t * 0.52), Math.sin(a) * r * 0.8));
      }
    }
  }
  if (estrela) g.add(malha(new THREE.OctahedronGeometry(altura * 0.06, 0), brilho(0xffd60a, 1), 0, altura * 1.02, 0));
  return g;
}

// ---------- Caixas (presentes) ----------

const geoCaixa = caixaArredondada(0.96, 0.96, 0.96, 0.07);
const coresPresente = [0xff8fab, 0xb8a1ff, 0x5ed3c3, 0xffd166, 0x8ecae6];

function fitas(g, corFita) {
  const fita = toon(corFita);
  g.add(malha(new THREE.BoxGeometry(0.985, 0.985, 0.16), fita));
  g.add(malha(new THREE.BoxGeometry(0.16, 0.985, 0.985), fita));
  for (const lado of [-1, 1]) {
    const laco = malha(new THREE.TorusGeometry(0.13, 0.04, 6, 12), fita, lado * 0.12, 0.55, 0);
    laco.rotation.set(0, 0, lado * 0.6);
    laco.scale.set(1, 0.7, 1);
    g.add(laco);
  }
  g.add(malha(new THREE.SphereGeometry(0.06, 8, 6), fita, 0, 0.5, 0));
}

function rotulos(g, tex, tamanho = 0.62, dist = 0.5) {
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(tamanho, tamanho * tex.image.height / tex.image.width), mat);
    const a = (i / 4) * Math.PI * 2;
    p.position.set(Math.sin(a) * dist, 0, Math.cos(a) * dist);
    p.rotation.y = a;
    p.userData.semContorno = true;
    g.add(p);
  }
}

let texAlergia, texVilao, texPinheiro;
export function criarCaixa(tipo, semente = 0) {
  const g = new THREE.Group();
  switch (tipo) {
    case 'comum': {
      g.add(malha(geoCaixa, toon(coresPresente[Math.abs(semente) % coresPresente.length])));
      fitas(g, 0xfff3b0);
      break;
    }
    case 'mola': { // caixa de som: pisar dá um pulão
      g.add(malha(geoCaixa, toon(0x26232e)));
      const alto = new THREE.Group();
      alto.add(malha(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 24), toon(0x111111), 0, 0, 0));
      alto.add(malha(new THREE.ConeGeometry(0.3, 0.12, 24, 1, true), toon(0x3a3a48, { side: THREE.DoubleSide }), 0, 0.02, 0));
      alto.add(malha(new THREE.TorusGeometry(0.36, 0.03, 6, 28), brilho(0x00f5d4, 1.2), 0, 0.02, 0));
      alto.children[2].rotation.x = Math.PI / 2;
      alto.position.y = 0.48;
      g.add(alto);
      for (const [x, y] of [[0, 0.12], [0, -0.22]]) {
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const cone = malha(new THREE.CircleGeometry(y > 0 ? 0.2 : 0.12, 20), toon(0x444455), Math.sin(a) * 0.485, y, Math.cos(a) * 0.485);
          cone.rotation.y = a;
          g.add(cone);
        }
      }
      g.userData.alto = alto;
      break;
    }
    case 'checkpoint': {
      g.add(malha(geoCaixa, toon(0x52b788)));
      texPinheiro ??= textura(128, (c) => {
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(64, 64, 58, 0, 7); c.fill();
        c.fillStyle = '#2d6a4f';
        for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(64, 14 + i * 22); c.lineTo(28 + i * -4, 62 + i * 22); c.lineTo(100 + i * 4, 62 + i * 22); c.fill(); }
        c.fillStyle = '#7a4e2d'; c.fillRect(56, 100, 16, 16);
      }, { suave: true });
      rotulos(g, texPinheiro, 0.6);
      const mini = criarPinheiro(0.5);
      mini.position.y = 0.48;
      g.add(mini);
      break;
    }
    case 'explosiva': { // caixote de goiaba: a Bia é alérgica!
      const madeira = toon(0xa0522d);
      for (let i = 0; i < 4; i++) g.add(malha(new THREE.BoxGeometry(0.98, 0.2, 0.98), madeira, 0, -0.38 + i * 0.25, 0));
      for (const [x, z] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) g.add(malha(new THREE.BoxGeometry(0.1, 1, 0.1), toon(0x6b3b12), x, 0, z));
      for (const [x, z] of [[-0.2, -0.2], [0.2, -0.15], [-0.15, 0.22], [0.22, 0.2]]) g.add(malha(new THREE.SphereGeometry(0.2, 12, 10), toon(0x8fbf3a), x, 0.42, z));
      texAlergia ??= texturaTexto(['ALERGIA!', 'goiaba'], { largura: 256, altura: 160, fundo: '#ffd60a', cor: '#c1121f', fonte: 'bold 52px "Trebuchet MS", sans-serif', borda: '#c1121f' });
      rotulos(g, texAlergia, 0.7, 0.505);
      break;
    }
    case 'ferro': { // caixa do vilão: não quebra
      g.add(malha(geoCaixa, toon(0x8d99ae)));
      g.add(malha(new THREE.BoxGeometry(0.99, 0.12, 0.99), toon(VILAO.corPrincipal), 0, -0.32, 0));
      g.add(malha(new THREE.BoxGeometry(0.99, 0.12, 0.99), toon(VILAO.corPrincipal), 0, 0.32, 0));
      texVilao ??= texturaTexto(VILAO.nome, { largura: 256, altura: 96, fundo: VILAO.css.secundaria, cor: '#ffffff', fonte: 'bold 64px "Trebuchet MS", sans-serif' });
      rotulos(g, texVilao, 0.7);
      for (const [x, y] of [[-0.38, 0.38], [0.38, 0.38], [-0.38, -0.38], [0.38, -0.38]]) {
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          g.add(malha(new THREE.SphereGeometry(0.035, 6, 4), toon(0xd9dde3), Math.sin(a) * 0.48 + Math.cos(a) * x, y, Math.cos(a) * 0.48 - Math.sin(a) * x));
        }
      }
      break;
    }
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// ---------- Chegada: arco de flores ----------

export function criarChegada(final = false) {
  const g = new THREE.Group();
  const branco = toon(0xfffaf0);
  const arco = malha(new THREE.TorusGeometry(1.5, 0.13, 10, 32, Math.PI), branco, 0, 1.2, 0);
  g.add(arco);
  for (const x of [-1.5, 1.5]) g.add(malha(new THREE.CylinderGeometry(0.13, 0.16, 1.2, 12), branco, x, 0.6, 0));
  const cores = [0xff4d6d, 0xffb3c6, 0xffffff, 0xff8fab, 0xffd166];
  for (let i = 0; i <= 26; i++) {
    const a = (i / 26) * Math.PI;
    const f = malha(new THREE.SphereGeometry(0.12 + (i % 3) * 0.03, 8, 6), toon(cores[i % 5]), Math.cos(a) * 1.5, 1.2 + Math.sin(a) * 1.5, (i % 2 ? 0.1 : -0.1));
    g.add(f);
  }
  for (let i = 0; i < 10; i++) {
    const folha = malha(new THREE.SphereGeometry(0.12, 6, 4), toon(0x52b788), Math.cos((i / 9) * Math.PI) * 1.55, 1.2 + Math.sin((i / 9) * Math.PI) * 1.55, 0.05);
    folha.scale.set(1.4, 0.5, 0.8);
    g.add(folha);
  }
  const portal = new THREE.Mesh(new THREE.CircleGeometry(1.35, 32, 0, Math.PI),
    new THREE.MeshBasicMaterial({ color: final ? 0xfff0f5 : 0xffe5ec, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  portal.position.y = 1.2;
  g.add(portal);
  const portalBaixo = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.2), portal.material);
  portalBaixo.position.y = 0.6;
  g.add(portalBaixo);
  g.add(malha(new THREE.CylinderGeometry(2, 2.2, 0.2, 24), toon(0xf1e3d3), 0, 0.1, 0));
  contornar(arco, 0.015);
  g.userData = { portal, portalBaixo };
  return g;
}

// ---------- Pessoas (família, igreja, convidados) ----------

const PELES = [0xf3cdb0, 0xe0ac8a, 0xc68863, 0x8d5a3b, 0xf8d9c4];
const CABELOS = [0x2e1a14, 0x1b1b1b, 0x5a3825, 0x8b5a2b, 0xbfa58a, 0x777777];
const ROUPAS = [0xe76f51, 0x2a9d8f, 0xe9c46a, 0x8ecae6, 0xb5838d, 0x6d6875, 0xf4a261, 0x90be6d, 0xff8fab, 0x4361ee];

export function criarPessoa(rnd, { crianca = false, roupa = null, terno = false, cabeloCurto = null, vestido = null } = {}) {
  const g = new THREE.Group();
  const escala = crianca ? 0.65 : 0.9 + rnd() * 0.15;
  const pele = toon(PELES[Math.floor(rnd() * PELES.length)]);
  const corRoupa = toon(roupa ?? ROUPAS[Math.floor(rnd() * ROUPAS.length)]);
  const temVestido = vestido ?? (!terno && rnd() < 0.45);
  const curto = cabeloCurto ?? (!temVestido && rnd() < 0.8);
  const cabelo = toon(CABELOS[Math.floor(rnd() * CABELOS.length)]);
  const corpo = new THREE.Group();
  g.add(corpo);
  for (const lado of [-1, 1]) corpo.add(malha(new THREE.CapsuleGeometry(0.06, 0.4, 3, 8), terno ? toon(0x1d2b4a) : temVestido ? pele : toon(0x3d405b), lado * 0.08, 0.27, 0));
  if (temVestido) {
    corpo.add(malha(new THREE.ConeGeometry(0.28, 0.6, 14), corRoupa, 0, 0.72, 0));
  } else {
    const tronco = malha(new THREE.CapsuleGeometry(0.17, 0.32, 4, 12), terno ? toon(0x1d2b4a) : corRoupa, 0, 0.82, 0);
    tronco.scale.z = 0.75;
    corpo.add(tronco);
  }
  if (terno) {
    corpo.add(malha(new THREE.BoxGeometry(0.1, 0.28, 0.05), toon(0xffffff), 0, 0.92, 0.12));
    const gravata = malha(new THREE.TorusGeometry(0.035, 0.02, 4, 8), toon(0x9d0208), 0, 1.04, 0.15);
    gravata.scale.x = 1.8;
    corpo.add(gravata);
  }
  const bracos = [];
  for (const lado of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(lado * 0.2, 1.02, 0);
    pivo.add(malha(new THREE.CapsuleGeometry(0.045, 0.32, 3, 6), terno ? toon(0x1d2b4a) : corRoupa, 0, -0.18, 0));
    pivo.add(malha(new THREE.SphereGeometry(0.05, 8, 6), pele, 0, -0.38, 0));
    pivo.rotation.z = lado * 0.15;
    corpo.add(pivo);
    bracos.push(pivo);
  }
  const cabeca = new THREE.Group();
  cabeca.position.y = 1.28;
  corpo.add(cabeca);
  cabeca.add(malha(new THREE.SphereGeometry(0.17, 14, 12), pele));
  const topo = malha(new THREE.SphereGeometry(0.182, 14, 10, 0, Math.PI * 2, 0, Math.PI * (curto ? 0.5 : 0.6)), cabelo, 0, 0.01, -0.01);
  topo.rotation.x = -0.35;
  cabeca.add(topo);
  if (!curto) {
    const longo = malha(new THREE.CapsuleGeometry(0.15, 0.25, 4, 10), cabelo, 0, -0.14, -0.07);
    longo.scale.z = 0.7;
    cabeca.add(longo);
  }
  for (const lado of [-1, 1]) {
    const olho = malha(new THREE.SphereGeometry(0.022, 6, 5), toon(0x1b1b1b), lado * 0.06, 0.01, 0.155);
    olho.userData.semContorno = true;
    cabeca.add(olho);
  }
  const boca = malha(new THREE.TorusGeometry(0.03, 0.007, 4, 8, Math.PI), toon(0x9d4b4b), 0, -0.06, 0.155);
  boca.rotation.z = Math.PI;
  boca.userData.semContorno = true;
  cabeca.add(boca);
  g.scale.setScalar(escala);
  contornar(g, 0.01);
  const fase = rnd() * 10;
  const pula = rnd() < 0.5;
  g.userData.animar = (t) => {
    corpo.position.y = pula ? Math.max(0, Math.sin(t * 6 + fase)) * 0.12 : 0;
    bracos[0].rotation.z = -0.15 - (Math.sin(t * 8 + fase) * 0.5 + 0.9) * (pula ? 1 : 0.3);
    bracos[1].rotation.z = pula ? 0.15 + (Math.sin(t * 8 + fase + 1) * 0.5 + 0.9) : 0.15;
  };
  return g;
}
