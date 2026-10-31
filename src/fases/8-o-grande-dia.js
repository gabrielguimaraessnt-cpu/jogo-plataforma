// Mundo CASAMENTO — Fase 8: O Grande Dia (17/10/2027)
// Novidades: escada de nuvens e caminho de nuvens em zigue-zague até o altar.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 8, nome: 'O Grande Dia', tema: 'casamento',
  descricao: '17/10/2027. Todo mundo esperando. Siga o tapete até o altar!' });

f.reto(24)
  .placa(-3.4, 3, ['17/10/2027', 'O Grande Dia chegou'], '💍')
  .linha(-2, 3, -2, 20, 6).linha(2, 3, 2, 20, 6)
  .caixa('comum', 0, 8).caixa('comum', -3, 12).caixa('comum', 3, 12).pilha('comum', 0, 16, 3)
  .pudim(0, 21)
  .caixa('tesouro', -3.5, 11);
f.buraco(4);
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 6, ['Buffet sem goiaba!', 'Juramos'], '🍰')
  .goiaba(-1.5, 10, { pulo: 1.4 }).goiaba(1.5, 13, { pulo: 1.4 })
  .caixa('comum', -3, 15).caixa('comum', 3, 15);
f.escada(4, { degrau: 0.8, tam: 2.8 });
f.zigueBlocos(4, { amp: 2.2, subida: 0.3 });
f.reto(34)
  .caixa('checkpoint', 0, 3)
  .placa(3.4, 5, ['O noivo te espera', 'no altar ❤'], '🤵')
  .caixa('mola', -3, 7).caixaNoAr('comum', -3, 7, 5).alianca(-3, 7, 6.3)
  .linha(0, 6, 0, 26, 9)
  .caixa('vida', 3.5, 4)
  .fim(31);

const dados = f.pronto();
dados.final = true; // ao chegar no altar, mostra a cena do casamento
export default dados;
