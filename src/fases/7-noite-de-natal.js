// Mundo NATAL — Fase 7: Noite de Natal (a época favorita da Bia)
// Novidades: lago congelado (escorrega!), ponte de gelo e degraus de neve que desabam.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 7, nome: 'Noite de Natal', tema: 'natal',
  descricao: 'Neve, pisca-pisca e gnomos travessos. Cuidado que o gelo escorrega!' });

f.reto(22)
  .placa(-3.4, 3, ['Feliz Natal, Bia!', 'Sua época favorita'], '🎄')
  .linha(0, 6, 0, 14, 4)
  .caixa('comum', -2.5, 8).caixa('comum', 2.5, 8).pilha('comum', 0, 12, 3)
  .inimigo('gnomo', 3, -3, 17, 3)
  .pudim(2.5, 20)
  .caixa('tesouro', -3.5, 11);
f.gelo(24);
f.d.placas.push({ pos: [3.4, 0, f.ini - 3], texto: ['Lago congelado:', 'freia antes!'], icone: '⛸️' });
f.d.inimigos.push({ tipo: 'gnomo', de: [-3, 0, f.ini - 12], ate: [3, 0, f.ini - 12], vel: 2.5 });
f.d.frutas.push(...[4, 8, 12, 16, 20].map((dz, i) => [i % 2 ? 2.5 : -2.5, 1, f.ini - dz]));
f.d.caixas.push({ tipo: 'comum', pos: [0, 0.5, f.ini - 18] });
f.buraco(4);
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Cartinha do Papai Noel:', '“quero um vestido novo”'], '✉️')
  .caixa('mola', -3, 8).caixaNoAr('comum', -3, 8, 5).caixaNoAr('comum', -3, 10, 5)
  .inimigo('gnomo', -3, 3, 12, 3)
  .caixa('explosiva', 0, 15).caixa('comum', -3, 15).caixa('comum', 3, 15);
f.ponte(16, { largura: 2.4 });
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .goiabeira(0, 17, 3, 2.4, 5.5)
  .caixa('comum', -3, 8).caixa('comum', 3, 11).caixa('comum', -3, 14)
  .linha(3, 6, 3, 15, 4);
f.desabam(4, { zigue: 1.8 });
f.reto(30)
  .caixa('checkpoint', 0, 3)
  .placa(3.4, 4, ['Ceia da família:', 'chega pra comer!'], '🍗')
  .caixa('mola', 3, 8).caixaNoAr('comum', 3, 8, 5).alianca(3, 8, 6.3)
  .muroMola(12)
  .inimigo('gnomo', -3, 3, 20, 3.5)
  .pilha('comum', -2.5, 24, 2).pilha('comum', 2.5, 24, 2)
  .caixa('vida', 3.5, 4)
  .fim(27);

export default f.pronto();
