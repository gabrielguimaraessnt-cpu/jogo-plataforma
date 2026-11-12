// A Gabi, irmã da Bia (e dona de alguns vestidos que a Bia usa no jogo!).
// Cabelo escuro longo, óculos redondos dourados, camiseta verde com carinha de bandana laranja e jeans.
// Mesmo estilo "chibi" da Bia.
import * as THREE from 'three';
import { toon, malha, contornar, textura, texturaTexto } from '../estilo3d.js';

const PELE = 0xf0c6a6;
const CABELO = 0x24140f;
const VERDE = 0x1f9a4e;
const OURO = 0xe2b46a;

function torno(pontos, segmentos = 28) {
  return new THREE.LatheGeometry(pontos.map(([r, y]) => new THREE.Vector2(r, y)), segmentos);
}
function tuboOndulado(pontos, raio, segmentos = 32) {
  const curva = new THREE.CatmullRomCurve3(pontos.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curva, segmentos, raio, 8, false);
}

// Estampa da camiseta: carinha sorridente com bandana laranja
let estampa;
function texturaEstampa() {
  if (estampa) return estampa;
  estampa = textura(256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    // bandana
    g.fillStyle = '#f08a4b'; g.strokeStyle = '#3a1f12'; g.lineWidth = 6;
    g.beginPath();
    g.moveTo(20, 70); g.quadraticCurveTo(128, 40, 236, 70); g.lineTo(230, 120); g.quadraticCurveTo(128, 95, 26, 120); g.closePath();
    g.fill(); g.stroke();
    // nó e pontas
    g.beginPath(); g.moveTo(222, 72); g.lineTo(252, 30); g.lineTo(240, 82); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(226, 100); g.lineTo(254, 120); g.lineTo(232, 116); g.closePath(); g.fill(); g.stroke();
    // olhos
    for (const x of [92, 162]) {
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, 86, 22, 20, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(x + 4, 88, 8, 0, Math.PI * 2); g.fill();
    }
    // sorriso
    g.fillStyle = '#1a1a1a';
    g.beginPath(); g.moveTo(50, 160); g.quadraticCurveTo(128, 250, 206, 160); g.quadraticCurveTo(128, 200, 50, 160); g.fill();
    g.fillStyle = '#e0303a';
    g.beginPath(); g.ellipse(150, 200, 26, 12, 0, 0, Math.PI * 2); g.fill();
  }, { suave: true });
  return estampa;
}

let jeansMat;
function jeans() {
  if (!jeansMat) {
    const t = textura(64, (g, w, h) => {
      g.fillStyle = '#34507a'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 1;
      for (let i = -h; i < w; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); }
    }, { repetir: true, suave: true });
    t.repeat.set(2, 2);
    jeansMat = toon(0xffffff, { map: t });
  }
  return jeansMat;
}

export function criarGabi() {
  const pele = toon(PELE), cabelo = toon(CABELO), camiseta = toon(VERDE), ouro = toon(OURO, { emissive: 0x4a3000, emissiveIntensity: 0.25 });
  const raiz = new THREE.Group();
  const corpo = new THREE.Group();
  raiz.add(corpo);

  // Pernas de jeans e tênis
  for (const lado of [-1, 1]) {
    corpo.add(malha(new THREE.CapsuleGeometry(0.07, 0.42, 4, 10), jeans(), lado * 0.095, 0.35, 0));
    const tenis = malha(new THREE.SphereGeometry(0.075, 12, 8), toon(0xf4f4f4), lado * 0.095, 0.05, 0.035);
    tenis.scale.set(0.9, 0.6, 1.45);
    corpo.add(tenis);
  }
  // quadril de jeans + camiseta
  corpo.add(malha(torno([[0.235, 0.56], [0.245, 0.64], [0.23, 0.7]]), jeans()));
  const perfil = [[0.25, 0.66], [0.245, 0.74], [0.25, 0.84], [0.255, 0.9], [0.235, 0.96], [0.19, 1.0], [0.11, 1.035], [0.075, 1.04]];
  corpo.add(malha(torno(perfil), camiseta));
  // gola
  const gola = malha(new THREE.TorusGeometry(0.072, 0.014, 6, 20), toon(0x17803f), 0, 1.04, 0.01);
  gola.rotation.x = Math.PI / 2 + 0.25;
  gola.userData.semContorno = true;
  corpo.add(gola);
  // estampa na frente (pedaço de cilindro acompanhando a barriga)
  const est = new THREE.Mesh(
    new THREE.CylinderGeometry(0.262, 0.262, 0.24, 20, 1, true, -0.75, 1.5),
    new THREE.MeshToonMaterial({ map: texturaEstampa(), transparent: true, alphaTest: 0.3, side: THREE.FrontSide, polygonOffset: true, polygonOffsetFactor: -2 }));
  est.position.y = 0.82;
  est.userData.semContorno = true;
  corpo.add(est);

  // Braços (manga curta verde)
  const bracos = [];
  for (const lado of [-1, 1]) {
    const pivo = new THREE.Group();
    pivo.position.set(lado * 0.225, 0.965, 0);
    pivo.rotation.z = lado * 0.14;
    pivo.add(malha(new THREE.CylinderGeometry(0.07, 0.085, 0.16, 12, 1, true), camiseta, 0, -0.06, 0));
    pivo.add(malha(new THREE.CapsuleGeometry(0.047, 0.3, 4, 8), pele, 0, -0.24, 0));
    pivo.add(malha(new THREE.SphereGeometry(0.052, 10, 8), pele, 0, -0.45, 0));
    corpo.add(pivo);
    bracos.push(pivo);
  }
  // relógio preto no pulso esquerdo
  const relogio = malha(new THREE.CylinderGeometry(0.052, 0.052, 0.04, 12), toon(0x1c1c1c), 0, -0.38, 0);
  bracos[1].add(relogio);

  // Pescoço e cabeça
  corpo.add(malha(new THREE.CylinderGeometry(0.048, 0.055, 0.12, 10), pele, 0, 1.08, 0));
  const cabeca = new THREE.Group();
  cabeca.position.set(0, 1.27, 0);
  cabeca.scale.setScalar(1.08);
  corpo.add(cabeca);
  const cranio = malha(new THREE.SphereGeometry(0.2, 26, 18), pele);
  cranio.scale.set(1.04, 1.03, 0.97);
  cabeca.add(cranio);

  const detalhe = (m) => { m.userData.semContorno = true; m.castShadow = false; return m; };
  const escuro = toon(0x2a160f), branco = new THREE.MeshBasicMaterial({ color: 0xffffff });
  // Duas carinhas: feliz (normal) e brava (quando a Bia chega perto com o vestido dela!)
  const feliz = new THREE.Group(), brava = new THREE.Group();
  brava.visible = false;
  cabeca.add(feliz, brava);
  for (const lado of [-1, 1]) {
    // olhos sorridentes (meio fechados)
    const olho = detalhe(malha(new THREE.TorusGeometry(0.032, 0.011, 5, 12, Math.PI), escuro, lado * 0.08, -0.005, 0.176));
    feliz.add(olho);
    const sobrancelha = detalhe(malha(new THREE.CapsuleGeometry(0.008, 0.045, 3, 6), escuro, lado * 0.08, 0.075, 0.18));
    sobrancelha.rotation.z = Math.PI / 2 + lado * 0.15;
    feliz.add(sobrancelha);
    // brava: olho aberto e fixo, sobrancelha franzida descendo pro meio
    const olhoBravo = detalhe(malha(new THREE.SphereGeometry(0.036, 12, 10), escuro, lado * 0.08, -0.002, 0.168));
    olhoBravo.scale.set(0.9, 0.75, 0.4);
    brava.add(olhoBravo);
    brava.add(detalhe(malha(new THREE.SphereGeometry(0.009, 6, 5), branco, lado * 0.08 - 0.01, 0.008, 0.183)));
    const franzida = detalhe(malha(new THREE.CapsuleGeometry(0.014, 0.06, 3, 6), escuro, lado * 0.075, 0.074, 0.214));
    franzida.rotation.z = Math.PI / 2 + lado * 0.45;
    brava.add(franzida);
    const corada = detalhe(malha(new THREE.CircleGeometry(0.034, 14), new THREE.MeshBasicMaterial({ color: 0xff4d6d, transparent: true, opacity: 0.55 }), lado * 0.12, -0.05, 0.159));
    corada.rotation.y = lado * 0.65;
    brava.add(corada);
    const bochecha = detalhe(malha(new THREE.CircleGeometry(0.03, 14), new THREE.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.45 }), lado * 0.12, -0.05, 0.158));
    bochecha.rotation.y = lado * 0.65;
    cabeca.add(bochecha);
    cabeca.add(malha(new THREE.SphereGeometry(0.035, 8, 6), pele, lado * 0.2, -0.01, 0));
    // óculos redondos dourados
    const aro = detalhe(malha(new THREE.TorusGeometry(0.058, 0.007, 6, 24), ouro, lado * 0.082, 0.0, 0.205));
    cabeca.add(aro);
    const lente = detalhe(malha(new THREE.CircleGeometry(0.056, 20), new THREE.MeshBasicMaterial({ color: 0xdff3ff, transparent: true, opacity: 0.22, depthWrite: false }), lado * 0.082, 0.0, 0.204));
    cabeca.add(lente);
  }
  cabeca.add(detalhe(malha(new THREE.BoxGeometry(0.05, 0.007, 0.007), ouro, 0, 0.012, 0.21)));
  cabeca.add(detalhe(malha(new THREE.SphereGeometry(0.017, 8, 6), toon(0xe4ab8c), 0, -0.04, 0.198)));
  // sorriso largo com dentes
  const boca = detalhe(malha(new THREE.CircleGeometry(0.05, 16, Math.PI, Math.PI), toon(0x7a2a2a, { side: THREE.DoubleSide }), 0, -0.085, 0.192));
  boca.scale.y = 0.62;
  feliz.add(boca);
  feliz.add(detalhe(malha(new THREE.PlaneGeometry(0.08, 0.014), branco, 0, -0.091, 0.194)));
  // biquinho bravo (boca pra baixo)
  const emburrada = detalhe(malha(new THREE.TorusGeometry(0.03, 0.009, 5, 12, Math.PI), toon(0x7a2a2a), 0, -0.105, 0.188));
  brava.add(emburrada);

  // Cabelo: repartido de lado, longo e levemente ondulado, caindo à frente de um ombro
  const cabeloGrupo = new THREE.Group();
  cabeca.add(cabeloGrupo);
  const calota = malha(new THREE.SphereGeometry(0.218, 26, 16, 0, Math.PI * 2, 0, Math.PI * 0.56), cabelo, 0, 0.012, -0.012);
  calota.rotation.x = -0.4;
  calota.rotation.z = 0.12;
  cabeloGrupo.add(calota);
  const nuca = malha(new THREE.SphereGeometry(0.205, 18, 14), cabelo, 0, -0.03, -0.1);
  nuca.scale.set(1.05, 1.08, 0.85);
  cabeloGrupo.add(nuca);
  // franja varrida para um lado
  cabeloGrupo.add(malha(tuboOndulado([[0.08, 0.2, 0.1], [-0.03, 0.18, 0.17], [-0.14, 0.11, 0.16], [-0.2, 0.0, 0.1]], 0.05, 20), cabelo));
  const N = 11;
  for (let i = 0; i < N; i++) {
    const a = Math.PI + (i / (N - 1) - 0.5) * Math.PI * 1.15;
    const pts = [];
    const comp = 0.7 + Math.sin(i * 1.3) * 0.05;
    for (let k = 0; k <= 6; k++) {
      const t = k / 6, r = 0.19 + t * 0.06;
      const desvio = Math.sin(t * Math.PI * 1.6 + i) * 0.022 * t;
      pts.push([Math.sin(a) * r + Math.cos(a) * desvio, 0.06 - t * comp, Math.cos(a) * r - Math.sin(a) * desvio]);
    }
    cabeloGrupo.add(malha(tuboOndulado(pts, 0.056 - Math.abs(i / (N - 1) - 0.5) * 0.02), cabelo));
    cabeloGrupo.add(malha(new THREE.SphereGeometry(0.048, 8, 6), cabelo, ...pts[pts.length - 1]));
  }
  // mecha grossa caindo na frente do ombro direito, outra mais fina atrás da orelha
  for (const [lado, grossura, frente] of [[-1, 0.06, 0.1], [1, 0.042, 0.03]]) {
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      pts.push([lado * (0.19 + t * 0.07), 0.03 - t * 0.6, frente + t * 0.05 + Math.sin(t * 6) * 0.02]);
    }
    cabeloGrupo.add(malha(tuboOndulado(pts, grossura), cabelo));
  }

  // Placa num cabinho, que ela levanta com a mão direita
  const placa = new THREE.Group();
  const quadro = malha(new THREE.BoxGeometry(1.15, 0.5, 0.04),
    toon(0xffffff, { map: texturaTexto(['Esse vestido', 'é meu! 😤'], { largura: 512, altura: 224, fundo: '#fff4e6', cor: '#c9184a', borda: '#e0457b', fonte: 'bold 78px "Baloo 2", "Trebuchet MS", sans-serif' }) }), 0, 0.62, 0);
  placa.add(quadro);
  placa.add(malha(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 6), toon(0x9c6b3f), 0, 0.2, -0.03));
  placa.scale.setScalar(0.001);
  placa.visible = false;
  corpo.add(placa);

  contornar(raiz, 0.012);
  const fase = Math.random() * 6;
  let raiva = 0, antes = null;
  const dados = {
    corpo, bracos, cabeca, brava: false,
    animar: (t) => {
      const dt = antes === null ? 0 : Math.min(0.1, t - antes);
      antes = t;
      raiva += ((dados.brava ? 1 : 0) - raiva) * Math.min(1, dt * 7);
      const k = raiva;
      brava.visible = k > 0.5;
      feliz.visible = !brava.visible;
      corpo.position.y = Math.sin(t * 2.2 + fase) * 0.012 * (1 - k) + Math.abs(Math.sin(t * 9)) * 0.02 * k;
      cabeca.rotation.z = Math.sin(t * 1.3 + fase) * 0.05 * (1 - k);
      cabeca.rotation.y = Math.sin(t * 10) * 0.06 * k; // balança a cabeça: "não, não!"
      // feliz: acena com a esquerda; brava: mão esquerda na cintura e direita lá em cima com a placa
      bracos[0].rotation.z = (-2.5 + Math.sin(t * 6) * 0.35) * (1 - k) + (-0.75) * k;
      bracos[0].rotation.x = -0.5 * k;
      const ang = 0.14 + (2.75 - 0.14) * k + Math.sin(t * 8) * 0.08 * k;
      bracos[1].rotation.z = ang;
      // a placa acompanha a mão direita (ponta do braço)
      const ox = 0.225, oy = 0.965, L = 0.45;
      placa.visible = k > 0.02;
      placa.scale.setScalar(Math.max(0.001, k));
      placa.position.set(ox + L * Math.sin(ang), oy - L * Math.cos(ang), 0.06);
      placa.rotation.z = Math.sin(t * 8) * 0.06 * k;
    },
  };
  raiz.userData = dados;
  return raiz;
}
