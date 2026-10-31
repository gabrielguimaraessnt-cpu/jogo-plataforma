// Mundo FAMÍLIA — Fase 1: Quintal da Família (fase de aprender)
import { Fase } from './construtor.js';

const f = new Fase({ numero: 1, nome: 'Quintal da Família', tema: 'familia',
  descricao: 'A família toda reunida! Corra, pule e gire até o arco de flores.' });

f.reto(30)
  .placa(-3.4, 4, ['Bem-vinda,', 'Bia!'])
  .linha(0, 6, 0, 15, 4)
  .caixa('comum', -2, 8).caixa('comum', 2, 11).pilha('comum', 0, 17, 2)
  .inimigo('maquininha', -3, 3, 22, 2)
  .pudim(2.5, 26)
  .caixa('tesouro', -3.5, 11); // caixa dourada: +15 flores
f.buraco(4);
f.reto(24)
  .caixa('checkpoint', 0, 3)
  .pilha('comum', 2.5, 7, 3)
  .placa(-3.4, 9, ['Cuidado:', 'goiaba!'])
  .goiaba(-1.5, 12)
  .caixa('comum', -2.5, 16).caixa('ferro', -1.5, 16).caixa('comum', -0.5, 16)
  .zigue(4, 22, 7)
  .caixa('mola', 3, 20).caixaNoAr('comum', 3, 20, 5).alianca(3, 20, 6.3);
f.subir(1.5).reto(22)
  .linha(0, 2, 0, 20, 6)
  .inimigo('maquininha', 3, -3, 7, 2.5)
  .caixa('explosiva', 0, 12).caixa('comum', -3, 13).caixa('comum', 3, 13)
  .inimigo('maquininha', -3, 3, 18, 3);
f.moveis(3, { eixo: 'x', amp: 5, vel: 0.35 });
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .goiabeira(0, 21, 3, 2.6, 5)
  .caixa('comum', -3, 8).caixa('comum', 3, 12).caixa('comum', -3, 16)
  .linha(-3, 6, -3, 18, 4).linha(3, 6, 3, 18, 4);
f.pedras([[-2, 0.6], [2, 1.2], [-1, 1.8], [1.5, 1.2]]);
f.subir(1.4).reto(28)
  .caixa('checkpoint', 0, 3)
  .muroMola(7)
  .pilha('comum', -2, 15, 2).pilha('comum', 2, 15, 2)
  .inimigo('maquininha', -3, 3, 19, 3)
  .linha(-3, 14, -3, 24, 4).linha(3, 14, 3, 24, 4)
  .caixa('vida', 3.5, 4) // caixa do coração: +1 vida
  .fim(25);

const dados = f.pronto();
dados.noivoTorcendo = [5.2, 0.6, -1]; // o noivo torcendo logo no começo
export default dados;
