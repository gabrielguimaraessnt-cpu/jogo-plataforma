// Vilões: a turma da XôMaq (sátira da antiga loja) e as goiabas (a Bia é alérgica).
import * as THREE from 'three';
import { toon, brilho, malha, contornar, caixaArredondada, texturaTexto, textura } from '../estilo3d.js';
import { VILAO } from '../config.js';

let texLogo;
function logo() {
  texLogo ??= texturaTexto(VILAO.nome, { largura: 256, altura: 80, fundo: '#ffffff', cor: VILAO.css.principal, fonte: 'bold 58px "Trebuchet MS", sans-serif' });
  return texLogo;
}

function olhosBravos(g, x, y, z, escala = 1) {
  for (const lado of [-1, 1]) {
    const branco = malha(new THREE.SphereGeometry(0.075 * escala, 10, 8), toon(0xffffff), x + lado * 0.09 * escala, y, z);
    branco.scale.z = 0.5;
    g.add(branco);
    const pupila = malha(new THREE.SphereGeometry(0.035 * escala, 8, 6), toon(0x111111), x + lado * 0.085 * escala, y - 0.01 * escala, z + 0.03 * escala);
    pupila.userData.semContorno = true;
    g.add(pupila);
    const sobrancelha = malha(new THREE.BoxGeometry(0.12 * escala, 0.03 * escala, 0.03 * escala), toon(0x111111), x + lado * 0.09 * escala, y + 0.08 * escala, z + 0.02 * escala);
    sobrancelha.rotation.z = -lado * 0.45;
    g.add(sobrancelha);
  }
}

// Máquina de costura que anda. "escala" maior vira o chefão.
export function criarMaquininha({ chefe = false } = {}) {
  const g = new THREE.Group();
  const corpo = new THREE.Group();
  g.add(corpo);
  const vermelho = toon(VILAO.corPrincipal), azul = toon(VILAO.corSecundaria), branco = toon(0xf1f1f1);
  corpo.add(malha(caixaArredondada(0.95, 0.2, 0.55, 0.06), branco, 0, 0.25, 0));
  corpo.add(malha(caixaArredondada(0.22, 0.5, 0.42, 0.07), vermelho, 0.32, 0.6, 0));
  const braco = malha(caixaArredondada(0.86, 0.24, 0.42, 0.09), vermelho, -0.02, 0.84, 0);
  corpo.add(braco);
  corpo.add(malha(caixaArredondada(0.2, 0.36, 0.4, 0.06), vermelho, -0.36, 0.66, 0));
  corpo.add(malha(new THREE.BoxGeometry(0.9, 0.05, 0.43), azul, -0.02, 0.73, 0));
  const agulha = malha(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 5), toon(0xcfd8dc), -0.36, 0.42, 0.05);
  corpo.add(agulha);
  const volante = malha(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 18), azul, 0.47, 0.68, 0);
  volante.rotation.z = Math.PI / 2;
  corpo.add(volante);
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), new THREE.MeshBasicMaterial({ map: logo() }));
  for (const lado of [-1, 1]) {
    const p = placa.clone();
    p.position.set(0, 0.84, lado * 0.215);
    if (lado < 0) p.rotation.y = Math.PI;
    p.userData.semContorno = true;
    corpo.add(p);
  }
  // A "cara" fica na ponta da agulha; a máquina anda com essa ponta para a frente (+Z).
  const cara = new THREE.Group();
  cara.position.set(-0.47, 0.68, 0);
  cara.rotation.y = -Math.PI / 2;
  corpo.add(cara);
  olhosBravos(cara, 0, 0, 0);
  corpo.rotation.y = Math.PI / 2;
  const pes = [];
  for (const lado of [-1, 1]) {
    const pe = malha(new THREE.CapsuleGeometry(0.06, 0.08, 3, 6), azul, lado * 0.18, 0.08, 0);
    g.add(pe);
    pes.push(pe);
  }
  if (chefe) {
    const gravata = malha(new THREE.ConeGeometry(0.08, 0.3, 4), toon(VILAO.corDetalhe), 0.22, 0.45, 0);
    gravata.rotation.x = Math.PI;
    corpo.add(gravata);
    const cracha = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.2), new THREE.MeshBasicMaterial({
      map: texturaTexto('GERENTE', { largura: 256, altura: 100, fundo: VILAO.css.detalhe, cor: '#111', fonte: 'bold 52px sans-serif' }) }));
    cracha.position.set(0, 1.05, 0);
    cracha.userData.semContorno = true;
    g.add(cracha);
  }
  contornar(g, 0.014);
  g.userData = { corpo, agulha, volante, pes, tipo: 'maquininha' };
  return g;
}

export function animarMaquininha(m, t, rapido = 1) {
  const { corpo, agulha, volante, pes } = m.userData;
  agulha.position.y = 0.42 + Math.sin(t * 30 * rapido) * 0.06;
  volante.rotation.x += 0.2 * rapido;
  corpo.position.y = Math.abs(Math.sin(t * 9 * rapido)) * 0.06;
  pes[0].position.z = Math.sin(t * 9 * rapido) * 0.12;
  pes[1].position.z = -Math.sin(t * 9 * rapido) * 0.12;
}

// Carretel de linha que rola.
export function criarCarretel(cor = VILAO.corPrincipal) {
  const g = new THREE.Group();
  const rolo = new THREE.Group();
  const eixo = new THREE.Group();
  eixo.rotation.z = Math.PI / 2;
  rolo.add(eixo);
  g.add(rolo);
  const linha = textura(64, (c) => {
    c.fillStyle = '#' + new THREE.Color(cor).getHexString(); c.fillRect(0, 0, 64, 64);
    c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 2;
    for (let y = 0; y < 64; y += 5) { c.beginPath(); c.moveTo(0, y); c.lineTo(64, y + 3); c.stroke(); }
  }, { repetir: true, suave: true });
  eixo.add(malha(new THREE.CylinderGeometry(0.26, 0.26, 0.5, 20), toon(0xffffff, { map: linha })));
  for (const y of [-0.28, 0.28]) eixo.add(malha(new THREE.CylinderGeometry(0.36, 0.36, 0.07, 22), toon(0xd4a373), 0, y, 0));
  rolo.position.y = 0.36;
  const cara = new THREE.Group();
  cara.position.y = 0.36;
  g.add(cara);
  olhosBravos(cara, 0, 0.05, 0.27, 0.9);
  contornar(g, 0.012);
  g.userData = { rolo, tipo: 'carretel' };
  return g;
}

// Gnomo de Natal travesso (substitui os carretéis no mundo do Natal).
export function criarGnomo() {
  const g = new THREE.Group();
  const corpo = new THREE.Group();
  g.add(corpo);
  const roupa = malha(new THREE.ConeGeometry(0.34, 0.55, 16), toon(0x2d6a4f), 0, 0.38, 0);
  corpo.add(roupa);
  corpo.add(malha(new THREE.TorusGeometry(0.3, 0.04, 6, 18), toon(0x6b4226), 0, 0.22, 0));
  corpo.children[1].rotation.x = Math.PI / 2;
  corpo.add(malha(new THREE.SphereGeometry(0.06, 8, 6), toon(0xffd166), 0, 0.22, 0.3));
  const barba = malha(new THREE.ConeGeometry(0.21, 0.42, 14), toon(0xf8f9fa), 0, 0.47, 0.12);
  barba.rotation.x = Math.PI + 0.25;
  corpo.add(barba);
  const nariz = malha(new THREE.SphereGeometry(0.075, 10, 8), toon(0xf4a6a6), 0, 0.7, 0.22);
  corpo.add(nariz);
  const gorro = malha(new THREE.ConeGeometry(0.24, 0.62, 14), toon(0xc1121f), 0, 1.2, 0);
  gorro.rotation.z = 0.25;
  corpo.add(gorro);
  corpo.add(malha(new THREE.TorusGeometry(0.22, 0.05, 6, 18), toon(0xffffff), 0, 0.9, 0));
  corpo.children[corpo.children.length - 1].rotation.x = Math.PI / 2;
  corpo.add(malha(new THREE.SphereGeometry(0.07, 8, 6), toon(0xffffff), -0.15, 1.47, 0));
  corpo.add(malha(new THREE.SphereGeometry(0.2, 14, 10), toon(0xf6c9a8), 0, 0.78, 0.02));
  olhosBravos(corpo, 0, 0.8, 0.2, 0.6);
  const pes = [];
  for (const lado of [-1, 1]) {
    const pe = malha(new THREE.SphereGeometry(0.08, 8, 6), toon(0x3d2817), lado * 0.13, 0.06, 0.05);
    pe.scale.set(1, 0.6, 1.5);
    g.add(pe);
    pes.push(pe);
  }
  contornar(g, 0.012);
  g.userData = { corpo, pes, tipo: 'gnomo' };
  return g;
}

export function animarGnomo(m, t) {
  const { corpo, pes } = m.userData;
  corpo.rotation.z = Math.sin(t * 10) * 0.12;
  corpo.position.y = Math.abs(Math.sin(t * 10)) * 0.05;
  pes[0].position.z = 0.05 + Math.sin(t * 10) * 0.08;
  pes[1].position.z = 0.05 - Math.sin(t * 10) * 0.08;
}

// Goiaba: perigo. Não dá para derrotar, só desviar.
export function criarGoiaba() {
  const g = new THREE.Group();
  const casca = textura(64, (c) => {
    c.fillStyle = '#8fbf3a'; c.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 60; i++) { c.fillStyle = i % 2 ? '#a5d14a' : '#76a82c'; c.beginPath(); c.arc(Math.random() * 64, Math.random() * 64, 1.5, 0, 7); c.fill(); }
  }, { suave: true });
  const fruta = malha(new THREE.SphereGeometry(0.32, 18, 14), toon(0xffffff, { map: casca }), 0, 0.32, 0);
  fruta.scale.set(1, 0.95, 1);
  g.add(fruta);
  g.add(malha(new THREE.CylinderGeometry(0.02, 0.03, 0.1, 5), toon(0x6b4226), 0, 0.66, 0));
  const folha = malha(new THREE.SphereGeometry(0.1, 8, 4), toon(0x2d6a4f), 0.08, 0.68, 0);
  folha.scale.set(1.4, 0.25, 0.7);
  g.add(folha);
  for (const lado of [-1, 1]) {
    const olho = malha(new THREE.SphereGeometry(0.035, 8, 6), toon(0x1b1b1b), lado * 0.1, 0.4, 0.29);
    olho.userData.semContorno = true;
    g.add(olho);
  }
  const boca = malha(new THREE.TorusGeometry(0.06, 0.012, 4, 10, Math.PI), toon(0x7a1f3d), 0, 0.28, 0.305);
  boca.rotation.z = Math.PI;
  boca.userData.semContorno = true;
  g.add(boca);
  contornar(g, 0.012);
  g.userData = { fruta, tipo: 'goiaba' };
  return g;
}

// Goiabeira: de onde saem as goiabas rolando.
export function criarGoiabeira() {
  const g = new THREE.Group();
  g.add(malha(new THREE.CylinderGeometry(0.2, 0.3, 2.2, 8), toon(0x7a5230), 0, 1.1, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.add(malha(new THREE.SphereGeometry(0.9, 10, 8), toon(i % 2 ? 0x3a7d44 : 0x52b788), Math.cos(a) * 0.7, 2.6 + (i % 2) * 0.3, Math.sin(a) * 0.7));
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    g.add(malha(new THREE.SphereGeometry(0.16, 8, 6), toon(0x8fbf3a), Math.cos(a) * 1.3, 2.3 + Math.sin(i * 3) * 0.4, Math.sin(a) * 1.3));
  }
  contornar(g, 0.015);
  return g;
}

export function criarFumaca() {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshBasicMaterial({ color: 0x999999, transparent: true, opacity: 0.7 }));
  return m;
}

export { brilho };
