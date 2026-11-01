// Mundo HOBBIES — Fase 5: Aulão de Fit Dance (as plataformas dançam no ritmo)
// Novidades: pista de caixas de som (trampolins), degraus de luz que desabam e o chefão DJ Caixa de Som.
import { Fase } from './construtor.js';

const BATIDA = 128 / 60 / 4; // um vai-e-volta a cada 4 batidas da música (128 bpm)

const f = new Fase({ numero: 5, nome: 'Aulão de Fit Dance', tema: 'fitdance',
  descricao: 'Música eletrônica, caixas de som e plataformas que dançam no ritmo!' });

f.reto(18)
  .placa(-3.4, 3, ['Aulão de Fit Dance', 'Bora, bora, bora!'], '💃')
  .linha(0, 4, 0, 14, 4)
  .inimigo('maquininha', -3, 3, 12, 3.5)
  .pudim(0, 16)
  .caixa('tesouro', -3.5, 11);
f.trampolins(5, { zigue: 2.5 });
f.moveis(4, { eixo: 'y', amp: 2.2, vel: BATIDA, alternar: false });
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .placa(3.4, 4, ['Coreografia:', 'pula, pula, gira!'], '🔊')
  .goiaba(-2, 8, { pulo: 2 }).goiaba(2, 11, { pulo: 2 })
  .caixa('comum', -3, 14).caixa('comum', 3, 14);
f.desabam(5, { zigue: 2 });
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .inimigo('carretel', -3, 3, 8, 4).inimigo('carretel', 3, -3, 12, 4)
  .caixa('explosiva', 0, 15).pilha('comum', -3, 15, 2).pilha('comum', 3, 15, 2);
f.moveis(3, { eixo: 'x', amp: 6, vel: BATIDA });
f.reto(28)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Última série!', 'Respira e vai'], '💪')
  .caixa('mola', 3, 7).alianca(3, 7, 5.6)
  .muroMola(11)
  .inimigo('maquininha', -3, 3, 18, 4).inimigo('maquininha', 3, -3, 22, 4)
  .linha(-3, 17, -3, 25, 4).linha(3, 17, 3, 25, 4)
  .caixa('vida', 3.5, 4);
f.chefe('dj');

export default f.pronto();
