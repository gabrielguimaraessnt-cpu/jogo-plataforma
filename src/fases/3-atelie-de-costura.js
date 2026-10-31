// Mundo HOBBIES — Fase 3: Ateliê de Costura (desenho e costura)
import { Fase } from './construtor.js';

const f = new Fase({ numero: 3, nome: 'Ateliê de Costura', tema: 'atelie',
  descricao: 'Lápis, alfinetes e carretéis gigantes. Cuidado com os carretéis que rolam!' });

f.reto(28)
  .placa(-3.4, 3, ['Ateliê', 'da Bia'])
  .linha(0, 3, 0, 9, 3)
  .inimigo('carretel', -3, 3, 10, 3)
  .caixa('comum', -2.5, 13).caixa('comum', 2.5, 13)
  .inimigoFrente('carretel', 2.5, 16, 26, 4)
  .linha(-2.5, 16, -2.5, 26, 4)
  .pudim(-2.5, 21)
  .caixa('tesouro', -3.5, 11); // caixa dourada: +15 flores
f.buraco(4);
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .pilha('comum', 0, 8, 2)
  .inimigo('maquininha', -3, 3, 12, 3)
  .caixa('explosiva', 2.5, 15).caixa('comum', -2.5, 15)
  .zigue(4, 18, 6);
f.moveis(4, { eixo: 'z', amp: 3, vel: 0.35, alternar: false });
f.reto(24)
  .caixa('checkpoint', 0, 3)
  .goiabeira(0, 23, 3, 2.2, 6)
  .caixa('comum', -3, 8).caixa('comum', 3, 10).caixa('comum', -3, 14).caixa('comum', 3, 16)
  .linha(-3, 6, -3, 20, 5).linha(3, 6, 3, 20, 5);
f.subir(1.5).reto(30)
  .inimigo('carretel', 3, -3, 5, 4)
  .caixa('mola', -3, 9).caixaNoAr('comum', -3, 9, 5).alianca(-3, 9, 6.3)
  .muroMola(13)
  .inimigoFrente('carretel', 0, 20, 27, 3.5)
  .caixa('comum', -3, 22).caixa('comum', 3, 22)
  .caixa('vida', 3.5, 4) // caixa do coração: +1 vida
  .fim(27);

export default f.pronto();
