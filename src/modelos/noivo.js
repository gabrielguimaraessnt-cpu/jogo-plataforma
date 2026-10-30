// O noivo: cabelo curto escuro, barba cheia aparada com bigode, sorriso largo.
// Mesmo estilo "chibi" da Bia. De terno no casamento; dá para usar a roupa casual também.
import * as THREE from 'three';
import { toon, malha, contornar } from '../estilo3d.js';
import { criarFlor } from './itens.js';

const PELE = 0xeab894;
const CABELO = 0x1f1510;
const BARBA = 0x2b1d16;

function torno(pontos, segmentos = 28) {
  return new THREE.LatheGeometry(pontos.map(([r, y]) => new THREE.Vector2(r, y)), segmentos);
}

export function criarNoivo({ terno = true } = {}) {
  const pele = toon(PELE), cabelo = toon(CABELO), barba = toon(BARBA);
  const roupa = toon(terno ? 0x1d2b4a : 0x7a7a7a);
  const calca = toon(terno ? 0x1d2b4a : 0x2b2b2e);

  const raiz = new THREE.Group();
  const corpo = new THREE.Group();
  raiz.add(corpo);

  // Pernas e sapatos
  for (const lado of [-1, 1]) {
    corpo.add(malha(new THREE.CapsuleGeometry(0.08, 0.42, 4, 10), calca, lado * 0.11, 0.33, 0));
    const sapato = malha(new THREE.SphereGeometry(0.085, 12, 8), toon(0x161616), lado * 0.11, 0.05, 0.04);
    sapato.scale.set(0.9, 0.55, 1.45);
    corpo.add(sapato);
  }

  // Tronco (mais largo, barriguinha)
  const tronco = malha(torno([[0.25, 0.58], [0.3, 0.68], [0.32, 0.79], [0.31, 0.9], [0.285, 0.99], [0.21, 1.06], [0.1, 1.1], [0.07, 1.11]]), roupa);
  corpo.add(tronco);

  if (terno) {
    // camisa branca, gravata vinho, lapelas e uma florzinha na lapela
    const v = new THREE.Shape();
    v.moveTo(-0.09, 0); v.lineTo(0.09, 0); v.lineTo(0, -0.24); v.closePath();
    const camisa = malha(new THREE.ShapeGeometry(v), toon(0xffffff, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 1.075, 0.235);
    camisa.rotation.x = -0.38;
    camisa.userData.semContorno = true;
    corpo.add(camisa);
    const gravata = malha(new THREE.BoxGeometry(0.045, 0.17, 0.02), toon(0x9d0208), 0, 0.97, 0.29);
    gravata.rotation.x = -0.3;
    corpo.add(gravata);
    corpo.add(malha(new THREE.SphereGeometry(0.03, 8, 6), toon(0x9d0208), 0, 1.055, 0.255));
    const flor = criarFlor(0xffffff);
    flor.scale.setScalar(0.35);
    flor.position.set(-0.17, 0.97, 0.26);
    corpo.add(flor);
    for (const lado of [-1, 1]) corpo.add(malha(new THREE.SphereGeometry(0.018, 6, 4), toon(0xd9d9d9), 0, 0.82 - (lado + 1) * 0.06, 0.315));
  } else {
    corpo.add(malha(new THREE.TorusGeometry(0.1, 0.012, 5, 16), toon(0x5c5c5c), 0, 1.09, 0.03));
    corpo.children[corpo.children.length - 1].rotation.x = Math.PI / 2 + 0.3;
  }

  // Braços
  const bracos = [];
  for (const lado of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(lado * 0.29, 1.0, 0);
    pivo.rotation.z = lado * 0.16;
    pivo.add(malha(new THREE.CapsuleGeometry(0.068, 0.3, 4, 10), terno ? roupa : toon(0x7a7a7a), 0, -0.19, 0));
    if (!terno) pivo.add(malha(new THREE.CapsuleGeometry(0.055, 0.14, 4, 8), pele, 0, -0.36, 0));
    else pivo.add(malha(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), toon(0xffffff), 0, -0.39, 0));
    pivo.add(malha(new THREE.SphereGeometry(0.058, 10, 8), pele, 0, -0.46, 0));
    corpo.add(pivo);
    bracos.push(pivo);
  }

  // Cabeça
  corpo.add(malha(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), pele, 0, 1.13, 0));
  const cabeca = new THREE.Group();
  cabeca.position.set(0, 1.33, 0);
  cabeca.scale.setScalar(1.08);
  corpo.add(cabeca);
  const cranio = malha(new THREE.SphereGeometry(0.2, 26, 18), pele);
  cranio.scale.set(1.06, 1.02, 0.98);
  cabeca.add(cranio);

  // Cabelo curto, com um topete
  const calota = malha(new THREE.SphereGeometry(0.214, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.4), cabelo, 0, 0.012, -0.02);
  calota.rotation.x = -0.32;
  calota.scale.set(1.06, 1, 1);
  cabeca.add(calota);
  // fios curtos na frente, para não parecer um boné
  for (let i = 0; i < 6; i++) {
    const a = -0.9 + i * 0.36;
    const fio = malha(new THREE.SphereGeometry(0.06, 10, 8), cabelo, Math.sin(a) * 0.15, 0.165 - Math.abs(a) * 0.03, Math.cos(a) * 0.1);
    fio.scale.set(1.2, 0.55, 1);
    fio.rotation.y = a;
    fio.userData.semContorno = true;
    cabeca.add(fio);
  }
  const nuca = malha(new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), cabelo, 0, 0.0, -0.035);
  nuca.rotation.x = 0.55;
  nuca.scale.set(1.05, 1, 1);
  cabeca.add(nuca);

  // Barba cheia aparada (mandíbula e queixo) + bigode
  const barbaMalha = malha(new THREE.SphereGeometry(0.21, 26, 14, Math.PI / 2 - 1.5, 3.0, Math.PI * 0.6, Math.PI * 0.32), barba);
  barbaMalha.scale.set(1.06, 1.02, 1.0);
  cabeca.add(barbaMalha);
  for (const lado of [-1, 1]) {
    const costeleta = malha(new THREE.BoxGeometry(0.03, 0.09, 0.05), barba, lado * 0.205, -0.01, 0.0);
    costeleta.userData.semContorno = true;
    cabeca.add(costeleta);
  }
  const bigode = malha(new THREE.CapsuleGeometry(0.014, 0.075, 3, 8), barba, 0, -0.058, 0.198);
  bigode.rotation.z = Math.PI / 2;
  bigode.userData.semContorno = true;
  cabeca.add(bigode);

  // Rosto
  const detalhe = (m) => { m.userData.semContorno = true; m.castShadow = false; return m; };
  const escuro = toon(0x22150f), branco = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const lado of [-1, 1]) {
    const olho = detalhe(malha(new THREE.SphereGeometry(0.038, 12, 10), escuro, lado * 0.078, 0.015, 0.17));
    olho.scale.set(0.85, 0.9, 0.4);
    cabeca.add(olho);
    cabeca.add(detalhe(malha(new THREE.SphereGeometry(0.01, 6, 5), branco, lado * 0.078 - 0.01, 0.027, 0.186)));
    const sobrancelha = detalhe(malha(new THREE.CapsuleGeometry(0.011, 0.05, 3, 6), cabelo, lado * 0.08, 0.08, 0.178));
    sobrancelha.rotation.z = Math.PI / 2 - lado * 0.04;
    cabeca.add(sobrancelha);
    cabeca.add(malha(new THREE.SphereGeometry(0.038, 8, 6), pele, lado * 0.212, -0.005, 0));
  }
  cabeca.add(detalhe(malha(new THREE.SphereGeometry(0.024, 8, 6), toon(0xdea47f), 0, -0.022, 0.203)));
  // sorriso aberto: boca escura com dentes
  const boca = detalhe(malha(new THREE.CircleGeometry(0.045, 16, Math.PI, Math.PI), toon(0x5a1e1e, { side: THREE.DoubleSide }), 0, -0.085, 0.203));
  boca.scale.y = 0.6;
  cabeca.add(boca);
  const dentes = detalhe(malha(new THREE.PlaneGeometry(0.07, 0.012), branco, 0, -0.091, 0.205));
  cabeca.add(dentes);

  contornar(raiz, 0.012);
  raiz.scale.setScalar(1.05);
  const fase = Math.random() * 6;
  raiz.userData = {
    corpo, bracos, cabeca,
    animar: (t) => {
      corpo.position.y = Math.sin(t * 2 + fase) * 0.01;
      cabeca.rotation.z = Math.sin(t * 1.2 + fase) * 0.04;
      bracos[1].rotation.z = 0.16 + Math.max(0, Math.sin(t * 0.7)) * 0.6;
    },
  };
  return raiz;
}
