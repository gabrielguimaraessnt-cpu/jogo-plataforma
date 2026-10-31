// Monta a fase a partir dos dados (src/fases/*.js) e cuida de tudo que não é a Bia:
// colisões, caixas, flores, inimigos, goiabeiras, plataformas que se movem, chefão e chegada.
import * as THREE from 'three';
import { TEMAS, bloco, materiaisTema, materiaisDe, placaFase } from './temas.js';
import { criarCaixa, criarFlor, criarAlianca, criarPudim, criarChegada, criarPinheiro } from './modelos/itens.js';
import { criarNoivo } from './modelos/noivo.js';
import { criarMaquininha, animarMaquininha, criarCarretel, criarGoiaba, criarGoiabeira, criarFumaca, criarGnomo, animarGnomo } from './modelos/inimigos.js';
import { toon, aleatorio } from './estilo3d.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { som } from './som.js';
import { AJUSTES, HISTORIA, PONTOS } from './config.js';

const geoLasca = new THREE.BoxGeometry(0.16, 0.16, 0.05);
const ALTURA_BAIXO = -7;

function solido(min, max, tipo, dono = null) {
  return { min: new THREE.Vector3(...min), max: new THREE.Vector3(...max), tipo, dono, ativo: true };
}

export class Mundo {
  constructor(cena, fase, eventos, externos = {}) {
    this.cena = cena;
    this.fase = fase;
    this.tema = TEMAS[fase.tema] ?? TEMAS.familia;
    this.eventos = eventos;
    this.externos = externos;
    this.raiz = new THREE.Group();
    cena.add(this.raiz);

    this.solidos = [];
    this.caixas = [];
    this.flores = [];
    this.coletaveis = [];
    this.inimigos = [];
    this.goiabeiras = [];
    this.moveis = [];
    this.particulas = [];
    this.explosoes = [];
    this.animados = [];
    this.quebradas = 0;
    this.checkpoint = new THREE.Vector3(...fase.inicio);
    this.tempo = 0;
    this.rnd = aleatorio(fase.numero * 101 + 7);

    this.montarSolo();
    this.montarMoveis();
    this.montarCaixas();
    this.montarColetaveis();
    this.montarInimigos();
    this.montarPlacas();
    this.montarEsteiras();
    this.tema.fundo(this.raiz, this.zMin, this.zMax, this.rnd);
    for (const o of this.raiz.children) if (o.userData.animar && !this.animados.includes(o)) this.animados.push(o);
    this.chegada = criarChegada(!!fase.final);
    this.chegada.position.set(...fase.chegada);
    this.chegada.visible = !fase.chegadaEscondida;
    this.raiz.add(this.chegada);
    if (fase.final) this.montarAltar();
    if (fase.noivoTorcendo) {
      const n = criarNoivo({ terno: false });
      n.position.set(...fase.noivoTorcendo);
      n.rotation.y = -Math.PI / 2 + 0.5;
      this.adicionar(n);
    }
    if (fase.chefe) this.chefe = new Chefe(this, fase.chefe);
    this.juntarCenarioParado();
  }

  // Desempenho: o cenário que não se mexe tem milhares de pecinhas. Juntar todas as que usam o mesmo
  // material numa malha só reduz de ~6000 para algumas dezenas de desenhos por quadro.
  juntarCenarioParado() {
    const dinamicos = new Set([
      ...this.caixas.map((c) => c.malha), ...this.flores.map((f) => f.malha), ...this.coletaveis.map((c) => c.malha),
      ...this.inimigos.map((i) => i.malha), ...this.moveis.map((m) => m.malha), ...this.animados,
      this.chegada, this.noivo, this.chefe?.malha, ...(this.esteiras ?? []).map((e) => e.malha),
    ].filter(Boolean));
    this.raiz.updateMatrixWorld(true);
    const inversa = this.raiz.matrixWorld.clone().invert();
    const grupos = new Map();
    const juntadas = [];
    for (const filho of this.raiz.children) {
      if (dinamicos.has(filho)) continue;
      filho.traverse((m) => {
        if (!m.isMesh || Array.isArray(m.material) || m.isInstancedMesh) return;
        const geo = m.geometry;
        if (!geo.attributes.position || !geo.attributes.normal || !geo.attributes.uv) return;
        const g = new THREE.BufferGeometry();
        for (const nome of ['position', 'normal', 'uv']) g.setAttribute(nome, geo.attributes[nome]);
        g.setIndex(geo.index ?? [...Array(geo.attributes.position.count).keys()]);
        g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inversa, m.matrixWorld));
        const chave = m.material.uuid + (m.castShadow ? 's' : '');
        if (!grupos.has(chave)) grupos.set(chave, { material: m.material, sombra: m.castShadow, geos: [] });
        grupos.get(chave).geos.push(g);
        juntadas.push(m);
      });
    }
    for (const m of juntadas) m.parent?.remove(m);
    for (const { material, sombra, geos } of grupos.values()) {
      const unida = mergeGeometries(geos, false);
      if (!unida) continue;
      const malha = new THREE.Mesh(unida, material);
      malha.castShadow = sombra;
      malha.receiveShadow = true;
      malha.frustumCulled = false;
      this.raiz.add(malha);
    }
  }

  destruir() { this.cena.remove(this.raiz); }

  get totalCaixas() { return this.caixas.filter((c) => c.tipo !== 'ferro').length; }

  adicionar(obj) {
    this.raiz.add(obj);
    if (obj.userData.animar) this.animados.push(obj);
    return obj;
  }

  // ---------- montagem ----------

  montarSolo() {
    const tema = this.tema;
    const [lado, topo] = materiaisTema(tema, 'chao');
    const [ladoM, topoM] = materiaisTema(tema, 'margem');
    const [ladoP, topoP] = materiaisTema(tema, 'plataforma');
    let zMax = -Infinity, zMin = Infinity;
    for (const p of this.fase.plataformas) {
      const [x, y, z] = p.pos, [w, h, d] = p.tam;
      const ehChao = p.tipo === 'chao';
      const [ladoG, topoG] = p.gelo ? materiaisDe(lado === ladoP ? 'gelo' : 'neveLado', 'gelo') : [null, null];
      const m = p.gelo ? bloco(w, h, d, ladoG, topoG) : ehChao ? bloco(w, h, d, lado, topo) : bloco(w, h, d, ladoP, topoP);
      m.position.set(x, y, z);
      this.raiz.add(m);
      const sol = solido([x - w / 2, y - h / 2, z - d / 2], [x + w / 2, y + h / 2, z + d / 2], 'solo');
      if (p.gelo) sol.gelo = true;
      this.solidos.push(sol);
      zMax = Math.max(zMax, z + d / 2);
      zMin = Math.min(zMin, z - d / 2);
      if (!ehChao) continue;

      // Margens dos dois lados (mais altas), paredes invisíveis e enfeites.
      const top = y + h / 2;
      for (const s of [-1, 1]) {
        const margem = bloco(16, h + 2, d, ladoM, topoM);
        margem.position.set(x + s * (w / 2 + 8), y - 1 + 0.6, z);
        this.raiz.add(margem);
        const bx = x + s * (w / 2 + 0.25);
        this.solidos.push(solido([bx - 0.25, top - 1, z - d / 2], [bx + 0.25, top + 40, z + d / 2], 'parede'));
        if (tema.beirada) {
          const b = tema.beirada(d - 0.4);
          b.position.set(x + s * (w / 2 + 0.3), top + 0.6, z + d / 2 - 0.2);
          this.raiz.add(b);
        }
        for (let zz = z + d / 2 - 0.8; zz > z - d / 2 + 0.5; zz -= 1.6 + this.rnd() * 2.2) {
          const dist = 0.9 + this.rnd() * 10;
          const enfeite = tema.enfeite(this.rnd, dist);
          enfeite.position.add(new THREE.Vector3(x + s * (w / 2 + dist), top + 0.6, zz));
          enfeite.rotation.y += s > 0 ? -Math.PI / 2 : Math.PI / 2;
          if (dist < 4) enfeite.rotation.y += (this.rnd() - 0.5) * 0.6;
          this.adicionar(enfeite);
        }
      }
      if (tema.tapete) {
        const tapete = new THREE.Mesh(new THREE.PlaneGeometry(2.4, d - 0.2), toon(0xc9184a));
        tapete.rotation.x = -Math.PI / 2;
        tapete.position.set(x, top + 0.01, z);
        tapete.receiveShadow = true;
        this.raiz.add(tapete);
        for (const s of [-1, 1]) {
          const borda = new THREE.Mesh(new THREE.PlaneGeometry(0.15, d - 0.2), toon(0xffd166));
          borda.rotation.x = -Math.PI / 2;
          borda.position.set(x + s * 1.25, top + 0.012, z);
          this.raiz.add(borda);
        }
      }
    }
    this.zMax = zMax;
    this.zMin = zMin;
    this.solidos.push(solido([-40, -50, zMax], [40, 60, zMax + 1], 'parede'));
    this.solidos.push(solido([-40, -50, zMin - 1], [40, 60, zMin], 'parede'));

    const baixo = new THREE.Mesh(new THREE.PlaneGeometry(300, zMax - zMin + 200),
      new THREE.MeshLambertMaterial({ color: tema.baixo.cor, transparent: tema.baixo.opacidade < 1, opacity: tema.baixo.opacidade }));
    baixo.rotation.x = -Math.PI / 2;
    baixo.position.set(0, ALTURA_BAIXO, (zMax + zMin) / 2);
    this.raiz.add(baixo);
  }

  montarMoveis() {
    const [lado, topo] = materiaisTema(this.tema, 'plataforma');
    const [ladoR, topoR] = materiaisDe('rachado', 'rachado');
    for (const dado of this.fase.moveis ?? []) {
      const [w, h, d] = dado.tam;
      const m = dado.cai ? bloco(w, h, d, ladoR, topoR) : bloco(w, h, d, lado, topo);
      this.raiz.add(m);
      const base = new THREE.Vector3(...dado.pos);
      const movel = { malha: m, base, desloca: new THREE.Vector3(...(dado.desloca ?? [0, 0, 0])), vel: dado.vel ?? 0, fase: dado.fase ?? 0,
        tam: new THREE.Vector3(w, h, d), atual: base.clone(), delta: new THREE.Vector3(), cai: !!dado.cai, estado: 'parado', timer: 0, vy: 0 };
      movel.solido = solido([0, 0, 0], [0, 0, 0], 'movel', movel);
      this.solidos.push(movel.solido);
      this.moveis.push(movel);
      this.posicionarMovel(movel, 0);
    }
  }

  posicionarMovel(movel, t) {
    const fator = 0.5 - 0.5 * Math.cos((t * movel.vel + movel.fase) * Math.PI * 2);
    const nova = movel.base.clone().addScaledVector(movel.desloca, fator);
    movel.delta.subVectors(nova, movel.atual);
    movel.atual.copy(nova);
    movel.malha.position.copy(nova);
    movel.solido.min.copy(nova).addScaledVector(movel.tam, -0.5);
    movel.solido.max.copy(nova).addScaledVector(movel.tam, 0.5);
  }

  montarCaixas() {
    let i = 0;
    for (const dado of this.fase.caixas) {
      const pos = new THREE.Vector3(...dado.pos);
      const malha = criarCaixa(dado.tipo, i++);
      malha.position.copy(pos);
      this.raiz.add(malha);
      const caixa = { tipo: dado.tipo, pos, malha, viva: true, pavio: -1, vy: 0, fixa: !!dado.fixa };
      caixa.solido = solido([pos.x - 0.5, pos.y - 0.5, pos.z - 0.5], [pos.x + 0.5, pos.y + 0.5, pos.z + 0.5], 'caixa', caixa);
      this.solidos.push(caixa.solido);
      this.caixas.push(caixa);
    }
    for (const c of this.caixas) if (!c.fixa) c.fixa = !this.apoiada(c);
  }

  montarColetaveis() {
    for (const p of this.fase.frutas) {
      const malha = criarFlor(this.tema.flor);
      malha.position.set(...p);
      this.raiz.add(malha);
      this.flores.push({ malha, pos: new THREE.Vector3(...p), viva: true, fase: Math.random() * 6 });
    }
    for (const p of this.fase.pudins ?? []) {
      const malha = criarPudim();
      malha.position.set(...p);
      malha.scale.setScalar(1.3);
      this.raiz.add(malha);
      this.coletaveis.push({ tipo: 'pudim', malha, pos: new THREE.Vector3(...p), viva: true });
    }
    for (const p of this.fase.aliancas ?? []) {
      const malha = criarAlianca();
      malha.position.set(...p);
      this.raiz.add(malha);
      this.coletaveis.push({ tipo: 'alianca', malha, pos: new THREE.Vector3(...p), viva: true });
    }
  }

  montarInimigos() {
    for (const dado of this.fase.inimigos ?? []) {
      const malha = dado.tipo === 'goiaba' ? criarGoiaba() : dado.tipo === 'carretel' ? criarCarretel()
        : dado.tipo === 'gnomo' ? criarGnomo() : criarMaquininha();
      this.raiz.add(malha);
      const de = new THREE.Vector3(...dado.de), ate = new THREE.Vector3(...dado.ate);
      this.inimigos.push({ tipo: dado.tipo, malha, de, ate, vel: dado.vel ?? 2, pulo: dado.pulo ?? 0, dist: de.distanceTo(ate),
        t: Math.random(), vivo: true, voo: null, pos: de.clone(), invencivel: dado.tipo === 'goiaba' });
    }
    for (const dado of this.fase.goiabeiras ?? []) {
      const arvore = criarGoiabeira();
      const de = new THREE.Vector3(...dado.de), ate = new THREE.Vector3(...dado.ate);
      arvore.position.set(de.x + (de.x >= 0 ? 1 : -1) * 6.5, de.y + 0.6, de.z);
      this.raiz.add(arvore);
      this.goiabeiras.push({ de, ate, intervalo: dado.intervalo, vel: dado.vel, espera: Math.random() * dado.intervalo });
    }
  }

  montarPlacas() {
    for (const p of this.fase.placas ?? []) {
      const pl = placaFase(p.texto, p.icone, this.fase.tema);
      pl.position.set(...p.pos);
      pl.rotation.y = p.pos[0] < 0 ? 0.4 : -0.4;
      this.raiz.add(pl);
    }
  }

  montarAltar() {
    const c = this.chegada.position;
    const noivo = criarNoivo();
    noivo.position.set(c.x + 0.9, c.y + 0.2, c.z - 0.4);
    noivo.rotation.y = 0.3;
    this.adicionar(noivo);
    this.noivo = noivo;
    for (const s of [-1, 1]) {
      const p = criarPinheiro(4.5, { luzes: true, estrela: true });
      p.position.set(c.x + s * 3.5, c.y, c.z - 0.5);
      this.raiz.add(p);
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

  alturaChao(x, y, z) {
    let melhor = -Infinity;
    for (const s of this.solidos) {
      if (!s.ativo || s.tipo === 'parede') continue;
      if (x >= s.min.x && x <= s.max.x && z >= s.min.z && z <= s.max.z && s.max.y <= y + 0.05 && s.max.y > melhor) melhor = s.max.y;
    }
    return melhor === -Infinity ? ALTURA_BAIXO : melhor;
  }

  // ---------- eventos que a Bia provoca ----------

  pisou(s) {
    if (s.tipo !== 'caixa') return null;
    const c = s.dono;
    switch (c.tipo) {
      case 'mola': som.mola(); c.balanco = 0.3; return AJUSTES.pulinhoMola;
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
      if (modo !== 'pisar') this.explodir(c);
      return;
    }
    if (c.tipo === 'mola' && modo !== 'giro' && modo !== 'explosao') return;
    this.quebrar(c);
    if (c.tipo === 'checkpoint') {
      this.checkpoint.set(c.pos.x, c.pos.y - 0.5, c.pos.z);
      som.checkpoint();
      this.eventos.aviso('Checkpoint!');
      const p = criarPinheiro(1.6, { luzes: true, estrela: true });
      p.position.set(c.pos.x, c.pos.y - 0.5, c.pos.z);
      p.scale.setScalar(0.01);
      p.userData.cresce = 0;
      this.raiz.add(p);
      this.particulas.push({ malha: p, crescer: true, vida: 1, total: 1 });
    } else if (c.tipo === 'vida') {
      this.eventos.vidaExtra();
      this.soltarFlorVoando(c.pos);
    } else if (c.tipo === 'tesouro') {
      this.eventos.flores(15);
      this.eventos.aviso('+15 flores!', 1.2);
      for (let i = 0; i < 15; i++) this.soltarFlorVoando(c.pos);
    } else if (modo !== 'explosao') {
      const n = c.tipo === 'mola' ? 1 : 1 + Math.floor(Math.random() * 4);
      this.eventos.flores(n);
      for (let i = 0; i < n; i++) this.soltarFlorVoando(c.pos);
    }
  }

  quebrar(c) {
    c.viva = false;
    c.solido.ativo = false;
    this.raiz.remove(c.malha);
    this.quebradas++;
    this.eventos.pontos(PONTOS.caixa[c.tipo] ?? 100, c.pos, true);
    som.caixa();
    const cores = { comum: [0xff8fab, 0xfff3b0, 0xb8a1ff], mola: [0x26232e, 0x00f5d4], checkpoint: [0x52b788, 0xffffff], explosiva: [0xa0522d, 0x8fbf3a], vida: [0xffe5ec, 0xe63950], tesouro: [0xffc300, 0xffffff] }[c.tipo] ?? [0xaaaaaa];
    for (let i = 0; i < 12; i++) {
      const lasca = new THREE.Mesh(geoLasca, toon(cores[i % cores.length]));
      lasca.position.copy(c.pos).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8));
      this.adicionarParticula(lasca, new THREE.Vector3((Math.random() - 0.5) * 6, 3 + Math.random() * 5, (Math.random() - 0.5) * 6), 0.9);
    }
  }

  explodir(c) {
    if (!c.viva) return;
    this.quebrar(c);
    this.explosaoEm(c.pos, 2.2);
    for (const outra of this.caixas) {
      if (!outra.viva || outra.pos.distanceTo(c.pos) > 1.6) continue;
      if (outra.tipo === 'explosiva') { if (outra.pavio < 0 || outra.pavio > 0.15) outra.pavio = 0.15; } else this.acertarCaixa(outra, 'explosao');
    }
  }

  explosaoEm(pos, raio) {
    som.explosao();
    const bola = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xa7c957, transparent: true, opacity: 0.85 }));
    bola.position.copy(pos);
    const luz = new THREE.PointLight(0xc5e063, 40, 10);
    luz.position.copy(pos);
    this.raiz.add(bola, luz);
    this.explosoes.push({ bola, luz, vida: 0.45 });
    for (let i = 0; i < 10; i++) {
      const g = criarGoiaba();
      g.scale.setScalar(0.35);
      g.userData.escalaBase = 0.35;
      g.position.copy(pos);
      this.adicionarParticula(g, new THREE.Vector3((Math.random() - 0.5) * 8, 5 + Math.random() * 4, (Math.random() - 0.5) * 8), 0.8, true);
    }
    for (const ini of this.inimigos) if (ini.vivo && !ini.invencivel && ini.pos.distanceTo(pos) < raio + 0.5) this.derrubarInimigo(ini, pos);
    (this.explosoesPendentes ??= []).push({ pos: pos.clone(), raio });
  }

  derrubarInimigo(ini, origem) {
    ini.vivo = false;
    this.eventos.pontos(PONTOS.inimigo, ini.pos);
    const dir = ini.pos.clone().sub(origem).setY(0).normalize();
    ini.voo = new THREE.Vector3(dir.x * 10, 9, dir.z * 10 - 4);
    som.inimigo();
  }

  soltarFlorVoando(pos) {
    const f = criarFlor(this.tema.flor);
    f.userData.escalaBase = f.scale.x;
    f.position.copy(pos);
    this.adicionarParticula(f, new THREE.Vector3((Math.random() - 0.5) * 3, 6 + Math.random() * 3, (Math.random() - 0.5) * 3), 0.6, true);
  }

  adicionarParticula(malha, vel, vida, encolhe = false) {
    this.raiz.add(malha);
    this.particulas.push({ malha, vel, vida, total: vida, encolhe, giro: new THREE.Vector3(Math.random() * 10, Math.random() * 10, 0) });
  }

  // ---------- atualização ----------

  atualizarMoveis(dt, jogador) {
    this.tempo += dt;
    for (const m of this.moveis) {
      if (m.cai) this.atualizarDesaba(m, dt, jogador);
      else this.posicionarMovel(m, this.tempo);
    }
  }

  // Plataforma que desaba: treme, cai, some e volta depois de uns segundos.
  atualizarDesaba(m, dt, jogador) {
    const anterior = m.atual.clone();
    if (m.estado === 'parado') {
      if (jogador && jogador.chaoAtual === m.solido) { m.estado = 'treme'; m.timer = 0.5; som.pavio(); }
    } else if (m.estado === 'treme') {
      m.timer -= dt;
      m.malha.position.x = m.atual.x + Math.sin(this.tempo * 60) * 0.05;
      if (m.timer <= 0) { m.estado = 'cai'; m.vy = 0; m.malha.position.x = m.atual.x; }
    } else if (m.estado === 'cai') {
      m.vy -= AJUSTES.gravidade * 0.7 * dt;
      m.atual.y += m.vy * dt;
      if (m.atual.y < m.base.y - 14) { m.estado = 'sumiu'; m.timer = 3; m.solido.ativo = false; m.malha.visible = false; }
    } else if (m.estado === 'sumiu') {
      m.timer -= dt;
      if (m.timer <= 0) { m.estado = 'parado'; m.atual.copy(m.base); m.solido.ativo = true; m.malha.visible = true; }
    }
    m.delta.subVectors(m.atual, anterior);
    if (m.estado !== 'treme') m.malha.position.copy(m.atual);
    m.solido.min.copy(m.atual).addScaledVector(m.tam, -0.5);
    m.solido.max.copy(m.atual).addScaledVector(m.tam, 0.5);
  }

  montarEsteiras() {
    this.esteiras = [];
    for (const e of this.fase.esteiras ?? []) {
      const [x, y, z] = e.pos, [w, d] = e.tam;
      const tex = materiaisDe('esteira', 'esteira')[1].map.clone();
      tex.needsUpdate = true;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1, d / 2);
      if (e.empurra[0]) tex.rotation = Math.PI / 2;
      if (e.empurra[2] > 0 || e.empurra[0] > 0) tex.rotation += Math.PI;
      const malha = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: tex }));
      malha.rotation.x = -Math.PI / 2;
      malha.position.set(x, y + 0.015, z);
      malha.receiveShadow = true;
      this.raiz.add(malha);
      for (const s of [-1, 1]) {
        const borda = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, d), toon(0xffd166));
        borda.position.set(x + s * (w / 2 + 0.1), y + 0.06, z);
        this.raiz.add(borda);
      }
      this.esteiras.push({ min: [x - w / 2, z - d / 2], max: [x + w / 2, z + d / 2], y, empurra: new THREE.Vector3(...e.empurra), tex, malha });
    }
  }

  // Encosta em algo perigoso: decide entre derrotar o inimigo, quicar ou levar dano.
  contato(jogador, alvo, { invencivel = false, raio = 0.8, altura = 0.7 }) {
    const dx = alvo.x - jogador.pos.x, dz = alvo.z - jogador.pos.z;
    const r = jogador.girando && !invencivel ? raio + 0.6 : raio;
    if (dx * dx + dz * dz > r * r) return null;
    if (jogador.pos.y > alvo.y + altura || jogador.pos.y + 1 < alvo.y) return null;
    if (invencivel) return 'dano';
    if (jogador.girando) return 'derrota';
    if (jogador.vel.y < 0 && jogador.pos.y > alvo.y + altura * 0.4) return 'pisou';
    return 'dano';
  }

  atualizar(dt, jogador) {
    const centro = jogador.pos.clone().add(new THREE.Vector3(0, 0.55, 0));
    const t = this.tempo;

    // Esteiras: a faixa anda e empurra a Bia quando ela está em cima.
    for (const e of this.esteiras) {
      e.tex.offset.y -= dt * Math.hypot(e.empurra.x, e.empurra.z) / 2;
      const p = jogador.pos;
      if (!jogador.morto && jogador.noChao && Math.abs(p.y - e.y) < 0.15 && p.x > e.min[0] && p.x < e.max[0] && p.z > e.min[1] && p.z < e.max[1]) {
        p.addScaledVector(e.empurra, dt);
      }
    }

    for (const o of this.animados) o.userData.animar(t);

    // Caixas: pavio, queda e mola
    for (const c of this.caixas) {
      if (!c.viva) continue;
      if (c.pavio >= 0) {
        const antes = c.pavio;
        c.pavio -= dt;
        c.malha.scale.setScalar(1 + Math.sin(t * 40) * 0.06);
        if (Math.floor(antes * 4) !== Math.floor(c.pavio * 4)) som.pavio();
        if (c.pavio <= 0) this.explodir(c);
        continue;
      }
      if (c.balanco > 0) {
        c.balanco -= dt;
        const s = 1 + Math.sin(c.balanco * 40) * c.balanco;
        c.malha.scale.set(1 + (1 - s) * 0.5, s, 1 + (1 - s) * 0.5);
      } else if (c.tipo === 'mola' && c.malha.userData.alto) {
        c.malha.userData.alto.scale.setScalar(1 + Math.max(0, Math.sin(t * Math.PI * 4.26)) * 0.08);
      }
      if (c.tipo !== 'ferro' && !c.fixa && !this.apoiada(c)) {
        c.vy -= AJUSTES.gravidade * dt;
        let dy = c.vy * dt;
        for (const s of this.solidos) {
          if (!s.ativo || s === c.solido || s.tipo === 'parede') continue;
          if (s.min.x < c.solido.max.x - 0.05 && s.max.x > c.solido.min.x + 0.05 && s.min.z < c.solido.max.z - 0.05 && s.max.z > c.solido.min.z + 0.05
            && s.max.y <= c.solido.min.y + 0.01 && s.max.y > c.solido.min.y + dy) dy = s.max.y - c.solido.min.y;
        }
        c.pos.y += dy;
        c.solido.min.y += dy; c.solido.max.y += dy;
        c.malha.position.copy(c.pos);
        if (c.pos.y < ALTURA_BAIXO - 2) { c.viva = false; c.solido.ativo = false; this.raiz.remove(c.malha); }
      } else c.vy = 0;
    }

    // Giro acerta caixas por perto
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
        if (ini.pos.y < ALTURA_BAIXO - 5) { this.raiz.remove(ini.malha); ini.voo = null; }
        continue;
      }
      if (!ini.vivo) continue;
      let ida = true;
      if (ini.rolante) {
        ini.t += dt * ini.vel / ini.dist;
        ini.pos.lerpVectors(ini.de, ini.ate, Math.min(ini.t, 1));
      } else if (ini.dist > 0.01) {
        ini.t += dt * ini.vel / ini.dist;
        ida = (ini.t % 2) < 1;
        const f = ida ? ini.t % 1 : 1 - (ini.t % 1);
        ini.pos.lerpVectors(ini.de, ini.ate, 0.5 - 0.5 * Math.cos(f * Math.PI));
      }
      ini.malha.position.copy(ini.pos);
      if (ini.pulo) ini.malha.position.y += Math.abs(Math.sin(t * 3 + ini.t * 6)) * ini.pulo;
      const alvo = ida ? ini.ate : ini.de;
      if (ini.rolante) ini.malha.rotation.y = 0;
      else if (ini.dist > 0.01) ini.malha.rotation.y = Math.atan2(alvo.x - ini.pos.x, alvo.z - ini.pos.z);
      else ini.malha.rotation.y = Math.atan2(jogador.pos.x - ini.pos.x, jogador.pos.z - ini.pos.z);
      if (ini.tipo === 'maquininha') animarMaquininha(ini.malha, t);
      if (ini.tipo === 'carretel') ini.malha.userData.rolo.rotation.x += dt * ini.vel * 3 * (ida ? 1 : -1);
      if (ini.tipo === 'gnomo') animarGnomo(ini.malha, t + ini.t * 5);
      if (ini.tipo === 'goiaba') ini.malha.userData.fruta.scale.y = 0.95 + Math.sin(t * 6 + ini.t) * 0.05;

      if (jogador.morto) continue;
      const r = this.contato(jogador, ini.malha.position, { invencivel: ini.invencivel, raio: ini.tipo === 'goiaba' ? 0.75 : 0.85 });
      if (r === 'derrota') this.derrubarInimigo(ini, jogador.pos);
      else if (r === 'pisou') { this.derrubarInimigo(ini, jogador.pos); jogador.quicar(AJUSTES.pulinhoCaixa); }
      else if (r === 'dano') this.eventos.dano(ini.tipo);
    }

    // Goiabeiras: goiabas rolando
    for (const gb of this.goiabeiras) {
      gb.espera -= dt;
      if (gb.espera <= 0) {
        gb.espera = gb.intervalo;
        const malha = criarGoiaba();
        this.raiz.add(malha);
        const dir = gb.ate.clone().sub(gb.de);
        const dist = dir.length();
        this.inimigos.push({ tipo: 'goiaba', malha, de: gb.de.clone(), ate: gb.ate.clone(), vel: gb.vel, dist, t: 0, vivo: true, voo: null,
          pos: gb.de.clone(), invencivel: true, rolante: true, pulo: 0 });
      }
    }
    for (let i = this.inimigos.length - 1; i >= 0; i--) {
      const ini = this.inimigos[i];
      if (!ini.rolante) continue;
      ini.malha.userData.fruta.rotation.x -= dt * ini.vel * 3;
      if (ini.t >= 1) { this.raiz.remove(ini.malha); this.inimigos.splice(i, 1); }
    }

    this.chefe?.atualizar(dt, jogador);

    // Explosões perto da Bia
    for (const e of this.explosoesPendentes ?? []) {
      if (!jogador.morto && centro.distanceTo(e.pos) < e.raio) this.eventos.dano('explosao');
    }
    this.explosoesPendentes = [];

    // Flores
    for (const f of this.flores) {
      if (!f.viva) continue;
      f.malha.rotation.y += dt * 2.5;
      f.malha.position.y = f.pos.y + Math.sin(t * 3 + f.fase) * 0.1;
      if (!jogador.morto && f.pos.distanceToSquared(centro) < 0.9 * 0.9) {
        f.viva = false;
        this.raiz.remove(f.malha);
        this.eventos.flores(1);
        som.fruta();
      }
    }
    for (const c of this.coletaveis) {
      if (!c.viva) continue;
      c.malha.rotation.y += dt * 2;
      c.malha.position.y = c.pos.y + Math.sin(t * 2.5) * 0.12;
      if (!jogador.morto && c.pos.distanceToSquared(centro) < 1.0) {
        c.viva = false;
        this.raiz.remove(c.malha);
        if (c.tipo === 'pudim') this.eventos.pudim();
        else this.eventos.alianca();
      }
    }

    // Partículas
    for (let i = this.particulas.length - 1; i >= 0; i--) {
      const p = this.particulas[i];
      p.vida -= dt;
      if (p.crescer) {
        p.malha.scale.setScalar(Math.min(1, (1 - Math.max(p.vida, 0)) * 1.4 + 0.01) * (1 + Math.sin(Math.max(p.vida, 0) * 12) * 0.1));
        if (p.vida <= 0) this.particulas.splice(i, 1);
        continue;
      }
      p.vel.y -= AJUSTES.gravidade * 0.7 * dt;
      p.malha.position.addScaledVector(p.vel, dt);
      p.malha.rotation.x += p.giro.x * dt;
      p.malha.rotation.y += p.giro.y * dt;
      if (p.encolhe) p.malha.scale.setScalar(Math.max(p.vida / p.total, 0.01) * (p.malha.userData.escalaBase ?? 1));
      if (p.vida <= 0) { this.raiz.remove(p.malha); this.particulas.splice(i, 1); }
    }
    for (let i = this.explosoes.length - 1; i >= 0; i--) {
      const e = this.explosoes[i];
      e.vida -= dt;
      const k = 1 - e.vida / 0.45;
      e.bola.scale.setScalar(0.5 + k * 2.4);
      e.bola.material.opacity = 0.85 * (1 - k);
      e.luz.intensity = 40 * (1 - k);
      if (e.vida <= 0) { this.raiz.remove(e.bola, e.luz); e.bola.geometry.dispose(); e.bola.material.dispose(); this.explosoes.splice(i, 1); }
    }

    // Chegada
    const { portal, portalBaixo } = this.chegada.userData;
    portal.material.opacity = 0.35 + Math.sin(t * 4) * 0.15;
    if (this.chegada.visible && !jogador.morto) {
      const ch = this.chegada.position;
      if (Math.abs(ch.x - jogador.pos.x) < 1.4 && Math.abs(ch.z - jogador.pos.z) < 0.9 && Math.abs(ch.y - jogador.pos.y) < 2.5) this.eventos.venceu();
    }
    void portalBaixo;

    if (!jogador.morto && jogador.pos.y < ALTURA_BAIXO + 1) this.eventos.morreu('queda');
  }
}

// ---------- Chefão: o Gerente da XôMaq ----------

class Chefe {
  constructor(mundo, dados) {
    this.mundo = mundo;
    this.lim = dados.limites;
    this.malha = criarMaquininha({ chefe: true });
    this.escala = 2.2;
    this.malha.scale.setScalar(this.escala);
    this.pos = new THREE.Vector3(...dados.pos);
    this.base = this.pos.clone();
    this.malha.position.copy(this.pos);
    mundo.raiz.add(this.malha);
    this.vidas = 3;
    this.estado = 'esperando';
    this.timer = 0;
    this.arremessos = 0;
    this.projeteis = [];
    this.dir = 1;
    this.fumacas = [];
  }

  atualizar(dt, jogador) {
    const m = this.mundo;
    const t = m.tempo;
    if (this.estado === 'derrotado') { this.atualizarProjeteis(dt, jogador); return; }

    // A luta começa quando a Bia entra na arena.
    if (this.estado === 'esperando') {
      animarMaquininha(this.malha, t, 0.5);
      if (jogador.pos.z < this.lim.zMax && !jogador.morto) {
        this.estado = 'andando';
        this.timer = 1.5;
        m.eventos.chefe(this.vidas, 'O Gerente quer bater a meta!');
      }
      return;
    }
    if (jogador.morto && this.estado !== 'andando') { this.estado = 'andando'; this.timer = 2; }

    this.timer -= dt;
    let alvoEscalaY = 1;
    if (this.estado === 'andando') {
      this.pos.x += this.dir * dt * (2.5 + (3 - this.vidas) * 1.2);
      if (this.pos.x > this.lim.xMax - 1) this.dir = -1;
      if (this.pos.x < this.lim.xMin + 1) this.dir = 1;
      animarMaquininha(this.malha, t, 1.2 + (3 - this.vidas) * 0.4);
      this.malha.rotation.y = Math.atan2(jogador.pos.x - this.pos.x, jogador.pos.z - this.pos.z);
      if (this.timer <= 0) {
        this.arremessar(jogador);
        this.arremessos++;
        this.timer = 1.6 - (3 - this.vidas) * 0.25;
        if (this.arremessos >= 3 + (3 - this.vidas)) { this.estado = 'cansado'; this.timer = 3.5; this.arremessos = 0; som.inimigo(); m.eventos.aviso('Pane na máquina!', 1.2); }
      }
    } else if (this.estado === 'cansado') {
      alvoEscalaY = 0.55;
      if (Math.random() < dt * 10) {
        const f = criarFumaca();
        f.position.copy(this.pos).add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 1.5, (Math.random() - 0.5) * 1.5));
        m.adicionarParticula(f, new THREE.Vector3(0, 3, 0), 0.8, true);
      }
      if (this.timer <= 0) { this.estado = 'andando'; this.timer = 1; }
    } else if (this.estado === 'bravo') {
      this.malha.position.y = this.pos.y + Math.abs(Math.sin(this.timer * 10)) * 0.8;
      if (this.timer <= 0) { this.estado = 'andando'; this.timer = 1.2; }
    }
    const sy = this.malha.scale.y / this.escala;
    const novaY = sy + (alvoEscalaY - sy) * Math.min(dt * 8, 1);
    this.malha.scale.set(this.escala * (1 + (1 - novaY) * 0.3), this.escala * novaY, this.escala * (1 + (1 - novaY) * 0.3));
    this.malha.position.x = this.pos.x;
    this.malha.position.z = this.pos.z;
    if (this.estado !== 'bravo') this.malha.position.y = this.pos.y;

    // Contato
    if (!jogador.morto && this.estado !== 'bravo') {
      const topo = this.pos.y + 1.05 * this.escala * novaY;
      const dx = jogador.pos.x - this.pos.x, dz = jogador.pos.z - this.pos.z;
      const perto = dx * dx + dz * dz < 1.5 * 1.5;
      if (perto && jogador.pos.y < topo + 0.2 && jogador.pos.y + 1 > this.pos.y) {
        const pisou = jogador.vel.y < 0 && jogador.pos.y > topo - 0.5;
        if (this.estado === 'cansado' && (pisou || jogador.girando)) this.levarGolpe(jogador);
        else if (pisou) jogador.quicar(AJUSTES.pulinhoCaixa);
        else m.eventos.dano('chefe');
      }
    }
    this.atualizarProjeteis(dt, jogador);
  }

  levarGolpe(jogador) {
    const m = this.mundo;
    this.vidas--;
    som.explosao();
    jogador.quicar(AJUSTES.pulinhoMola * 0.8);
    jogador.vel.z = 6;
    m.eventos.chefe(this.vidas);
    if (this.vidas <= 0) {
      this.estado = 'derrotado';
      m.explosaoEm(this.pos.clone().add(new THREE.Vector3(0, 1, 0)), 0.1);
      m.raiz.remove(this.malha);
      for (let i = 0; i < 20; i++) {
        const peca = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.3), toon(i % 2 ? 0xd62828 : 0xf1f1f1));
        peca.position.copy(this.pos).add(new THREE.Vector3(0, 1.5, 0));
        m.adicionarParticula(peca, new THREE.Vector3((Math.random() - 0.5) * 12, 8 + Math.random() * 6, (Math.random() - 0.5) * 12), 2);
      }
      m.chegada.visible = true;
      m.eventos.pontos(PONTOS.chefe, this.pos);
      m.eventos.aviso('Pedido de demissão aceito!', 2.5);
      som.vitoria();
      return;
    }
    this.estado = 'bravo';
    this.timer = 1;
    m.eventos.aviso(['Ai! Minha meta!', 'Isso vai pro RH!'][2 - this.vidas] ?? 'Ai!', 1.2);
  }

  arremessar(jogador) {
    const m = this.mundo;
    const malha = criarCarretel();
    malha.scale.setScalar(1.2);
    const pos = this.pos.clone().add(new THREE.Vector3(0, 0, 1.2));
    const dir = jogador.pos.clone().sub(pos).setY(0).normalize();
    malha.position.copy(pos);
    malha.rotation.y = Math.atan2(dir.x, dir.z);
    m.raiz.add(malha);
    this.projeteis.push({ malha, pos, vel: dir.multiplyScalar(7), vida: 4, vivo: true });
    som.giro();
  }

  atualizarProjeteis(dt, jogador) {
    const m = this.mundo;
    for (let i = this.projeteis.length - 1; i >= 0; i--) {
      const p = this.projeteis[i];
      p.vida -= dt;
      p.pos.addScaledVector(p.vel, dt);
      p.malha.position.copy(p.pos);
      p.malha.userData.rolo.rotation.x += dt * 20;
      if (p.vivo && !jogador.morto) {
        const r = m.contato(jogador, p.pos, { raio: 0.8 });
        if (r === 'derrota' || r === 'pisou') {
          p.vivo = false;
          p.vida = 0;
          if (r === 'pisou') jogador.quicar(AJUSTES.pulinhoCaixa);
          som.inimigo();
        } else if (r === 'dano') m.eventos.dano('carretel');
      }
      if (p.vida <= 0 || p.pos.z > this.lim.zMax + 4) { m.raiz.remove(p.malha); this.projeteis.splice(i, 1); }
    }
  }
}

export { HISTORIA };
