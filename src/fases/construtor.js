// Construtor de fases por trechos. A fase anda para a frente (Z negativo).
// Dentro de um trecho, as posições usam "dz" = metros desde o começo do trecho e "x" = lado (-4 a 4).
//
// Exemplo:
//   fase.reto(20)                         chão de 20 m
//       .caixa('comum', -2, 5)            presente em x=-2, 5 m depois do começo do trecho
//       .linha(0, 2, 0, 18, 6)            6 flores em linha
//       .inimigo('maquininha', -3, 3, 12) máquina andando de lado em dz=12
//   fase.buraco(4)                        buraco de 4 m (com arco de flores por cima)
//   fase.subir(1.5)                       o próximo chão fica 1,5 m mais alto

export class Fase {
  constructor(meta) {
    this.d = { ...meta, plataformas: [], moveis: [], caixas: [], frutas: [], inimigos: [], goiabeiras: [], pudins: [], aliancas: [], placas: [], esteiras: [], inicio: [0, 0, 2] };
    this.z = 6;
    this.y = 0;
    this.ini = 6;
    this.yIni = 0;
    this.topoAnterior = 0;
  }

  p(x, dz, dy = 0) { return [x, this.yIni + dy, this.ini - dz]; }

  reto(comp, { largura = 8, x = 0 } = {}) {
    this.ini = this.z;
    this.yIni = this.y;
    this.d.plataformas.push({ pos: [x, this.y - 2, this.z - comp / 2], tam: [largura, 4, comp], tipo: 'chao' });
    this.z -= comp;
    this.topoAnterior = this.y;
    return this;
  }

  subir(dy) { this.y += dy; return this; }

  buraco(comp = 4, { flores = true } = {}) {
    if (flores) this.d.frutas.push(...arco([0, this.topoAnterior + 1, this.z], [0, this.y + 1, this.z - comp], 2.2, Math.max(3, Math.round(comp * 1.3))));
    this.z -= comp;
    return this;
  }

  // Plataformas que se mexem por cima de um abismo. eixo: 'x' (lado a lado), 'y' (sobe e desce), 'z' (vai e volta).
  moveis(qtd = 3, { eixo = 'x', amp = 5, vel = 0.4, vao = 2.5, tam = 3, alternar = true } = {}) {
    for (let i = 0; i < qtd; i++) {
      this.z -= vao;
      const sinal = alternar && i % 2 ? -1 : 1;
      const base = eixo === 'x' ? [-sinal * amp / 2, this.y - 0.25, this.z - tam / 2] : [0, this.y - 0.25, this.z - tam / 2];
      const desloca = eixo === 'x' ? [sinal * amp, 0, 0] : eixo === 'y' ? [0, amp, 0] : [0, 0, -amp];
      this.d.moveis.push({ pos: base, tam: [tam, 0.5, tam], desloca, vel, fase: i * 0.25 });
      this.d.frutas.push([0, this.y + 1.3 + (eixo === 'y' ? amp / 2 : 0), this.z - tam / 2]);
      this.z -= tam + (eixo === 'z' ? amp : 0);
    }
    this.z -= vao;
    this.topoAnterior = this.y;
    return this;
  }

  // Plataformas soltas: lista de [x, alturaRelativa]
  pedras(lista, { vao = 2.4, tam = 3 } = {}) {
    let antes = this.topoAnterior;
    for (const [x, dy] of lista) {
      this.z -= vao;
      const topo = this.y + dy;
      this.d.plataformas.push({ pos: [x, topo - 0.4, this.z - tam / 2], tam: [tam, 0.8, tam], tipo: 'bloco' });
      this.d.frutas.push(...arco([x, antes + 1, this.z + vao], [x, topo + 1, this.z - tam / 2], 1.2, 3).slice(1));
      antes = topo;
      this.z -= tam;
    }
    this.z -= vao;
    this.topoAnterior = antes;
    return this;
  }

  // ---------- trechos especiais (variedade) ----------

  // Ponte estreita sem paredes: dá para cair dos lados.
  ponte(comp, { largura = 2.4, x = 0, flores = true } = {}) {
    this.ini = this.z; this.yIni = this.y;
    this.d.plataformas.push({ pos: [x, this.y - 0.4, this.z - comp / 2], tam: [largura, 0.8, comp], tipo: 'bloco' });
    if (flores) this.linha(x, 1, x, comp - 1, Math.max(2, Math.round(comp / 2.5)));
    this.z -= comp;
    this.topoAnterior = this.y;
    return this;
  }

  // Escada de blocos subindo (ou descendo, com degrau negativo). No fim, o chão fica na altura do último degrau.
  escada(n, { degrau = 0.8, vao = 1.4, tam = 2.6, x = 0 } = {}) {
    for (let i = 0; i < n; i++) {
      this.z -= vao;
      this.y += degrau;
      this.d.plataformas.push({ pos: [x, this.y - 0.4, this.z - tam / 2], tam: [tam, 0.8, tam], tipo: 'bloco' });
      this.d.frutas.push([x, this.y + 1, this.z - tam / 2]);
      this.z -= tam;
    }
    this.z -= vao;
    this.topoAnterior = this.y;
    return this;
  }

  // Blocos alternando esquerda e direita.
  zigueBlocos(n, { amp = 2.6, vao = 1.6, tam = 2.4, subida = 0 } = {}) {
    let antes = this.topoAnterior;
    for (let i = 0; i < n; i++) {
      this.z -= vao;
      const x = i % 2 ? amp : -amp;
      const topo = this.y + subida * (i + 1);
      this.d.plataformas.push({ pos: [x, topo - 0.4, this.z - tam / 2], tam: [tam, 0.8, tam], tipo: 'bloco' });
      this.d.frutas.push([x, topo + 1, this.z - tam / 2]);
      antes = topo;
      this.z -= tam;
    }
    this.y += subida * n;
    this.z -= vao;
    this.topoAnterior = antes;
    return this;
  }

  // Plataformas que tremem e desabam pouco depois de a Bia pisar (voltam depois de alguns segundos).
  desabam(n, { vao = 1.3, tam = 2.6, x = 0, zigue = 1.8 } = {}) {
    for (let i = 0; i < n; i++) {
      this.z -= vao;
      const px = x + (zigue ? (i % 2 ? zigue : -zigue) : 0);
      this.d.moveis.push({ pos: [px, this.y - 0.25, this.z - tam / 2], tam: [tam, 0.5, tam], cai: true });
      this.d.frutas.push([px, this.y + 1, this.z - tam / 2]);
      this.z -= tam;
    }
    this.z -= vao;
    this.topoAnterior = this.y;
    return this;
  }

  // Esteira rolante no meio do chão: empurra a Bia (vel negativa = para a frente, positiva = para trás).
  esteira(comp, { vel = 2.5, largura = 4, lateral = false } = {}) {
    this.reto(comp);
    this.d.esteiras.push({ pos: [0, this.yIni, this.ini - comp / 2], tam: [largura, comp - 1], empurra: lateral ? [vel, 0, 0] : [0, 0, vel] });
    return this;
  }

  // Chão de gelo: escorrega (a Bia demora para frear e para virar).
  gelo(comp, { largura = 8 } = {}) {
    this.ini = this.z; this.yIni = this.y;
    this.d.plataformas.push({ pos: [0, this.y - 2, this.z - comp / 2], tam: [largura, 4, comp], tipo: 'chao', gelo: true });
    this.z -= comp;
    this.topoAnterior = this.y;
    return this;
  }

  // Campo de trampolins: caixas de som no chão, com flores e presentes lá no alto.
  trampolins(n, { vao = 4.5, zigue = 0, presentes = true } = {}) {
    this.reto((n + 1) * vao);
    for (let i = 0; i < n; i++) {
      const dz = (i + 1) * vao;
      const x = zigue ? (i % 2 ? zigue : -zigue) : 0;
      this.caixa('mola', x, dz);
      this.d.frutas.push(...arco(this.p(x, dz, 1.5), this.p(x, dz + vao * 0.8, 1.5), 4, 5).slice(1, 4));
      if (presentes && i % 2 === 0) this.caixaNoAr('comum', x, dz, 5.2);
    }
    return this;
  }

  caixa(tipo, x, dz, andar = 0) {
    this.d.caixas.push({ tipo, pos: [x, this.yIni + 0.5 + andar, this.ini - dz] });
    return this;
  }
  pilha(tipo, x, dz, n) { for (let i = 0; i < n; i++) this.caixa(tipo, x, dz, i); return this; }
  // caixa solta no ar (fica parada mesmo sem nada embaixo)
  caixaNoAr(tipo, x, dz, altura) { this.d.caixas.push({ tipo, pos: [x, this.yIni + altura, this.ini - dz], fixa: true }); return this; }

  // Muro de caixas de metal com uma caixa de som (mola) na frente.
  muroMola(dz, { altura = 3, largura = 8 } = {}) {
    this.caixa('mola', 0, dz);
    // muro: fica transparente quando passa entre a câmera e a Bia (não atrapalha a visão)
    for (let x = -largura / 2 + 0.5; x < largura / 2; x += 1) for (let a = 0; a < altura; a++) {
      this.d.caixas.push({ tipo: 'ferro', pos: [x, this.yIni + 0.5 + a, this.ini - dz - 3], muro: true });
    }
    this.linha(0, dz, 0, dz + 3.5, 4, 3.5);
    return this;
  }

  flor(x, dz, alt = 1) { this.d.frutas.push(this.p(x, dz, alt)); return this; }
  linha(x1, dz1, x2, dz2, n, alt = 1) { this.d.frutas.push(...fila(this.p(x1, dz1, alt), this.p(x2, dz2, alt), n)); return this; }
  zigue(dz1, dz2, n, amp = 2.5, alt = 1) {
    for (let i = 0; i < n; i++) { const t = i / (n - 1); this.d.frutas.push(this.p(Math.sin(t * Math.PI * 3) * amp, dz1 + (dz2 - dz1) * t, alt)); }
    return this;
  }

  // Inimigo andando de um lado para o outro (x1 → x2) na distância dz.
  inimigo(tipo, x1, x2, dz, vel = 2.5) { this.d.inimigos.push({ tipo, de: this.p(x1, dz), ate: this.p(x2, dz), vel }); return this; }
  // Inimigo indo e voltando na direção da corrida.
  inimigoFrente(tipo, x, dz1, dz2, vel = 2.5) { this.d.inimigos.push({ tipo, de: this.p(x, dz1), ate: this.p(x, dz2), vel }); return this; }
  // Goiaba parada (pulando no lugar).
  goiaba(x, dz, { pulo = 1.2 } = {}) { this.d.inimigos.push({ tipo: 'goiaba', de: this.p(x, dz), ate: this.p(x, dz), vel: 0, pulo }); return this; }
  // Goiabeira lá na frente: solta goiabas que rolam na direção da Bia.
  goiabeira(x, dzArvore, dzFim, intervalo = 2.2, vel = 6) {
    this.d.goiabeiras.push({ de: this.p(x, dzArvore), ate: this.p(x, dzFim), intervalo, vel });
    return this;
  }

  pudim(x, dz, alt = 1) { this.d.pudins.push(this.p(x, dz, alt)); return this; }
  alianca(x, dz, alt = 1) { this.d.aliancas.push(this.p(x, dz, alt)); return this; }
  placa(x, dz, texto, icone = '') { this.d.placas.push({ pos: this.p(x, dz), texto, icone }); return this; }

  // Arena do chefão no fim do trecho atual (precisa de um reto largo antes).
  chefe(tipo = 'gerente') {
    this.reto(28, { largura: 16 });
    this.d.chefe = { tipo, pos: this.p(0, 22), limites: { xMin: -6.5, xMax: 6.5, zMax: this.ini - 2, zMin: this.ini - 26 } };
    this.d.chegada = this.p(0, 25);
    this.d.chegadaEscondida = true;
    return this;
  }

  fim(dz) {
    this.d.chegada = this.p(0, dz ?? (this.ini - this.z - 4));
    return this;
  }

  pronto() { return this.d; }
}

export function fila(a, b, quantidade) {
  const lista = [];
  for (let i = 0; i < quantidade; i++) {
    const t = quantidade === 1 ? 0 : i / (quantidade - 1);
    lista.push(a.map((v, k) => v + (b[k] - v) * t));
  }
  return lista;
}

export function arco(a, b, altura, quantidade) {
  return fila(a, b, quantidade).map((p, i) => {
    const t = i / (quantidade - 1);
    return [p[0], p[1] + Math.sin(t * Math.PI) * altura, p[2]];
  });
}
