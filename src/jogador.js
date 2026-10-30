// Física e controle do personagem. A posição (pos) é o ponto entre os pés.
import * as THREE from 'three';
import { AJUSTES } from './config.js';
import { criarBia, animarBia } from './modelos/bia.js';
import { criarPudim } from './modelos/itens.js';
import { criarSombraRedonda } from './sombra.js';
import { som } from './som.js';

const RAIO = 0.34;     // metade da largura da "caixa de colisão"
const ALTURA = 1.0;
const FOLGA = 0.001;
const TEMPO_COIOTE = 0.1;    // ainda dá para pular logo depois de sair da beirada
const MEMORIA_PULO = 0.12;   // apertar pulo um pouco antes de tocar o chão também vale

export class Jogador {
  constructor(cena, { roupa = 'florido', externo = null } = {}) {
    this.cena = cena;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.direcao = 0;
    this.noChao = false;
    this.chaoAtual = null;
    this.coiote = 0;
    this.memoriaPulo = 0;
    this.giro = 0;
    this.recargaGiro = 0;
    this.morto = false;
    this.tempoMorto = 0;
    this.tempo = 0;

    this.modelo = new THREE.Group();
    this.visual = externo?.cena ?? criarBia(roupa);
    this.modelo.add(this.visual);
    this.externo = externo;
    if (externo) {
      this.mixer = new THREE.AnimationMixer(externo.cena);
      this.acoes = Object.fromEntries(externo.animacoes.map((clip) => [clip.name.toLowerCase(), this.mixer.clipAction(clip)]));
      this.acaoAtual = null;
    }
    cena.add(this.modelo);
    this.sombra = criarSombraRedonda();
    cena.add(this.sombra);
    this.invencivel = 0;
    this.companheiros = [];
  }

  // Pudins que acompanham a Bia (cada um aguenta um golpe).
  definirPudins(n) {
    while (this.companheiros.length < n) {
      const p = criarPudim();
      p.scale.setScalar(0.7);
      this.cena.add(p);
      this.companheiros.push(p);
    }
    while (this.companheiros.length > n) this.cena.remove(this.companheiros.pop());
  }

  remover() {
    this.cena.remove(this.modelo, this.sombra);
    this.definirPudins(0);
  }

  get girando() { return this.giro > 0; }

  reposicionar(p) {
    this.pos.copy(p);
    this.vel.set(0, 0, 0);
    this.morto = false;
    this.giro = 0;
    this.direcao = Math.PI; // olhando para a frente da fase (-Z)
    this.modelo.visible = true;
    this.modelo.scale.setScalar(1);
    this.modelo.rotation.set(0, this.direcao, 0);
    this.invencivel = 1.2;
  }

  // Levou um golpe com pudim: fica piscando e invencível um pouquinho.
  protegido() {
    this.invencivel = 1.5;
    this.quicar(7);
  }

  morrer() {
    if (this.morto) return false;
    this.morto = true;
    this.tempoMorto = 0;
    this.vel.set(0, 8, 0);
    som.morte();
    return true;
  }

  quicar(v) {
    this.vel.y = v;
    this.noChao = false;
    this.chaoAtual = null;
  }

  passo(dt, entrada, mundo) {
    this.tempo += dt;
    if (this.invencivel > 0) this.invencivel -= dt;
    if (this.morto) {
      this.tempoMorto += dt;
      this.vel.y -= AJUSTES.gravidade * dt;
      this.pos.y += this.vel.y * dt * 0.5;
      this.modelo.rotation.y += dt * 12;
      this.modelo.scale.setScalar(Math.max(1 - this.tempoMorto, 0.01));
      return;
    }

    // Plataforma que se mexe leva o jogador junto.
    if (this.chaoAtual?.tipo === 'movel') this.pos.add(this.chaoAtual.dono.delta);

    // Andar
    const alvoX = entrada.x * AJUSTES.velocidade, alvoZ = entrada.z * AJUSTES.velocidade;
    const acel = AJUSTES.aceleracao * (this.noChao ? 1 : AJUSTES.atritoNoAr) * dt;
    this.vel.x = aproximar(this.vel.x, alvoX, acel);
    this.vel.z = aproximar(this.vel.z, alvoZ, acel);
    if (entrada.x || entrada.z) this.direcao = Math.atan2(entrada.x, entrada.z);

    // Pular
    this.coiote = this.noChao ? TEMPO_COIOTE : this.coiote - dt;
    this.memoriaPulo = entrada.pulou ? MEMORIA_PULO : this.memoriaPulo - dt;
    if (this.memoriaPulo > 0 && this.coiote > 0) {
      this.vel.y = AJUSTES.forcaPulo;
      this.memoriaPulo = 0;
      this.coiote = 0;
      this.noChao = false;
      this.chaoAtual = null;
      som.pulo();
    }
    // Soltar o botão cedo = pulo mais baixo
    if (!entrada.segurandoPulo && this.vel.y > 4 && !this.quique) this.vel.y *= 0.6;
    if (this.vel.y <= 0) this.quique = false;

    // Girar
    this.recargaGiro -= dt;
    if (entrada.girou && this.giro <= 0 && this.recargaGiro <= 0) {
      this.giro = AJUSTES.duracaoGiro;
      this.recargaGiro = AJUSTES.duracaoGiro + AJUSTES.recargaGiro;
      som.giro();
    }
    if (this.giro > 0) this.giro -= dt;

    this.vel.y = Math.max(this.vel.y - AJUSTES.gravidade * dt, -30);

    const solidos = mundo.solidosAtivos();
    this.moverEixo('x', this.vel.x * dt, solidos);
    this.moverEixo('z', this.vel.z * dt, solidos);
    this.noChao = false;
    const chaoAntes = this.chaoAtual;
    this.chaoAtual = null;
    const tocou = this.moverEixo('y', this.vel.y * dt, solidos);
    if (tocou && tocou.lado < 0) {
      const quique = chaoAntes === tocou.solido ? null : mundo.pisou(tocou.solido);
      if (quique) { this.vel.y = quique; this.quique = true; } else {
        this.vel.y = 0;
        this.noChao = true;
        this.chaoAtual = tocou.solido;
      }
    } else if (tocou && tocou.lado > 0) {
      this.vel.y = Math.min(this.vel.y, 0);
      mundo.bateuCabeca(tocou.solido);
    }
  }

  // Move num eixo e empurra para fora do que bater. Devolve { solido, lado } do primeiro choque.
  moverEixo(eixo, d, solidos) {
    if (d === 0 && eixo !== 'y') return null;
    this.pos[eixo] += d;
    let choque = null;
    for (const s of solidos) {
      if (!this.sobrepoe(s)) continue;
      if (eixo === 'y') {
        if (d <= 0) this.pos.y = s.max.y;
        else this.pos.y = s.min.y - ALTURA - FOLGA;
      } else {
        const meio = (s.min[eixo] + s.max[eixo]) / 2;
        this.pos[eixo] = this.pos[eixo] < meio ? s.min[eixo] - RAIO - FOLGA : s.max[eixo] + RAIO + FOLGA;
        this.vel[eixo] = 0;
      }
      if (!choque || (eixo === 'y' && d <= 0 && s.max.y >= choque.solido.max.y)) choque = { solido: s, lado: d <= 0 ? -1 : 1 };
    }
    return choque;
  }

  sobrepoe(s) {
    const p = this.pos;
    return p.x + RAIO > s.min.x && p.x - RAIO < s.max.x
      && p.y + ALTURA > s.min.y && p.y < s.max.y - FOLGA
      && p.z + RAIO > s.min.z && p.z - RAIO < s.max.z;
  }

  atualizarVisual(dt, mundo) {
    this.modelo.position.copy(this.pos);
    if (!this.morto) {
      let diferenca = this.direcao - this.modelo.rotation.y;
      diferenca = Math.atan2(Math.sin(diferenca), Math.cos(diferenca));
      this.modelo.rotation.y += diferenca * Math.min(dt * 14, 1);
    }
    const estado = { noChao: this.noChao, velocidadeChao: Math.hypot(this.vel.x, this.vel.z), girando: this.girando, vy: this.vel.y };
    if (this.mixer) this.animarExterno(dt, estado);
    else animarBia(this.visual, estado, this.tempo, dt);
    this.modelo.visible = this.morto || this.invencivel <= 0 || Math.floor(this.invencivel * 12) % 2 === 0;
    this.companheiros.forEach((p, i) => {
      const a = this.tempo * 2.5 + i * Math.PI;
      const alvo = new THREE.Vector3(this.pos.x + Math.cos(a) * 0.9, this.pos.y + 1.5 + Math.sin(this.tempo * 3 + i) * 0.15, this.pos.z + Math.sin(a) * 0.9);
      p.position.lerp(alvo, Math.min(dt * 8, 1));
      p.rotation.y = -a;
    });

    const chao = mundo.alturaChao(this.pos.x, this.pos.y, this.pos.z);
    this.sombra.position.set(this.pos.x, chao + 0.02, this.pos.z);
    const altura = this.pos.y - chao;
    this.sombra.scale.setScalar(Math.max(1 - altura * 0.08, 0.4));
    this.sombra.visible = !this.morto;
  }

  // Modelo do Blender: usa as animações pelo nome (parado, correr, pular, girar).
  animarExterno(dt, estado) {
    const nome = estado.girando ? 'girar' : !estado.noChao ? 'pular' : estado.velocidadeChao > 0.5 ? 'correr' : 'parado';
    const acao = this.acoes[nome] ?? this.acoes.parado;
    if (acao && acao !== this.acaoAtual) {
      acao.reset().fadeIn(0.15).play();
      this.acaoAtual?.fadeOut(0.15);
      this.acaoAtual = acao;
    }
    if (estado.girando && !this.acoes.girar) this.visual.rotation.y += 0.9;
    else if (!estado.girando) this.visual.rotation.y = 0;
    this.mixer.update(dt);
  }
}

function aproximar(atual, alvo, passo) {
  if (atual < alvo) return Math.min(atual + passo, alvo);
  return Math.max(atual - passo, alvo);
}
