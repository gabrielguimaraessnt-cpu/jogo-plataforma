import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Mundo } from './mundo.js';
import { Jogador } from './jogador.js';
import { TEMAS } from './temas.js';
import { ROUPAS } from './modelos/bia.js';
import { lerEntrada, iniciarToque, ACOES, teclasAtuais, definirTecla, restaurarTeclas, nomeTecla, capturarTecla } from './entrada.js';
import { som, alternarSom, contexto } from './som.js';
import { tocarMusica, carregarMinhasMusicas, adicionarMinhasMusicas, apagarMinhasMusicas, escolherModoMusica, proximaMusica, estadoMinhasMusicas, aoMudarMinhasMusicas } from './musica.js';
import { AJUSTES, HISTORIA, TODAS_LIBERADAS } from './config.js';
import { FASES, MUNDOS } from './fases/index.js';
import { enviarRecorde, mostrarRecordes, formatarTempo } from './placar.js';

// ---------- Cena ----------

const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setPixelRatio(Math.min(devicePixelRatio, matchMedia('(pointer: coarse)').matches ? 1.25 : 1.5));
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('jogo').appendChild(renderizador.domElement);

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
const ceu = new THREE.HemisphereLight(0xffffff, 0x6a8f4e, 1.3);
const sol = new THREE.DirectionalLight(0xfff1d6, 2.3);
sol.castShadow = true;
const celular = matchMedia('(pointer: coarse)').matches;
sol.shadow.mapSize.set(celular ? 1024 : 2048, celular ? 1024 : 2048);
Object.assign(sol.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 });
sol.shadow.bias = -0.0006;
cena.add(ceu, sol, sol.target);

// No celular o jogo é sempre na horizontal: se o aparelho estiver em pé, a página inteira é girada.
const ehCelular = matchMedia('(pointer: coarse)').matches;
document.body.classList.toggle('toque', ehCelular);
function redimensionar() {
  const girar = ehCelular && innerHeight > innerWidth;
  document.body.classList.toggle('girado', girar);
  document.body.style.setProperty('--larg', innerWidth + 'px');
  document.body.style.setProperty('--alt', innerHeight + 'px');
  const w = girar ? innerHeight : innerWidth, h = girar ? innerWidth : innerHeight;
  document.body.classList.toggle('tela-baixa', h < 520);
  renderizador.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = camera.aspect < 0.8 ? 75 : 60;
  camera.updateProjectionMatrix();
}
addEventListener('resize', redimensionar);
addEventListener('orientationchange', () => setTimeout(redimensionar, 200));
redimensionar();

// No Android dá para travar de verdade: tela cheia + horizontal no primeiro toque.
if (ehCelular) {
  addEventListener('pointerdown', async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
      await screen.orientation?.lock?.('landscape');
    } catch {}
  }, { once: true });
}

// ---------- Modelo próprio da Bia (opcional, feito no Blender) ----------
// assets/modelos/modelos.json lista os .glb que existem. Hoje só "bia" é usado.

const externos = {};
async function carregarExternos() {
  let nomes = [];
  try { nomes = await (await fetch('assets/modelos/modelos.json', { cache: 'no-cache' })).json(); } catch { return; }
  const carregador = new GLTFLoader();
  await Promise.all(nomes.map(async (nome) => {
    try {
      const gltf = await carregador.loadAsync(`assets/modelos/${nome}.glb`);
      gltf.scene.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
      externos[nome] = { cena: gltf.scene, animacoes: gltf.animations };
    } catch (e) {
      console.warn(`Não consegui carregar ${nome}.glb, usando o modelo padrão.`, e);
    }
  }));
}

// ---------- Progresso salvo no navegador ----------

const progresso = (() => {
  const padrao = { liberada: 1, melhores: {}, aliancas: {}, todasCaixas: {}, roupa: 'florido', terminou: false };
  try { return { ...padrao, ...JSON.parse(localStorage.getItem('bia-progresso') ?? '{}') }; } catch { return padrao; }
})();
function salvar() { try { localStorage.setItem('bia-progresso', JSON.stringify(progresso)); } catch {} }
// Modo teste (config.js) ou atalho ?tudo=1: todas as fases liberadas.
if (TODAS_LIBERADAS || new URLSearchParams(location.search).has('tudo')) progresso.liberada = FASES.length;

// ---------- Estado do jogo ----------

const $ = (id) => document.getElementById(id);
const telas = ['tela-nome', 'tela-musicas', 'tela-menu', 'tela-mapa', 'tela-roupas', 'tela-controles', 'tela-recordes', 'tela-pausa', 'tela-fim', 'tela-gameover', 'tela-casamento'];
function mostrarTela(id) {
  for (const t of telas) $(t).classList.toggle('oculto', t !== id);
  if (id) $(id).querySelector('button.principal, button')?.focus({ preventScroll: true });
}

let estado = 'carregando';
let telaAnterior = 'tela-menu';
let indiceFase = 0;
let mundo = null, jogador = null;
let vidas = 0, flores = 0, pudins = 0, tempoMs = 0, quedas = 0, pegouAlianca = false;
let tempoAviso = 0, tempoCerimonia = 0;

function aviso(texto, duracao = 1.4) {
  const el = $('aviso');
  el.textContent = texto;
  el.classList.remove('oculto');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  tempoAviso = duracao;
}

function perderVida() { if (jogador.morrer()) { quedas++; pudins = 0; jogador.definirPudins(0); } }

const eventos = {
  flores(n) {
    flores += n;
    while (flores >= AJUSTES.floresPorVida) {
      flores -= AJUSTES.floresPorVida;
      vidas++;
      som.vida();
      aviso('+1 vida!');
    }
  },
  aviso,
  dano() {
    if (jogador.morto || jogador.invencivel > 0) return;
    if (pudins > 0) {
      pudins--;
      jogador.definirPudins(pudins);
      jogador.protegido();
      som.inimigo();
      aviso('O pudim te salvou!', 1);
    } else perderVida();
  },
  morreu() { perderVida(); },
  pudim() {
    som.vida();
    if (pudins < AJUSTES.maxPudins) { pudins++; jogador.definirPudins(pudins); aviso('Pudim protetor!', 1.2); } else eventos.flores(10);
  },
  alianca() {
    pegouAlianca = true;
    som.checkpoint();
    aviso('Aliança encontrada! 💍', 2);
    $('hud-alianca').classList.remove('oculto');
  },
  chefe(vidasChefe, msg) {
    $('chefe-barra').classList.toggle('oculto', vidasChefe <= 0);
    $('chefe-vidas').innerHTML = [0, 1, 2].map((i) => `<span class="${i < vidasChefe ? '' : 'vazio'}"></span>`).join('');
    if (msg) aviso(msg, 2);
  },
  venceu() {
    if (estado !== 'jogando') return;
    registrarVitoria();
    if (FASES[indiceFase].final) iniciarCerimonia();
    else { estado = 'fim'; som.vitoria(); mostrarFim(); }
  },
};

function aplicarTema(tema) {
  cena.background = new THREE.Color(tema.ceu);
  cena.fog = new THREE.Fog(...tema.neblina);
  ceu.color.set(tema.luz.ceu);
  ceu.groundColor.set(tema.luz.chao);
  ceu.intensity = tema.luz.forca;
  sol.color.set(tema.luz.sol);
  sol.intensity = tema.luz.forcaSol;
}

function montarFase(indice) {
  mundo?.destruir();
  jogador?.remover();
  const fase = FASES[indice];
  aplicarTema(TEMAS[fase.tema]);
  mundo = new Mundo(cena, fase, eventos);
  criarJogador();
  posicionarCamera(true);
}

function criarJogador() {
  const pos = jogador ? jogador.pos.clone() : null;
  jogador?.remover();
  jogador = new Jogador(cena, { roupa: progresso.roupa, externo: externos.bia ?? null });
  jogador.reposicionar(pos ?? new THREE.Vector3(...FASES[indiceFase].inicio));
}

function comecar(indice = indiceFase) {
  indiceFase = indice;
  jogador?.remover();
  jogador = null;
  montarFase(indice);
  vidas = AJUSTES.vidasIniciais; flores = 0; pudins = 0; tempoMs = 0; quedas = 0; pegouAlianca = false;
  estado = 'jogando';
  mostrarTela(null);
  $('hud').classList.remove('oculto');
  $('hud-alianca').classList.add('oculto');
  $('chefe-barra').classList.add('oculto');
  tocarMusica(TEMAS[FASES[indice].tema].musica);
  aviso(FASES[indice].nome, 2.2);
}

function irParaMenu(tela = 'tela-menu') {
  estado = 'menu';
  if (!mundo || mundo.fase !== FASES[0]) { indiceFase = 0; jogador?.remover(); jogador = null; montarFase(0); }
  $('hud').classList.add('oculto');
  $('chefe-barra').classList.add('oculto');
  $('confete').innerHTML = '';
  tocarMusica('menu');
  if (tela === 'tela-mapa') montarMapa();
  mostrarTela(tela);
}

function registrarVitoria() {
  const num = FASES[indiceFase].numero;
  const melhor = progresso.melhores[num];
  if (!melhor || tempoMs < melhor) progresso.melhores[num] = Math.round(tempoMs);
  if (pegouAlianca) progresso.aliancas[num] = true;
  if (mundo.quebradas >= mundo.totalCaixas) progresso.todasCaixas[num] = true;
  progresso.liberada = Math.max(progresso.liberada, Math.min(indiceFase + 2, FASES.length));
  if (FASES[indiceFase].final) progresso.terminou = true;
  salvar();
}

// ---------- Nome de quem joga (vai para o placar online) ----------

function nomeSalvo() { try { return localStorage.getItem('bia-nome') ?? ''; } catch { return ''; } }

function nomeValido(nome) {
  const partes = nome.trim().split(/\s+/).filter((p) => p.length >= 2);
  return partes.length >= 2;
}

function mostrarJogadorAtual() {
  const nome = nomeSalvo();
  $('jogador-atual').classList.toggle('oculto', !nome);
  $('jogador-nome').textContent = nome;
}

function pedirNome() {
  $('nome-inicial').value = nomeSalvo();
  $('nome-status').textContent = '';
  mostrarTela('tela-nome');
  $('nome-inicial').focus();
}

$('form-nome').addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = $('nome-inicial').value.trim().replace(/\s+/g, ' ');
  if (!nomeValido(nome)) { $('nome-status').textContent = 'Escreva nome e sobrenome, por exemplo: Beatriz Pinheiro.'; return; }
  try { localStorage.setItem('bia-nome', nome); } catch {}
  mostrarJogadorAtual();
  mostrarTela('tela-menu');
});

async function enviarTempo(nome) {
  $('fim-status').textContent = `Enviando o tempo de ${nome}…`;
  try {
    const id = await enviarRecorde({ nome, fase: FASES[indiceFase].numero, tempoMs, caixas: mundo.quebradas, frutas: flores });
    $('fim-status').textContent = `Tempo registrado no placar como ${nome}.`;
    $('form-recorde').classList.add('oculto');
    mostrarRecordes($('lista-recordes-fim'), FASES[indiceFase].numero, id);
  } catch (erro) {
    $('fim-status').textContent = `Não deu para enviar: ${erro.message}`;
    $('form-recorde').classList.remove('oculto');
  }
}

function mostrarFim() {
  const total = mundo.totalCaixas;
  const fase = FASES[indiceFase];
  $('fim-titulo').textContent = mundo.quebradas >= total ? 'Todos os presentes abertos!' : 'Fase concluída!';
  $('fim-resumo').innerHTML = `
    <span>Tempo</span><b>${formatarTempo(tempoMs)}</b>
    <span>Presentes</span><b>${mundo.quebradas}/${total}</b>
    <span>Flores</span><b>${flores}</b>
    <span>Aliança</span><b>${pegouAlianca ? '💍 achou!' : '—'}</b>
    <span>Quedas</span><b>${quedas}</b>`;
  $('fim-status').textContent = '';
  $('nome-jogador').value = nomeSalvo();
  $('botao-proxima').classList.toggle('oculto', indiceFase >= FASES.length - 1);
  mostrarTela('tela-fim');
  // Com o nome já registrado no começo, o tempo vai sozinho para o placar.
  if (nomeValido(nomeSalvo())) { $('form-recorde').classList.add('oculto'); enviarTempo(nomeSalvo()); }
  else { $('form-recorde').classList.remove('oculto'); mostrarRecordes($('lista-recordes-fim'), fase.numero); }
}

$('form-recorde').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = $('nome-jogador').value.trim().replace(/\s+/g, ' ');
  if (!nomeValido(nome)) { $('fim-status').textContent = 'Escreva nome e sobrenome.'; return; }
  try { localStorage.setItem('bia-nome', nome); } catch {}
  mostrarJogadorAtual();
  enviarTempo(nome);
});

// ---------- Controles: trocar as teclas ----------

function montarTeclas() {
  const teclas = teclasAtuais();
  $('lista-teclas').innerHTML = ACOES.map(([acao, nome]) => `<tr><td>${nome}</td>` +
    [0, 1].map((i) => `<td><button class="tecla" data-trocar-tecla="${acao}" data-posicao="${i}">${nomeTecla(teclas[acao][i])}</button></td>`).join('') + '</tr>').join('');
}

$('lista-teclas').addEventListener('click', (e) => {
  const b = e.target.closest('[data-trocar-tecla]');
  if (!b) return;
  b.textContent = 'aperte…';
  b.classList.add('esperando');
  $('aviso-teclas').textContent = 'Aperte a tecla nova (Esc cancela).';
  capturarTecla((codigo) => {
    if (codigo) definirTecla(b.dataset.trocarTecla, +b.dataset.posicao, codigo);
    $('aviso-teclas').textContent = codigo ? `Pronto: ${nomeTecla(codigo)} agora é "${ACOES.find(([a]) => a === b.dataset.trocarTecla)[1]}".` : 'Troca cancelada.';
    montarTeclas();
    $('lista-teclas').querySelector(`[data-trocar-tecla="${b.dataset.trocarTecla}"][data-posicao="${b.dataset.posicao}"]`)?.focus();
  });
});

// ---------- Tela de músicas ----------

function mostrarMusicas(e = estadoMinhasMusicas()) {
  $('modo-jogo').classList.toggle('escolhida', e.modo !== 'minhas' || !e.quantidade);
  $('modo-minhas').classList.toggle('escolhida', e.modo === 'minhas' && e.quantidade > 0);
  $('minhas-resumo').textContent = e.quantidade ? `${e.quantidade} música${e.quantidade > 1 ? 's' : ''} no aparelho` : 'nenhuma música adicionada';
  $('tocando-agora').textContent = e.tocando ? `Tocando: ${e.tocando}` : '';
  $('botao-proxima-musica').classList.toggle('oculto', !e.tocando);
  $('botao-apagar-musicas').classList.toggle('oculto', !e.quantidade);
}
aoMudarMinhasMusicas(mostrarMusicas);

$('arquivos-musica').addEventListener('change', async (e) => {
  const arquivos = [...e.target.files];
  e.target.value = '';
  if (!arquivos.length) return;
  $('tocando-agora').textContent = 'Guardando as músicas…';
  try {
    await adicionarMinhasMusicas(arquivos);
    escolherModoMusica('minhas');
  } catch {
    $('tocando-agora').textContent = 'Não consegui guardar essas músicas neste aparelho.';
  }
});

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-modo-musica]');
  if (!b) return;
  if (b.dataset.modoMusica === 'minhas' && !estadoMinhasMusicas().quantidade) { $('arquivos-musica').click(); return; }
  escolherModoMusica(b.dataset.modoMusica);
});

// ---------- Menus pelo teclado e pelo controle ----------
// Setas/analógico passam de um item para o outro, Enter/Espaço/A escolhe, Esc/B volta.

function navegarMenu(m) {
  const id = telas.find((t) => !$(t).classList.contains('oculto'));
  if (!id || !(m.anterior || m.proximo || m.escolher || m.voltar)) return;
  const itens = [...$(id).querySelectorAll('button, select, input')]
    .filter((el) => !el.disabled && el.getClientRects().length > 0);
  if (!itens.length) return;
  const atual = itens.indexOf(document.activeElement);
  if (m.anterior || m.proximo) {
    const i = atual < 0 ? 0 : (atual + (m.proximo ? 1 : -1) + itens.length) % itens.length;
    itens[i].focus({ preventScroll: true });
    itens[i].scrollIntoView({ block: 'nearest' });
    som.menu();
  } else if (m.escolher && atual >= 0 && itens[atual].tagName === 'BUTTON') {
    itens[atual].click();
  } else if (m.voltar) {
    $(id).querySelector('[data-acao=voltar], [data-acao=continuar]')?.click();
  }
}

// ---------- Mapa, guarda-roupa, recordes ----------

function montarMapa() {
  let indice = 0;
  $('mapa').innerHTML = MUNDOS.map((m) => `
    <div class="mundo"><h3>${m.icone} ${m.nome}</h3>
      ${m.fases.map((f) => {
        const i = indice++;
        const trancada = i >= progresso.liberada;
        const melhor = progresso.melhores[f.numero];
        const extras = [melhor ? '⏱ ' + formatarTempo(melhor) : '', progresso.aliancas[f.numero] ? '💍' : '', progresso.todasCaixas[f.numero] ? '🎁' : ''].filter(Boolean).join(' ');
        return `<button class="fase-botao ${trancada ? 'trancada' : ''}" data-fase="${i}" ${trancada ? 'disabled' : ''}>
          ${trancada ? '🔒' : f.numero + '.'} ${f.nome}<small>${trancada ? 'Termine a anterior' : extras || f.descricao}</small></button>`;
      }).join('')}
    </div>`).join('');
  const total = Object.keys(progresso.aliancas).length;
  $('mapa-resumo').textContent = `Alianças encontradas: ${total} de ${FASES.length}` + (total === FASES.length ? ' — todas! 💍' : '');
}

$('mapa').addEventListener('click', (e) => {
  const b = e.target.closest('[data-fase]');
  if (b && !b.disabled) comecar(+b.dataset.fase);
});

const AMOSTRAS = { florido: 'radial-gradient(circle at 30% 30%, #e07a3f 12%, transparent 13%), radial-gradient(circle at 70% 60%, #c0392b 10%, transparent 11%), #f4e6d4',
  jaqueta: 'linear-gradient(135deg, #231a17 0 50%, #3d5a80 50% 100%)',
  verde: '#56722f', azul: 'radial-gradient(circle at 35% 40%, #4a6fa5 18%, transparent 19%), radial-gradient(circle at 70% 70%, #9db4d8 14%, transparent 15%), #eef2fa' };
function montarRoupas() {
  $('lista-roupas').innerHTML = Object.entries(ROUPAS).map(([chave, r]) =>
    `<button class="roupa ${chave === progresso.roupa ? 'escolhida' : ''}" data-roupa="${chave}"><span class="amostra" style="background:${AMOSTRAS[chave]}"></span>${r.nome}</button>`).join('');
}
$('lista-roupas').addEventListener('click', (e) => {
  const b = e.target.closest('[data-roupa]');
  if (!b) return;
  progresso.roupa = b.dataset.roupa;
  salvar();
  criarJogador();
  jogador.direcao = 0;
  montarRoupas();
});

$('recordes-fase').innerHTML = FASES.map((f) => `<option value="${f.numero}">${f.numero}. ${f.nome}</option>`).join('');
$('recordes-fase').addEventListener('change', () => mostrarRecordes($('lista-recordes-menu'), +$('recordes-fase').value));

document.addEventListener('click', (e) => {
  const acao = e.target.closest('[data-acao]')?.dataset.acao;
  if (!acao) return;
  switch (acao) {
    case 'mapa': irParaMenu('tela-mapa'); telaAnterior = 'tela-menu'; break;
    case 'roupas': estado = 'roupas'; telaAnterior = 'tela-menu'; montarRoupas(); mostrarTela('tela-roupas'); vitrine(true); break;
    case 'controles': telaAnterior = 'tela-menu'; montarTeclas(); $('aviso-teclas').textContent = 'Clique numa tecla para trocar e depois aperte a nova.'; mostrarTela('tela-controles'); break;
    case 'restaurar-teclas': restaurarTeclas(); montarTeclas(); $('aviso-teclas').textContent = 'Teclas padrão de volta.'; break;
    case 'musicas': telaAnterior = 'tela-menu'; mostrarMusicas(); mostrarTela('tela-musicas'); break;
    case 'proxima-musica': proximaMusica(); break;
    case 'apagar-musicas': apagarMinhasMusicas(); break;
    case 'trocar-nome': pedirNome(); break;
    case 'recordes': telaAnterior = 'tela-menu'; mostrarTela('tela-recordes'); mostrarRecordes($('lista-recordes-menu'), +$('recordes-fase').value); break;
    case 'voltar': if (estado === 'roupas') estado = 'menu'; mostrarTela(telaAnterior); break;
    case 'continuar': estado = 'jogando'; mostrarTela(null); break;
    case 'reiniciar': comecar(indiceFase); break;
    case 'proxima': comecar(Math.min(indiceFase + 1, FASES.length - 1)); break;
    case 'creditos': irParaMenu('tela-mapa'); break;
  }
});

// ---------- Datas especiais ----------

function datasEspeciais() {
  const hoje = new Date(new URLSearchParams(location.search).get('hoje') ?? Date.now());
  hoje.setHours(0, 0, 0, 0);
  const dia = 86400000;
  const casamento = new Date(HISTORIA.casamento); casamento.setHours(0, 0, 0, 0);
  const faltam = Math.round((casamento - hoje) / dia);
  $('contagem').textContent = faltam > 1 ? `💍 Faltam ${faltam} dias para o casamento` : faltam === 1 ? '💍 O casamento é amanhã!'
    : faltam === 0 ? '💍 Hoje é o grande dia!' : `💍 Casados há ${-faltam} dias`;
  const { dia: d, mes, anoNascimento } = HISTORIA.aniversario;
  let niver = new Date(hoje.getFullYear(), mes - 1, d);
  if (niver < hoje) niver = new Date(hoje.getFullYear() + 1, mes - 1, d);
  const ate = Math.round((niver - hoje) / dia);
  const idade = niver.getFullYear() - anoNascimento;
  const faixa = $('faixa-aniversario');
  if (ate === 0) { faixa.textContent = `🎂 Feliz aniversário, ${HISTORIA.heroina}! ${idade} anos!`; faixa.classList.remove('oculto'); soltarConfete(80); }
  else if (ate <= 10) { faixa.textContent = `🎂 Faltam ${ate} dia${ate > 1 ? 's' : ''} para os ${idade} anos da ${HISTORIA.heroina}!`; faixa.classList.remove('oculto'); }
}

function soltarConfete(n = 120) {
  const cores = ['#ff4d6d', '#ffd166', '#ffffff', '#ffafcc', '#52b788', '#4cc9f0'];
  const caixa = $('confete');
  for (let i = 0; i < n; i++) {
    const c = document.createElement('i');
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = cores[i % cores.length];
    c.style.animationDuration = 3 + Math.random() * 4 + 's';
    c.style.animationDelay = Math.random() * 3 + 's';
    caixa.appendChild(c);
  }
  setTimeout(() => { caixa.innerHTML = ''; }, 11000);
}

// ---------- Cerimônia final ----------

function iniciarCerimonia() {
  estado = 'cerimonia';
  tempoCerimonia = 0;
  $('hud').classList.add('oculto');
  tocarMusica('casamento');
  som.vitoria();
  const c = mundo.chegada.position;
  jogador.reposicionar(new THREE.Vector3(c.x - 0.6, c.y + 0.2, c.z - 0.4));
  jogador.invencivel = 0;
  jogador.direcao = 0;
  jogador.modelo.rotation.y = 0.2;
  mundo.noivo.position.set(c.x + 0.6, c.y + 0.2, c.z - 0.4);
  mundo.noivo.rotation.y = -0.2;
  const noivo = HISTORIA.noivo?.trim();
  $('casal').textContent = noivo ? `${HISTORIA.heroina} ❤ ${noivo}` : `${HISTORIA.heroina} ❤`;
  $('mensagem-final').textContent = HISTORIA.mensagemFinal;
  const total = Object.keys(progresso.aliancas).length;
  $('casamento-resumo').innerHTML = `<span>Tempo</span><b>${formatarTempo(tempoMs)}</b><span>Alianças no jogo todo</span><b>${total} de ${FASES.length}</b>`;
}

// ---------- Câmera ----------

const alvoCamera = new THREE.Vector3();
const olharCamera = new THREE.Vector3();
let alturaCamera = 0;
function posicionarCamera(instantaneo = false, dt = 0) {
  const p = jogador.pos;
  let base = jogador.noChao || p.y < alturaCamera ? p.y : alturaCamera;
  if (p.y > alturaCamera + 2.5) base = p.y - 2.5;
  alturaCamera = instantaneo ? p.y : alturaCamera + (base - alturaCamera) * Math.min(dt * 4, 1);
  alvoCamera.set(p.x * 0.55, alturaCamera + 3.6, p.z + 7.2);
  olharCamera.set(p.x * 0.75, alturaCamera + 1, p.z - 3.5);
  if (instantaneo) camera.position.copy(alvoCamera);
  else camera.position.lerp(alvoCamera, Math.min(dt * 6, 1));
  camera.lookAt(olharCamera);
  luzSegue(p);
}

function luzSegue(p) {
  sol.position.set(p.x + 8, p.y + 20, p.z + 10);
  sol.target.position.set(p.x, p.y, p.z - 4);
}

// Câmera de frente para a Bia, deixando ela na metade de cima da tela (o painel fica embaixo).
function vitrine(instantaneo, dt = 0, centro = jogador.pos, distancia = 3.4) {
  const alvo = new THREE.Vector3(centro.x, centro.y + 1.7, centro.z + distancia);
  if (instantaneo) camera.position.copy(alvo); else camera.position.lerp(alvo, Math.min(dt * 4, 1));
  camera.lookAt(centro.x, centro.y - 0.1, centro.z);
  luzSegue(centro);
}

// ---------- HUD ----------

function atualizarHud() {
  $('hud-flores').textContent = flores;
  $('hud-vidas').textContent = vidas;
  $('hud-pudins').textContent = pudins;
  $('hud-caixas').textContent = `${mundo.quebradas}/${mundo.totalCaixas}`;
  $('hud-tempo').textContent = formatarTempo(tempoMs);
}

// ---------- Laço principal ----------

const PASSO = 1 / 120;
let acumulado = 0;
let ultimo = performance.now();
let tempoMenu = 0;
const nada = { x: 0, z: 0, segurandoPulo: false, pulou: false, girou: false };

function quadro(agora) {
  requestAnimationFrame(quadro);
  const dt = Math.min((agora - ultimo) / 1000, 0.1);
  ultimo = agora;
  const entrada = lerEntrada();

  if (entrada.som) aviso(alternarSom() ? 'Som ligado' : 'Som desligado', 1);
  if (entrada.proximaMusica) { proximaMusica(); const e = estadoMinhasMusicas(); if (e.tocando) aviso(e.tocando, 1.5); }

  if (estado === 'jogando' && entrada.pausou) { estado = 'pausa'; mostrarTela('tela-pausa'); }
  else if (estado === 'pausa' && entrada.pausou) { estado = 'jogando'; mostrarTela(null); }
  else if (estado !== 'jogando') navegarMenu(entrada.menu);

  if (estado === 'jogando') {
    acumulado += dt;
    let passos = 0;
    while (acumulado >= PASSO && passos < 12) {
      mundo.atualizarMoveis(PASSO);
      jogador.passo(PASSO, entrada, mundo);
      mundo.atualizar(PASSO, jogador);
      entrada.pulou = false;
      entrada.girou = false;
      if (!jogador.morto && estado === 'jogando') tempoMs += PASSO * 1000;
      acumulado -= PASSO;
      passos++;
      if (estado !== 'jogando') break;
    }
    if (estado === 'jogando' && jogador.morto && jogador.tempoMorto > 1.4) {
      vidas--;
      if (vidas <= 0) {
        estado = 'gameover';
        $('hud').classList.add('oculto');
        $('chefe-barra').classList.add('oculto');
        mostrarTela('tela-gameover');
      } else {
        jogador.reposicionar(mundo.checkpoint.clone().add(new THREE.Vector3(0, 0.05, 0)));
        posicionarCamera(true);
      }
    }
    jogador.atualizarVisual(dt, mundo);
    if (estado === 'jogando') { posicionarCamera(false, dt); atualizarHud(); }
  } else if (estado === 'menu' || estado === 'carregando') {
    tempoMenu += dt;
    if (mundo) {
      mundo.atualizarMoveis(dt);
      mundo.atualizar(dt, { ...jogador, pos: new THREE.Vector3(0, -100, 0), morto: true, girando: false, vel: new THREE.Vector3() });
      const z = 4 - ((tempoMenu * 4) % 150);
      camera.position.set(Math.sin(tempoMenu * 0.3) * 4, 6, z + 8);
      camera.lookAt(0, 1.5, z - 6);
      luzSegue(new THREE.Vector3(0, 0, z));
      jogador.atualizarVisual(dt, mundo);
    }
  } else if (estado === 'roupas') {
    // Vitrine: a Bia de frente, girando devagar.
    tempoMenu += dt;
    jogador.passo(dt, nada, mundo);
    jogador.direcao = Math.sin(tempoMenu * 0.8) * 0.6;
    jogador.invencivel = 0;
    jogador.atualizarVisual(dt, mundo);
    vitrine(false, dt);
  } else if (estado === 'cerimonia') {
    tempoCerimonia += dt;
    mundo.atualizarMoveis(dt);
    const c = mundo.chegada.position;
    if (tempoCerimonia % 4 < dt) jogador.giro = AJUSTES.duracaoGiro * 1.5;
    if (jogador.giro > 0) jogador.giro -= dt;
    jogador.atualizarVisual(dt, mundo);
    for (const o of mundo.animados) o.userData.animar(mundo.tempo);
    const a = Math.sin(tempoCerimonia * 0.25) * 0.5;
    const centro = new THREE.Vector3(c.x, c.y + 0.2, c.z - 0.4);
    camera.position.set(centro.x + Math.sin(a) * 4.6, centro.y + 2.1, centro.z + Math.cos(a) * 4.6);
    camera.lookAt(centro.x, centro.y - 0.1, centro.z);
    luzSegue(centro);
    if (tempoCerimonia > 1.5 && $('tela-casamento').classList.contains('oculto') && estado === 'cerimonia') {
      mostrarTela('tela-casamento');
      soltarConfete(160);
    }
  } else if (estado === 'fim') {
    jogador.atualizarVisual(dt, mundo);
    jogador.modelo.rotation.y += dt * 2;
  }

  $('toque').classList.toggle('oculto', !(temToque && (estado === 'jogando' || estado === 'pausa')));
  if (tempoAviso > 0) {
    tempoAviso -= dt;
    if (tempoAviso <= 0) $('aviso').classList.add('oculto');
  }
  if (mundo) renderizador.render(cena, camera);
}

addEventListener('pointerdown', () => { try { contexto(); } catch {} });
addEventListener('keydown', () => { try { contexto(); } catch {} });

const temToque = iniciarToque();
datasEspeciais();
await carregarExternos();
await carregarMinhasMusicas();
montarFase(0);
estado = 'menu';
mostrarJogadorAtual();
if (nomeValido(nomeSalvo())) mostrarTela('tela-menu'); else pedirNome();
tocarMusica('menu');
requestAnimationFrame(quadro);

// Acesso pelo console do navegador para testes: __jogo.mundo, __jogo.jogador
window.__jogo = { get mundo() { return mundo; }, get jogador() { return jogador; }, comecar, get estado() { return estado; }, progresso };
