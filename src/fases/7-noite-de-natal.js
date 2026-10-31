// Mundo NATAL — Fase 7: Noite de Natal (a época favorita da Bia)
import { Fase } from './construtor.js';

const f = new Fase({ numero: 7, nome: 'Noite de Natal', tema: 'natal',
  descricao: 'Neve, pisca-pisca, bonecos de neve e muitos presentes. Siga até a árvore gigante!' });

f.reto(26)
  .placa(-3.4, 3, ['Feliz', 'Natal!'])
  .linha(0, 6, 0, 14, 4)
  .caixa('comum', -2.5, 8).caixa('comum', 2.5, 8).pilha('comum', 0, 12, 3)
  .goiaba(-2, 17, { pulo: 1.3 })
  .inimigo('gnomo', 3, -3, 21, 3)
  .pudim(2.5, 24)
  .caixa('tesouro', -3.5, 11); // caixa dourada: +15 flores
f.buraco(4);
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .caixa('mola', -3, 7).caixaNoAr('comum', -3, 7, 5).caixaNoAr('comum', -3, 9, 5)
  .inimigo('gnomo', -3, 3, 12, 3)
  .caixa('explosiva', 0, 16).caixa('comum', -3, 16).caixa('comum', 3, 16)
  .zigue(4, 18, 7);
f.moveis(3, { eixo: 'x', amp: 5, vel: 0.35 });
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .goiabeira(0, 21, 3, 2.4, 5.5)
  .caixa('comum', -3, 8).caixa('comum', 3, 11).caixa('comum', -3, 14).caixa('comum', 3, 17)
  .linha(-3, 6, -3, 18, 4).linha(3, 6, 3, 18, 4);
f.pedras([[-2, 0.7], [2, 1.4], [0, 2.1], [-2, 1.4]]);
f.subir(2).reto(32)
  .caixa('checkpoint', 0, 3)
  .caixa('mola', 3, 7).caixaNoAr('comum', 3, 7, 5).alianca(3, 7, 6.3)
  .muroMola(11)
  .inimigo('gnomo', -3, 3, 19, 3.5)
  .pilha('comum', -2.5, 23, 2).pilha('comum', 2.5, 23, 2)
  .linha(0, 17, 0, 27, 4)
  .caixa('vida', 3.5, 4) // caixa do coração: +1 vida
  .fim(29);

export default f.pronto();
