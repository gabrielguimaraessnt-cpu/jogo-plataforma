// Mundo HOBBIES — Fase 4: Rodízio (sushi, estrogonofe e pudim)
import { Fase } from './construtor.js';

const f = new Fase({ numero: 4, nome: 'Rodízio de Sushi', tema: 'rodizio',
  descricao: 'Sushi, estrogonofe e pudim! Atravesse a esteira de pratos sem cair.' });

f.reto(24)
  .placa(-3.4, 3, ['Rodízio', 'liberado!'])
  .zigue(3, 20, 8)
  .caixa('comum', -2, 8).caixa('comum', 2, 8).pilha('comum', 0, 12, 2)
  .inimigo('maquininha', -3, 3, 16, 3)
  .pudim(2.5, 21)
  .caixa('tesouro', -3.5, 11); // caixa dourada: +15 flores
f.moveis(4, { eixo: 'x', amp: 6, vel: 0.3 });
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .goiabeira(-2.5, 21, 3, 2.4, 6).goiabeira(2.5, 21, 3, 2.4, 6)
  .caixa('comum', 0, 9).caixa('comum', 0, 14)
  .linha(0, 6, 0, 18, 5);
f.buraco(4);
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .inimigo('maquininha', -3, 3, 8, 3).inimigo('maquininha', 3, -3, 14, 3.5)
  .caixa('explosiva', -1, 11).caixa('explosiva', 1, 11)
  .pilha('comum', -3, 17, 3).pilha('comum', 3, 17, 3)
  .linha(-3, 5, -3, 15, 4);
f.pedras([[-2.5, 0.5], [2.5, 1], [-2.5, 1.5], [2.5, 2]], { vao: 2.6 });
f.subir(2).reto(30)
  .caixa('checkpoint', 0, 3)
  .caixa('mola', 3, 7).caixaNoAr('comum', 3, 7, 5).alianca(3, 7, 6.3)
  .goiaba(-2, 10, { pulo: 1.5 })
  .muroMola(13)
  .inimigoFrente('maquininha', 0, 19, 26, 3)
  .linha(-3, 18, -3, 26, 4).linha(3, 18, 3, 26, 4)
  .caixa('vida', 3.5, 4) // caixa do coração: +1 vida
  .fim(27);

export default f.pronto();
