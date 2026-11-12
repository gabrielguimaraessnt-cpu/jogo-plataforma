// Mundo FAMÍLIA — Fase 1: Quintal da Família (fase de aprender)
// Novidades: ponte de madeira sobre o riacho e escada de tocos.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 1, nome: 'Quintal da Família', tema: 'familia',
  descricao: 'A família toda reunida! Corra, pule e gire até o arco de flores.' });

f.reto(28)
  .placa(-3.4, 4, ['Bem-vinda, Bia!', 'A família toda veio torcer'], '❤️')
  .linha(0, 6, 0, 15, 4)
  .caixa('comum', -2, 8).caixa('comum', 2, 11).pilha('comum', 0, 17, 2)
  .placa(3.4, 14, ['Pula em cima', 'ou gira pra abrir!'], '🎁')
  .inimigo('maquininha', -3, 3, 22, 2)
  .pudim(2.5, 25)
  .caixa('tesouro', -3.5, 11)
  .gabi(3.5, 19);
f.buraco(4);
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 6, ['Cuidado: goiaba!', 'Alergia é coisa séria'], '🍈')
  .goiaba(-1.5, 11)
  .pilha('comum', 2.5, 9, 3)
  .zigue(4, 18, 6);
f.ponte(14, { largura: 2.6 });
f.reto(16)
  .placa(3.4, 3, ['Ponte do riacho:', 'olho no passo!'], '🌉')
  .caixa('comum', -2.5, 7).caixa('ferro', -1.5, 7).caixa('comum', -0.5, 7)
  .caixa('mola', 3, 11).caixaNoAr('comum', 3, 11, 5).alianca(3, 11, 6.3)
  .inimigo('maquininha', 3, -3, 14, 2.5);
f.escada(4, { degrau: 0.7 });
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Vó avisa:', 'tem pudim no fim!'], '🍮')
  .caixa('explosiva', 0, 10).caixa('comum', -3, 11).caixa('comum', 3, 11)
  .linha(0, 4, 0, 16, 5);
f.moveis(3, { eixo: 'x', amp: 5, vel: 0.35 });
f.zigueBlocos(4, { amp: 2.4 });
f.reto(26)
  .caixa('checkpoint', 0, 3)
  .muroMola(7)
  .pilha('comum', -2, 15, 2).pilha('comum', 2, 15, 2)
  .inimigo('maquininha', -3, 3, 18, 3)
  .linha(-3, 14, -3, 23, 4).linha(3, 14, 3, 23, 4)
  .caixa('vida', 3.5, 4)
  .fim(23);

const dados = f.pronto();
dados.noivoTorcendo = [5.2, 0.6, -1]; // o noivo torcendo logo no começo
export default dados;
