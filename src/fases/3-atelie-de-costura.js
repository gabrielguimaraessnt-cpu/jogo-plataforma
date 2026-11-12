// Mundo HOBBIES — Fase 3: Ateliê de Costura (desenho e costura)
// Novidades: botões gigantes que desabam, ponte de fita métrica e escada de carretéis descendo.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 3, nome: 'Ateliê de Costura', tema: 'atelie',
  descricao: 'Lápis, alfinetes e carretéis gigantes. Cuidado com o chão que desaba!' });

f.reto(26)
  .placa(-3.4, 3, ['Ateliê da Bia', 'Agulha, linha e paciência'], '🧵')
  .linha(0, 3, 0, 9, 3)
  .inimigo('carretel', -3, 3, 10, 3)
  .caixa('comum', -2.5, 13).caixa('comum', 2.5, 13)
  .inimigoFrente('carretel', 2.5, 16, 24, 4)
  .pudim(-2.5, 21)
  .caixa('tesouro', -3.5, 11);
f.desabam(4);
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .placa(3.4, 4, ['Esse chão é de botão:', 'não fica parada!'], '🔘')
  .pilha('comum', 0, 8, 2)
  .inimigo('maquininha', -3, 3, 12, 3)
  .caixa('explosiva', 2.5, 15).caixa('comum', -2.5, 15)
  .gabi(-3.5, 7);
f.ponte(18, { largura: 2.2 });
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Desenho do dia:', 'um vestido de noiva?'], '✏️')
  .goiabeira(0, 19, 3, 2.2, 6)
  .caixa('comum', -3, 8).caixa('comum', 3, 11).caixa('comum', -3, 14)
  .linha(3, 6, 3, 17, 4);
f.subir(2);
f.escada(3, { degrau: -0.8 });
f.reto(28)
  .inimigo('carretel', 3, -3, 5, 4)
  .caixa('mola', -3, 9).caixaNoAr('comum', -3, 9, 5).alianca(-3, 9, 6.3)
  .muroMola(13)
  .inimigoFrente('carretel', 0, 19, 25, 3.5)
  .caixa('comum', -3, 21).caixa('comum', 3, 21)
  .caixa('vida', 3.5, 4)
  .fim(25);

export default f.pronto();
