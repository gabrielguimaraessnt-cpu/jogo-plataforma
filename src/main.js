import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Mundo } from './mundo.js';
import { Jogador } from './jogador.js';
import { lerEntrada, iniciarToque } from './entrada.js';
import { som, alternarSom } from './som.js';
import { AJUSTES } from './config.js';
import { FASES } from './fases/index.js';
import { enviarRecorde, mostrarRecordes, formatarTempo } from './placar.js';

// ---------- Cena ----------

const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderizador.shadowMap.enabled = true;
renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('jogo').appendChild(renderizador.domElement);

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
cena.add(new THREE.HemisphereLight(0xe6f6ff, 0x4a6b3a, 1.3));
const sol = new THREE.DirectionalLight(0xfff1d6, 2.4);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 80 });
sol.shadow.bias = -0.0005;
cena.add(sol, sol.target);

function redimensionar() {
  renderizador.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < 0.8 ? 75 : 60; // celular em pé: um pouco mais aberto
  camera.updateProjectionMatrix();
}
addEventListener('resize', redimensionar);
redimensionar();

// ---------- Modelos externos (opcionais, feitos no Blender) ----------

// assets/modelos/modelos.json lista os .glb que existem (ex.: ["zuca", "besouro"]).
// Nomes aceitos: zuca, besouro, caju, arvore, chegada, caixa-comum, caixa-mola, caixa-checkpoint, caixa-explosiva, caixa-ferro.
const externos = {};
async function carregarExternos() {
  let nomes = [];
  try { nomes = await (await fetch('assets/modelos/modelos.json', { cache: 'no-cache' })).json(); } catch { return; }
  const carregador = new GLTFLoader();
  await Promise.all(nomes.map(async (nome) => {
    const url = `assets/modelos/${nome}.glb`;
    try {
      const gltf = await carregador.loadAsync(url);
      gltf.scene.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
      externos[nome] = nome === 'zuca' ? { cena: gltf.scene, animacoes: gltf.animations } : gltf.scene;
      console.info(`Modelo próprio carregado: ${url}`);
    } catch (e) {
      console.warn(`Não consegui carregar ${url}, usando o modelo padrão.`, e);
    }
  }));
}

// ---------- Estado do jogo ----------

const $ = (id) => document.getElementById(id);
const telas = ['tela-menu', 'tela-controles', 'tela-recordes', 'tela-pausa', 'tela-fim', 'tela-gameover'];
function mostrarTela(id) {
  for (const t of telas) $(t).classList.toggle('oculto', t !== id);
  const botao = id && $(id).querySelector('button');
  botao?.focus();
}

let estado = 'carregando';
let telaAnterior = 'tela-menu';
let indiceFase = 0;
let mundo = null;
let jogador = null;
let vidas = 0, frutas = 0, tempoMs = 0, mortes = 0;
let idRecorde = null;
let tempoAviso = 0;

function aviso(texto, duracao = 1.4) {
  const el = $('aviso');
  el.textContent = texto;
  el.classList.remove('oculto');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  tempoAviso = duracao;
}

const eventos = {
  frutas(n) {
    frutas += n;
    while (frutas >= AJUSTES.frutasPorVida) {
      frutas -= AJUSTES.frutasPorVida;
      vidas++;
      som.vida();
      aviso('+1 vida!');
    }
  },
  aviso,
  morreu() { if (jogador.morrer()) mortes++; },
  venceu() {
    if (estado !== 'jogando') return;
    estado = 'fim';
    som.vitoria();
    mostrarFim();
  },
};

function montarFase(indice) {
  mundo?.destruir();
  if (jogador) { cena.remove(jogador.modelo, jogador.sombra); }
  const fase = FASES[indice];
  cena.background = new THREE.Color(fase.ceu);
  cena.fog = new THREE.Fog(...fase.neblina);
  mundo = new Mundo(cena, fase, eventos, externos);
  jogador = new Jogador(cena, externos.zuca ?? null);
  jogador.reposicionar(new THREE.Vector3(...fase.inicio));
  posicionarCamera(true);
}

function comecar(indice = indiceFase) {
  indiceFase = indice;
  montarFase(indice);
  vidas = AJUSTES.vidasIniciais; frutas = 0; tempoMs = 0; mortes = 0; idRecorde = null;
  estado = 'jogando';
  mostrarTela(null);
  $('hud').classList.remove('oculto');
  aviso(FASES[indice].nome, 2);
}

function sairParaMenu() {
  estado = 'menu';
  montarFase(indiceFase);
  $('hud').classList.add('oculto');
  mostrarTela('tela-menu');
}

function mostrarFim() {
  const total = mundo.totalCaixas;
  $('fim-titulo').textContent = mundo.quebradas >= total ? 'Fase concluída — todas as caixas!' : 'Fase concluída!';
  $('fim-resumo').innerHTML = `
    <span>Tempo</span><b>${formatarTempo(tempoMs)}</b>
    <span>Caixas</span><b>${mundo.quebradas}/${total}</b>
    <span>Cajus</span><b>${frutas}</b>
    <span>Quedas</span><b>${mortes}</b>`;
  $('fim-status').textContent = '';
  $('form-recorde').classList.remove('oculto');
  try { $('nome-jogador').value = localStorage.getItem('zuca-nome') ?? ''; } catch {}
  mostrarTela('tela-fim');
  $('nome-jogador').focus();
  mostrarRecordes($('lista-recordes-fim'), FASES[indiceFase].numero);
}

$('form-recorde').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = $('nome-jogador').value.trim();
  if (nome.length < 2) { $('fim-status').textContent = 'O nome precisa ter pelo menos 2 letras.'; return; }
  try { localStorage.setItem('zuca-nome', nome); } catch {}
  $('fim-status').textContent = 'Enviando…';
  try {
    idRecorde = await enviarRecorde({ nome, fase: FASES[indiceFase].numero, tempoMs, caixas: mundo.quebradas, frutas });
    $('fim-status').textContent = 'Tempo enviado!';
    $('form-recorde').classList.add('oculto');
    mostrarRecordes($('lista-recordes-fim'), FASES[indiceFase].numero, idRecorde);
  } catch (erro) {
    $('fim-status').textContent = `Não deu para enviar: ${erro.message}`;
  }
});

document.addEventListener('click', (e) => {
  const acao = e.target.closest('[data-acao]')?.dataset.acao;
  if (!acao) return;
  switch (acao) {
    case 'jogar': comecar(0); break;
    case 'controles': telaAnterior = 'tela-menu'; mostrarTela('tela-controles'); break;
    case 'recordes': telaAnterior = 'tela-menu'; mostrarTela('tela-recordes'); mostrarRecordes($('lista-recordes-menu'), 1); break;
    case 'voltar': mostrarTela(telaAnterior); break;
    case 'continuar': estado = 'jogando'; mostrarTela(null); break;
    case 'reiniciar': comecar(indiceFase); break;
    case 'sair': sairParaMenu(); break;
  }
});

// ---------- Câmera ----------

const alvoCamera = new THREE.Vector3();
const olharCamera = new THREE.Vector3();
let alturaCamera = 0;
function posicionarCamera(instantaneo = false, dt = 0) {
  const p = jogador.pos;
  // A câmera acompanha a altura devagar, para não sacudir a cada pulo.
  let base = jogador.noChao || p.y < alturaCamera ? p.y : alturaCamera;
  if (p.y > alturaCamera + 2.5) base = p.y - 2.5;
  alturaCamera = instantaneo ? p.y : alturaCamera + (base - alturaCamera) * Math.min(dt * 4, 1);
  alvoCamera.set(p.x * 0.55, alturaCamera + 3.8, p.z + 7.4);
  olharCamera.set(p.x * 0.75, alturaCamera + 0.9, p.z - 3.5);
  if (instantaneo) camera.position.copy(alvoCamera);
  else camera.position.lerp(alvoCamera, Math.min(dt * 6, 1));
  camera.lookAt(olharCamera);
  sol.position.set(p.x + 8, p.y + 20, p.z + 10);
  sol.target.position.set(p.x, p.y, p.z - 4);
}

// ---------- HUD ----------

function atualizarHud() {
  $('hud-frutas').textContent = frutas;
  $('hud-vidas').textContent = vidas;
  $('hud-caixas').textContent = `${mundo.quebradas}/${mundo.totalCaixas}`;
  $('hud-tempo').textContent = formatarTempo(tempoMs);
}

// ---------- Laço principal ----------

const PASSO = 1 / 120;
let acumulado = 0;
let ultimo = performance.now();
let tempoMenu = 0;

function quadro(agora) {
  requestAnimationFrame(quadro);
  const dt = Math.min((agora - ultimo) / 1000, 0.1);
  ultimo = agora;
  const entrada = lerEntrada();

  if (entrada.som) aviso(alternarSom() ? 'Som ligado' : 'Som desligado', 1);

  if (estado === 'jogando' && entrada.pausou) {
    estado = 'pausa';
    mostrarTela('tela-pausa');
  } else if (estado === 'pausa' && entrada.pausou) {
    estado = 'jogando';
    mostrarTela(null);
  }

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
    if (jogador.morto && jogador.tempoMorto > 1.4) {
      vidas--;
      if (vidas <= 0) {
        estado = 'gameover';
        $('hud').classList.add('oculto');
        mostrarTela('tela-gameover');
      } else {
        jogador.reposicionar(mundo.checkpoint.clone().add(new THREE.Vector3(0, 0.05, 0)));
        posicionarCamera(true);
      }
    }
    jogador.atualizarVisual(dt, mundo);
    posicionarCamera(false, dt);
    atualizarHud();
  } else if (estado === 'menu' || estado === 'carregando') {
    // Passeio da câmera pela fase no fundo do menu
    tempoMenu += dt;
    mundo?.atualizarMoveis(dt);
    if (mundo) {
      const z = 4 - ((tempoMenu * 4) % 190);
      camera.position.set(Math.sin(tempoMenu * 0.3) * 4, 6, z + 8);
      camera.lookAt(0, 1.5, z - 6);
      sol.position.set(8, 22, z + 10);
      sol.target.position.set(0, 0, z - 4);
      jogador.atualizarVisual(dt, mundo);
    }
  } else if (estado === 'fim') {
    jogador.atualizarVisual(dt, mundo);
    jogador.modelo.rotation.y += dt * 2;
  }

  if (tempoAviso > 0) {
    tempoAviso -= dt;
    if (tempoAviso <= 0) $('aviso').classList.add('oculto');
  }
  if (mundo) renderizador.render(cena, camera);
}

iniciarToque();
await carregarExternos();
montarFase(0);
estado = 'menu';
mostrarTela('tela-menu');
requestAnimationFrame(quadro);

// Acesso pelo console do navegador para testes: __jogo.mundo, __jogo.jogador
window.__jogo = { get mundo() { return mundo; }, get jogador() { return jogador; }, comecar };
