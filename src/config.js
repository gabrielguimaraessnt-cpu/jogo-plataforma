// Conexão com o Supabase do jogo (projeto "jogo-plataforma").
// A chave abaixo é a chave PÚBLICA (publishable): pode ficar no código do navegador.
// A tabela só aceita leitura; gravar recordes passa pela função registrar_recorde.
export const SUPABASE_URL = 'https://czaomtjzomclqnkkfgkz.supabase.co';
export const SUPABASE_CHAVE = 'sb_publishable_TX4cQaPAQQlZcYtXCBl9Lw_oHj2DlVY';

// Ajustes de jogabilidade. Mude aqui para deixar o jogo mais fácil ou mais difícil.
export const AJUSTES = {
  vidasIniciais: 4,
  velocidade: 7.5,        // metros por segundo correndo
  aceleracao: 60,
  atritoNoAr: 0.35,       // 1 = controla no ar igual ao chão
  forcaPulo: 11.5,
  gravidade: 32,
  pulinhoCaixa: 10,       // impulso ao pisar numa caixa
  pulinhoMola: 17,
  duracaoGiro: 0.45,
  recargaGiro: 0.25,
  frutasPorVida: 100,
};
