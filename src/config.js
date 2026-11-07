// Conexão com o Supabase do jogo (projeto "jogo-plataforma").
// A chave abaixo é a chave PÚBLICA (publishable): pode ficar no código do navegador.
// A tabela só aceita leitura; gravar recordes passa pela função registrar_recorde.
export const SUPABASE_URL = 'https://czaomtjzomclqnkkfgkz.supabase.co';
export const SUPABASE_CHAVE = 'sb_publishable_TX4cQaPAQQlZcYtXCBl9Lw_oHj2DlVY';

// Dados pessoais usados nas telas do jogo.
export const HISTORIA = {
  heroina: 'Bia',
  nomeCompleto: 'Beatriz Pinheiro',
  aniversario: { dia: 8, mes: 11, anoNascimento: 1996 },
  casamento: new Date(2027, 9, 17), // 17/10/2027 (mês começa em 0)
  noivo: 'Gabriel',                 // nome do noivo na cena final (deixe vazio para não mostrar)
  mensagemFinal: 'E essa é só a primeira fase da nossa história.',
};

// O vilão: sátira da antiga loja. Cores e nomes num lugar só, para trocar fácil.
export const VILAO = {
  nome: 'XôMaq',
  slogan: 'Bata a meta!',
  corPrincipal: 0xd62828,
  corSecundaria: 0x1d3557,
  corDetalhe: 0xffd60a,
  css: { principal: '#d62828', secundaria: '#1d3557', detalhe: '#ffd60a' },
};

// Ajustes de jogabilidade. Mude aqui para deixar o jogo mais fácil ou mais difícil.
// MODO TESTE: com true, todas as fases já começam liberadas no mapa.
// Antes de entregar para a Bia, troque para false (aí cada fase libera ao terminar a anterior).
export const TODAS_LIBERADAS = true;

// Pontos (vão para o placar online). Abrir caixas em sequência rápida faz combo (x2, x3... até x5).
export const PONTOS = {
  flor: 10,
  caixa: { comum: 100, mola: 50, checkpoint: 50, explosiva: 150, vida: 250, tesouro: 500 },
  inimigo: 200,
  chefe: 3000,
  alianca: 1000,
  pudim: 100,
  todasCaixas: 2500,      // bônus por abrir todos os presentes da fase
  tempoBase: 3000,        // bônus de tempo: 3000 menos 10 por segundo
};

// Níveis de dificuldade (escolhidos no menu).
export const DIFICULDADES = {
  bebe: {
    id: 0, nome: 'Bebezinho', icone: '👶', descricao: 'Não perde vida: cair ou encostar em bichinho só faz voltar um pouco.',
    vidas: Infinity, semPerder: true, pudins: 2, velInimigo: 0.6, chefeVidas: 2, desaba: 1.2, pontos: 0.5,
    moveis: { vel: 0.45, tam: 1.6 }, // plataformas do vazio: bem mais lentas e maiores
  },
  normal: {
    id: 1, nome: 'Normal', icone: '⭐', descricao: 'Do jeito que o jogo foi pensado.',
    vidas: 10, semPerder: false, pudins: 0, velInimigo: 1, chefeVidas: 3, desaba: 0.5, pontos: 1,
  },
  dificil: {
    id: 2, nome: 'Difícil', icone: '🔥', descricao: '3 vidas, bichinhos rápidos, chefões com 5 golpes e pontos x1,5.',
    vidas: 3, semPerder: false, pudins: 0, velInimigo: 1.4, chefeVidas: 5, desaba: 0.3, pontos: 1.5,
  },
};

export const AJUSTES = {
  vidasIniciais: 10,
  velocidade: 7.5,        // metros por segundo correndo
  aceleracao: 95,         // quão rápido ela chega na velocidade máxima
  frenagem: 170,          // quão rápido ela para ao soltar a tecla (maior = para na hora)
  atritoNoAr: 0.6,        // 1 = controla no ar igual ao chão
  forcaPulo: 11.5,
  gravidade: 32,
  pulinhoCaixa: 10,       // impulso ao pisar numa caixa
  pulinhoMola: 17,
  duracaoGiro: 0.45,
  recargaGiro: 0.25,
  floresPorVida: 100,
  maxPudins: 3,           // 1 e 2 pudins seguram golpes; com 3 vira o Pudim Supremo
  supremoSegundos: 15,    // quanto tempo dura o Pudim Supremo (invencível e mais rápida)
  supremoVelocidade: 1.4, // velocidade a mais durante o Pudim Supremo
};
