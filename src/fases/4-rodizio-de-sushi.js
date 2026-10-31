// Mundo HOBBIES — Fase 4: Rodízio (sushi, estrogonofe e pudim)
// Novidades: esteira de sushi que puxa para trás e esteira que empurra para o lado.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 4, nome: 'Rodízio de Sushi', tema: 'rodizio',
  descricao: 'Sushi, estrogonofe e pudim! Corra contra a esteira e não caia dos pratos.' });

f.reto(20)
  .placa(-3.4, 3, ['Rodízio liberado!', 'Hoje a dieta tirou folga'], '🍣')
  .zigue(3, 17, 6)
  .caixa('comum', -2, 8).caixa('comum', 2, 8)
  .pudim(2.5, 16)
  .caixa('tesouro', -3.5, 11);
f.esteira(22, { vel: 3 })
  .placa(3.4, 2, ['Esteira do sushi:', 'corre que ela te puxa!'], '🥢')
  .caixa('comum', -3, 8).caixa('comum', 3, 12).caixa('comum', -3, 16)
  .linha(0, 4, 0, 20, 6);
f.moveis(3, { eixo: 'x', amp: 6, vel: 0.3 });
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Estrogonofe da casa:', 'com batata palha extra'], '🍲')
  .goiabeira(-2.5, 19, 3, 2.4, 6).goiabeira(2.5, 19, 3, 2.4, 6)
  .caixa('comum', 0, 9).caixa('comum', 0, 14);
f.esteira(18, { vel: 2.5, lateral: true })
  .inimigo('maquininha', -3, 3, 9, 3)
  .pilha('comum', -3, 14, 2).pilha('comum', 3, 14, 2)
  .linha(-3, 4, 3, 16, 5);
f.pedras([[-2.5, 0.5], [2.5, 1], [-2.5, 1.5], [2.5, 2]], { vao: 2.6 });
f.subir(2).reto(28)
  .caixa('checkpoint', 0, 3)
  .placa(3.4, 4, ['Último prato:', 'pudim, claro'], '🍮')
  .caixa('mola', 3, 8).caixaNoAr('comum', 3, 8, 5).alianca(3, 8, 6.3)
  .goiaba(-2, 11, { pulo: 1.5 })
  .muroMola(14)
  .inimigoFrente('maquininha', 0, 20, 25, 3)
  .caixa('vida', 3.5, 4)
  .fim(25);

export default f.pronto();
