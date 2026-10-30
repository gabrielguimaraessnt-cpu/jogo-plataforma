// Monta a fase a partir dos dados (src/fases/*.js) e cuida de tudo que não é o jogador:
// colisões, caixas, frutas, inimigos, plataformas que se movem, partículas e a chegada.
import * as THREE from 'three';
import {
  blocoSolo, materiaisCaixa, criarBesouro, animarBesouro, criarCaju, criarArvore, criarArbusto,
  criarPedra, criarFlor, criarChegada, aleatorio, mat,
} from './modelos.js';
import { som } from './som.js';
import { AJUSTES } from './config.js';

const geoCaixa = new THREE.BoxGeometry(1, 1, 1);
const geoLasca = new THREE.BoxGeometry(0.18, 0.18, 0.06);
const ALTURA_AGUA = -7;

function solido(min, max, tipo, dono = null) {
  return { min: new THREE.Vector3(...min), max: new THREE.Vector3(...max), tipo, dono, ativo: true };
}

export class Mundo {
  constructor(cena, fase, eventos, externos = {}) {
    this.cena = cena;
    this.fase = fase;
    this.eventos = eventos; // { frutas(n), aviso(txt), morreu(motivo), venceu() }
    this.externos = externos;
    this.raiz = new THREE.Group();
    cena.add(this.raiz);

    this.solidos = [];
    this.caixas = [];
    this.frutas = [];
    this.inimigos = [];
    this.moveis = [];
    this.particulas = [];
    this.explosoes = [];
    this.quebradas = 0;
    this.checkpoint = new THREE.Vector3(...fase.inicio);
    this.tempo = 0;

    this.montarSolo();
    this.montarMoveis();
    this.montarCaixas();
    this.montarFrutas();
    this.montarInimigos();
    this.montarCenario();
    this.chegada = externos.chegada?.clone(true) ?? criarChegada();
    this.chegada.position.set(...fase.chegada);
    this.raiz.add(this.chegada);
  }

  destruir() {
    this.cena.remove(this.raiz);
    this.raiz.traverse((o) => { if (o.geometry && !o.geometry.compartilhada) o.geometry.dispose?.(); });
  }

  get totalCaixas() { return this.caixas.filter((c) => c.tipo !== 'ferro').length; }

  // ---------- montagem ----------

  montarSolo() {
    const rnd = aleatorio(this.fase.sementeCenario ?? 1);
    let zMax = -Infinity, zMin = Infinity;
    for (const p of this.fase.plataformas) {
      const [x, y, z] = p.pos, [w, h, d] = p.tam;
      const m = blocoSolo(w, h, d, p.tipo);
      m.position.set(x, y, z);
      this.raiz.add(m);
      this.solidos.push(solido([x - w / 2, y - h / 2, z - d / 2], [x + w / 2, y + h / 2, z + d / 2], 'solo'));
      zMax = Math.max(zMax, z + d / 2);
      zMin = Math.min(zMin, z - d / 2);

      // Chão de grama ganha margens de mato dos dois lados e paredes invisíveis na beirada.
      if (p.tipo === 'grama') {
        const topo = y + h / 2;
        for (const lado of [-1, 1]) {
          const margem = blocoSolo(14, h + 2, d, 'grama');
          margem.position.set(x + lado * (w / 2 + 7), y - 1 + 0.6, z);
          this.raiz.add(margem);
          const bx = x + lado * (w / 2 + 0.25);
          this.solidos.push(solido([bx - 0.25, topo - 1, z - d / 2], [bx + 0.25, topo + 30, z + d / 2], 'parede'));
          for (let zz = z + d / 2 - 1; zz > z - d / 2; zz -= 1.2 + rnd() * 2) {
            const distancia = w / 2 + 1 + rnd() * 9;
            const sorteio = rnd();
            const enfeite = sorteio < 0.45 ? (this.externos.arvore?.clone(true) ?? criarArvore(rnd))
              : sorteio < 0.75 ? criarArbusto(rnd) : sorteio < 0.88 ? criarPedra(rnd) : criarFlor(rnd);
            enfeite.position.set(x + lado * distancia, topo + 0.6, zz);
            this.raiz.add(enfeite);
          }
        }
        // florzinhas e tufos no caminho, só enfeite
        for (let i = 0; i < d / 3; i++) {
          const f = criarFlor(rnd);
          f.position.set(x + (rnd() - 0.5) * (w - 1), topo, z + (rnd() - 0.5) * d);
          f.scale.setScalar(0.7);
          this.raiz.add(f);
        }
      }
    }
    // Paredes no começo e no fim da fase.
    this.solidos.push(solido([-30, -50, zMax], [30, 50, zMax + 1], 'parede'));
    this.solidos.push(solido([-30, -50, zMin - 1], [30, 50, zMin], 'parede'));

    // Rio lá embaixo.
    const agua = new THREE.Mesh(new THREE.PlaneGeometry(200, zMax - zMin + 120),
      new THREE.MeshStandardMaterial({ color: 0x2a7fb8, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.9 }));
    agua.rotation.x = -Math.PI / 2;
    agua.position.set(0, ALTURA_AGUA, (zMax + zMin) / 2);
    this.raiz.add(agua);
    this.agua = agua;
  }

  montarMoveis() {
    for (const dado of this.fase.moveis ?? []) {
      const [w, h, d] = dado.tam;
      const m = blocoSolo(w, h, d, 'pedra');
      this.raiz.add(m);
      const base = new THREE.Vector3(...dado.pos);
      const movel = { malha: m, base, desloca: new THREE.Vector3(...(dado.desloca ?? [0, 0, 0])), vel: dado.vel ?? 0,
        tam: new THREE.Vector3(w, h, d), atual: base.clone(), delta: new THREE.Vector3() };
      movel.solido = solido([0, 0, 0], [0, 0, 0], 'movel', movel);
      this.solidos.push(movel.solido);
      this.moveis.push(movel);
      this.posicionarMovel(movel, 0);
    }
  }

  posicionarMovel(movel, t) {
    const fator = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 * movel.vel);
    const nova = movel.base.clone().addScaledVector(movel.desloca, fator);
    movel.delta.subVectors(nova, movel.atual);
    movel.atual.copy(nova);
    movel.malha.position.copy(nova);
    movel.solido.min.copy(nova).addScaledVector(movel.tam, -0.5);
    movel.solido.max.copy(nova).addScaledVector(movel.tam, 0.5);
  }

  montarCaixas() {
    for (const dado of this.fase.caixas) {
      const pos = new THREE.Vector3(...dado.pos);
      const malha = this.externos['caixa-' + dado.tipo]?.clone(true) ?? new THREE.Mesh(geoCaixa, materiaisCaixa[dado.tipo]);
      malha.castShadow = malha.receiveShadow = true;
      malha.position.copy(pos);
      this.raiz.add(malha);
      const caixa = { tipo: dado.tipo, pos, malha, viva: true, pavio: -1, vy: 0, fixa: false };
      caixa.solido = solido([pos.x - 0.5, pos.y - 0.5, pos.z - 0.5], [pos.x + 0.5, pos.y + 0.5, pos.z + 0.5], 'caixa', caixa);
      this.solidos.push(caixa.solido);
      this.caixas.push(caixa);
    }
    // Caixa que já começa no ar (de propósito, como as em cima das molas) não cai.
    for (const c of this.caixas) c.fixa = !this.apoiada(c);
  }

  montarFrutas() {
    for (const p of this.fase.frutas) {
      const malha = this.externos.caju?.clone(true) ?? criarCaju();
      malha.position.set(...p);
      this.raiz.add(malha);
      this.frutas.push({ malha, pos: new THREE.Vector3(...p), viva: true, fase: Math.random() * 6 });
    }
  }

  montarInimigos() {
    for (const dado of this.fase.inimigos ?? []) {
      const malha = this.externos.besouro?.clone(true) ?? criarBesouro();
      this.raiz.add(malha);
      const de = new THREE.Vector3(...dado.de), ate = new THREE.Vector3(...dado.ate);
      this.inimigos.push({ malha, de, ate, vel: dado.vel ?? 2, dist: de.distanceTo(ate), t: 0, vivo: true, voo: null, pos: de.clone() });
    }
  }

  montarCenario() {
    const rnd = aleatorio(99);
    const zs = this.solidos.filter((s) => s.tipo === 'solo').flatMap((s) => [s.min.z, s.max.z]);
    const zMin = Math.min(...zs), zMax = Math.max(...zs);
    // morros ao longe
    for (let z = zMax; z > zMin - 40; z -= 14) {
      for (const lado of [-1, 1]) {
        const morro = new THREE.Mesh(new THREE.IcosahedronGeometry(10 + rnd() * 10, 0), mat(rnd() < 0.5 ? 0x3d8b4a : 0x4f9d5a));
        morro.position.set(lado * (32 + rnd() * 20), -6, z - rnd() * 10);
        morro.scale.y = 0.6 + rnd() * 0.5;
        this.raiz.add(morro);
      }
    }
    // nuvens
    for (let i = 0; i < 18; i++) {
      const nuvem = new THREE.Group();
      for (let k = 0; k < 3; k++) {
        const bola = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 + rnd() * 1.5, 0), mat(0xffffff, { emissive: 0x666666 }));
        bola.position.set(k * 2 - 2, rnd(), rnd());
        nuvem.add(bola);
      }
      nuvem.position.set((rnd() - 0.5) * 80, 18 + rnd() * 10, zMax - rnd() * (zMax - zMin + 40));
      this.raiz.add(nuvem);
    }
  }

  // ---------- consultas ----------

  solidosAtivos() { return this.solidos.filter((s) => s.ativo); }

  apoiada(caixa) {
    const { min, max } = caixa.solido;
    return this.solidos.some((s) => s.ativo && s !== caixa.solido && s.tipo !== 'parede'
      && s.max.y <= min.y + 0.01 && s.max.y >= min.y - 0.05
      && s.min.x < max.x - 0.05 && s.max.x > min.x + 0.05 && s.min.z < max.z - 0.05 && s.max.z > min.z + 0.05);
  }

  // Altura do chão logo abaixo de um ponto (para a sombra redonda).
  alturaChao(x, y, z) {
    let melhor = -Infinity;
    for (const s of this.solidos) {
      if (!s.ativo || s.tipo === 'parede') continue;
      if (x >= s.min.x && x <= s.max.x && z >= s.min.z && z <= s.max.z && s.max.y <= y + 0.05 && s.max.y > melhor) melhor = s.max.y;
    }
    return melhor === -Infinity ? ALTURA_AGUA : melhor;
  }

  // ---------- eventos que o jogador provoca ----------

  // Jogador caiu em cima de um sólido. Devolve a velocidade de quique (ou null para pousar normal).
  pisou(s) {
    if (s.tipo !== 'caixa') return null;
    const c = s.dono;
    switch (c.tipo) {
      case 'mola': som.mola(); this.balancar(c); return AJUSTES.pulinhoMola;
      case 'explosiva':
        if (c.pavio < 0) { c.pavio = 1.6; som.pavio(); }
        return AJUSTES.pulinhoCaixa;
      case 'ferro': return null;
      default: this.acertarCaixa(c, 'pisar'); return AJUSTES.pulinhoCaixa;
    }
  }

  bateuCabeca(s) {
    if (s.tipo === 'caixa' && ['comum', 'checkpoint'].includes(s.dono.tipo)) this.acertarCaixa(s.dono, 'cabeca');
  }

  acertarCaixa(c, modo) {
    if (!c.viva || c.tipo === 'ferro') return;
    if (c.tipo === 'explosiva') {
      if (modo === 'pisar') return;
      this.explodir(c);
      return;
    }
    if (c.tipo === 'mola' && modo !== 'giro' && modo !== 'explosao') return;
    this.quebrar(c);
    if (c.tipo === 'checkpoint') {
      this.checkpoint.set(c.pos.x, c.pos.y - 0.5, c.pos.z);
      som.checkpoint();
      this.eventos.aviso('Checkpoint!');
    } else if (modo !== 'explosao') {
      const n = c.tipo === 'mola' ? 1 : 1 + Math.floor(Math.random() * 4);
      this.eventos.frutas(n);
      for (let i = 0; i < n; i++) this.soltarCajuVoando(c.pos);
    }
  }

  quebrar(c) {
    c.viva = false;
    c.solido.ativo = false;
    this.raiz.remove(c.malha);
    this.quebradas++;
    som.caixa();
    const cor = { comum: 0xc8873e, mola: 0x2bb24c, checkpoint: 0x5aa9e6, explosiva: 0xc1121f }[c.tipo] ?? 0xaaaaaa;
    for (let i = 0; i < 10; i++) {
      const lasca = new THREE.Mesh(geoLasca, mat(cor));
      lasca.position.copy(c.pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8));
      this.adicionarParticula(lasca, new THREE.Vector3((Math.random() - 0.5) * 6, 3 + Math.random() * 5, (Math.random() - 0.5) * 6), 0.9);
    }
  }

  explodir(c) {
    if (!c.viva) return;
    this.quebrar(c);
    som.explosao();
    const bola = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0xffa200, transparent: true, opacity: 0.85 }));
    bola.position.copy(c.pos);
    const luz = new THREE.PointLight(0xff8800, 40, 10);
    luz.position.copy(c.pos);
    this.raiz.add(bola, luz);
    this.explosoes.push({ bola, luz, vida: 0.45 });

    const RAIO = 2.2;
    for (const outra of this.caixas) {
      if (!outra.viva || outra.pos.distanceTo(c.pos) > 1.6) continue;
      if (outra.tipo === 'explosiva') { if (outra.pavio < 0 || outra.pavio > 0.15) outra.pavio = 0.15; } else this.acertarCaixa(outra, 'explosao');
    }
    for (const ini of this.inimigos) if (ini.vivo && ini.pos.distanceTo(c.pos) < RAIO + 0.5) this.derrubarInimigo(ini, c.pos);
    this.ultimaExplosao = { pos: c.pos.clone(), raio: RAIO };
  }

  derrubarInimigo(ini, origem) {
    ini.vivo = false;
    const dir = ini.pos.clone().sub(origem).setY(0).normalize();
    ini.voo = new THREE.Vector3(dir.x * 10, 9, dir.z * 10 - 4);
    som.inimigo();
  }

  balancar(c) { c.balanco = 0.25; }

  soltarCajuVoando(pos) {
    const caju = criarCaju();
    caju.position.copy(pos);
    this.adicionarParticula(caju, new THREE.Vector3((Math.random() - 0.5) * 3, 6 + Math.random() * 3, (Math.random() - 0.5) * 3), 0.6, true);
  }

  adicionarParticula(malha, vel, vida, encolhe = false) {
    this.raiz.add(malha);
    this.particulas.push({ malha, vel, vida, total: vida, encolhe, giro: new THREE.Vector3(Math.random() * 10, Math.random() * 10, 0) });
  }

  // ---------- atualização por quadro ----------

  atualizarMoveis(dt) {
    this.tempo += dt;
    for (const m of this.moveis) this.posicionarMovel(m, this.tempo);
  }

  atualizar(dt, jogador) {
    const centro = jogador.pos.clone().add(new THREE.Vector3(0, 0.5, 0));

    // Caixas: pavio, queda e balanço.
    for (const c of this.caixas) {
      if (!c.viva) continue;
      if (c.pavio >= 0) {
        const antes = c.pavio;
        c.pavio -= dt;
        c.malha.scale.setScalar(1 + Math.sin(this.tempo * 40) * 0.06);
        if (Math.floor(antes * 4) !== Math.floor(c.pavio * 4)) som.pavio();
        if (c.pavio <= 0) this.explodir(c);
        continue;
      }
      if (c.balanco > 0) {
        c.balanco -= dt;
        const s = 1 + Math.sin(c.balanco * 40) * c.balanco;
        c.malha.scale.set(1 + (1 - s) * 0.5, s, 1 + (1 - s) * 0.5);
      }
      if (c.tipo !== 'ferro' && !c.fixa && !this.apoiada(c)) {
        c.vy -= AJUSTES.gravidade * dt;
        let dy = c.vy * dt;
        // Para em cima do que estiver embaixo.
        for (const s of this.solidos) {
          if (!s.ativo || s === c.solido || s.tipo === 'parede') continue;
          if (s.min.x < c.solido.max.x - 0.05 && s.max.x > c.solido.min.x + 0.05 && s.min.z < c.solido.max.z - 0.05 && s.max.z > c.solido.min.z + 0.05
            && s.max.y <= c.solido.min.y + 0.01 && s.max.y > c.solido.min.y + dy) dy = s.max.y - c.solido.min.y;
        }
        c.pos.y += dy;
        c.solido.min.y += dy; c.solido.max.y += dy;
        c.malha.position.copy(c.pos);
        if (c.pos.y < ALTURA_AGUA - 2) { c.viva = false; c.solido.ativo = false; this.raiz.remove(c.malha); }
      } else c.vy = 0;
    }

    // Giro acerta caixas e inimigos por perto.
    if (jogador.girando) {
      for (const c of this.caixas) {
        if (!c.viva) continue;
        const dx = c.pos.x - centro.x, dz = c.pos.z - centro.z, dy = c.pos.y - centro.y;
        if (dx * dx + dz * dz < 1.3 * 1.3 && Math.abs(dy) < 1.1) this.acertarCaixa(c, 'giro');
      }
    }

    // Inimigos
    for (const ini of this.inimigos) {
      if (ini.voo) {
        ini.voo.y -= AJUSTES.gravidade * dt;
        ini.pos.addScaledVector(ini.voo, dt);
        ini.malha.position.copy(ini.pos);
        ini.malha.rotation.x += dt * 12;
        if (ini.pos.y < ALTURA_AGUA - 5) { this.raiz.remove(ini.malha); ini.voo = null; }
        continue;
      }
      if (!ini.vivo) continue;
      ini.t += dt * ini.vel / Math.max(ini.dist, 0.01);
      const ida = (ini.t % 2) < 1;
      const f = ida ? ini.t % 1 : 1 - (ini.t % 1);
      const suave = 0.5 - 0.5 * Math.cos(f * Math.PI);
      ini.pos.lerpVectors(ini.de, ini.ate, suave);
      ini.malha.position.copy(ini.pos);
      const alvo = ida ? ini.ate : ini.de;
      ini.malha.rotation.y = Math.atan2(alvo.x - ini.pos.x, alvo.z - ini.pos.z);
      animarBesouro(ini.malha, this.tempo);

      if (jogador.morto) continue;
      const dx = ini.pos.x - jogador.pos.x, dz = ini.pos.z - jogador.pos.z;
      const perto = dx * dx + dz * dz < (jogador.girando ? 1.5 * 1.5 : 0.8 * 0.8);
      const alturaOk = jogador.pos.y < ini.pos.y + 0.7 && jogador.pos.y + 1 > ini.pos.y;
      if (!perto || !alturaOk) continue;
      if (jogador.girando) this.derrubarInimigo(ini, jogador.pos);
      else if (jogador.vel.y < 0 && jogador.pos.y > ini.pos.y + 0.25) {
        this.derrubarInimigo(ini, jogador.pos);
        jogador.quicar(AJUSTES.pulinhoCaixa);
      } else this.eventos.morreu('inimigo');
    }

    // Explosão perto do jogador
    if (this.ultimaExplosao) {
      const { pos, raio } = this.ultimaExplosao;
      if (!jogador.morto && centro.distanceTo(pos) < raio) this.eventos.morreu('explosao');
      this.ultimaExplosao = null;
    }

    // Frutas
    for (const f of this.frutas) {
      if (!f.viva) continue;
      f.malha.rotation.y += dt * 3;
      f.malha.position.y = f.pos.y + Math.sin(this.tempo * 3 + f.fase) * 0.1;
      if (!jogador.morto && f.pos.distanceToSquared(centro) < 0.9 * 0.9) {
        f.viva = false;
        this.raiz.remove(f.malha);
        this.eventos.frutas(1);
        som.fruta();
      }
    }

    // Partículas
    for (let i = this.particulas.length - 1; i >= 0; i--) {
      const p = this.particulas[i];
      p.vida -= dt;
      p.vel.y -= AJUSTES.gravidade * 0.7 * dt;
      p.malha.position.addScaledVector(p.vel, dt);
      p.malha.rotation.x += p.giro.x * dt;
      p.malha.rotation.y += p.giro.y * dt;
      if (p.encolhe) p.malha.scale.setScalar(Math.max(p.vida / p.total, 0.01));
      if (p.vida <= 0) { this.raiz.remove(p.malha); this.particulas.splice(i, 1); }
    }
    for (let i = this.explosoes.length - 1; i >= 0; i--) {
      const e = this.explosoes[i];
      e.vida -= dt;
      const t = 1 - e.vida / 0.45;
      e.bola.scale.setScalar(0.5 + t * 2.4);
      e.bola.material.opacity = 0.85 * (1 - t);
      e.luz.intensity = 40 * (1 - t);
      if (e.vida <= 0) { this.raiz.remove(e.bola, e.luz); e.bola.geometry.dispose(); e.bola.material.dispose(); this.explosoes.splice(i, 1); }
    }

    // Chegada
    const { anel, brilho } = this.chegada.userData;
    if (anel) anel.rotation.y += dt * 1.5;
    if (brilho) { brilho.rotation.y = anel.rotation.y; brilho.material.opacity = 0.4 + Math.sin(this.tempo * 4) * 0.15; }
    const ch = this.chegada.position;
    if (!jogador.morto && Math.hypot(ch.x - jogador.pos.x, ch.z - jogador.pos.z) < 1.3 && Math.abs(ch.y - jogador.pos.y) < 2.5) this.eventos.venceu();

    if (!jogador.morto && jogador.pos.y < ALTURA_AGUA + 1) this.eventos.morreu('queda');
  }
}
