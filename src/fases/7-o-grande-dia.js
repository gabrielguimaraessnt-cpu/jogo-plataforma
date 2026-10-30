// Mundo CASAMENTO — Fase 7: O Grande Dia (17/10/2027)
import { Fase } from './construtor.js';

const f = new Fase({ numero: 7, nome: 'O Grande Dia', tema: 'casamento',
  descricao: '17/10/2027. Todo mundo esperando. Siga o tapete até o altar!' });

f.reto(26)
  .placa(-3.4, 3, ['17/10/2027', 'O Grande Dia'])
  .linha(-2, 3, -2, 22, 7).linha(2, 3, 2, 22, 7)
  .caixa('comum', 0, 8).caixa('comum', -3, 12).caixa('comum', 3, 12).pilha('comum', 0, 17, 3)
  .pudim(0, 23);
f.buraco(4);
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 6, ['Buffet', 'sem goiaba!'])
  .goiaba(-1.5, 10, { pulo: 1.4 }).goiaba(1.5, 13, { pulo: 1.4 })
  .caixa('comum', -3, 16).caixa('comum', 3, 16)
  .zigue(4, 18, 7);
f.pedras([[0, 1], [-2.5, 2], [2.5, 3], [0, 4]]);
f.subir(4.2).reto(34)
  .caixa('checkpoint', 0, 3)
  .caixa('mola', -3, 7).caixaNoAr('comum', -3, 7, 5).alianca(-3, 7, 6.3)
  .linha(0, 6, 0, 26, 9)
  .fim(31);

const dados = f.pronto();
dados.final = true; // ao chegar no altar, mostra a cena do casamento
export default dados;
