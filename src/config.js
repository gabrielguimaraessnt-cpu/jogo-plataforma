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

export const AJUSTES = {
  vidasIniciais: 10,
  velocidade: 7.5,        // metros por segundo correndo
  aceleracao: 60,
  atritoNoAr: 0.35,       // 1 = controla no ar igual ao chão
  forcaPulo: 11.5,
  gravidade: 32,
  pulinhoCaixa: 10,       // impulso ao pisar numa caixa
  pulinhoMola: 17,
  duracaoGiro: 0.45,
  recargaGiro: 0.25,
  floresPorVida: 100,
  maxPudins: 2,           // quantos golpes o pudim protetor aguenta
};
