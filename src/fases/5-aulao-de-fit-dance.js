// Mundo HOBBIES — Fase 5: Aulão de Fit Dance (as plataformas dançam no ritmo)
import { Fase } from './construtor.js';

const BATIDA = 128 / 60 / 4; // um vai-e-volta a cada 4 batidas da música (128 bpm)

const f = new Fase({ numero: 5, nome: 'Aulão de Fit Dance', tema: 'fitdance',
  descricao: 'Música eletrônica, caixas de som e plataformas que dançam no ritmo!' });

f.reto(26)
  .placa(-3.4, 3, ['Aulão de', 'Fit Dance'])
  .caixa('mola', -2.5, 8).caixaNoAr('comum', -2.5, 8, 5)
  .caixa('mola', 2.5, 14).caixaNoAr('comum', 2.5, 14, 5)
  .linha(0, 4, 0, 18, 5)
  .inimigo('maquininha', -3, 3, 20, 3.5)
  .pudim(0, 23);
f.moveis(4, { eixo: 'y', amp: 2.2, vel: BATIDA, alternar: false });
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .goiaba(-2, 8, { pulo: 2 }).goiaba(2, 11, { pulo: 2 }).goiaba(0, 14, { pulo: 2 })
  .caixa('comum', -3, 16).caixa('comum', 3, 16)
  .zigue(5, 18, 6);
f.moveis(3, { eixo: 'x', amp: 6, vel: BATIDA });
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .inimigo('carretel', -3, 3, 8, 4).inimigo('carretel', 3, -3, 12, 4)
  .caixa('explosiva', 0, 16).pilha('comum', -3, 16, 2).pilha('comum', 3, 16, 2)
  .linha(0, 6, 0, 14, 4);
f.pedras([[0, 0.8], [2.5, 1.6], [0, 2.4], [-2.5, 1.6]]);
f.subir(2.1).reto(30)
  .caixa('checkpoint', 0, 3)
  .caixa('mola', 3, 7).alianca(3, 7, 5.6)
  .muroMola(11)
  .inimigo('maquininha', -3, 3, 18, 4).inimigo('maquininha', 3, -3, 22, 4)
  .linha(-3, 17, -3, 26, 4).linha(3, 17, 3, 26, 4)
  .fim(27);

export default f.pronto();
