// Mundo IGREJA — Fase 2: Ensaio do Coral
import { Fase } from './construtor.js';

const f = new Fase({ numero: 2, nome: 'Ensaio do Coral', tema: 'igreja',
  descricao: 'Hoje tem ensaio! Suba nos tubos do órgão e não perca o tom.' });

f.reto(26)
  .placa(-3.4, 3, ['Ensaio do', 'Coral'])
  .linha(0, 3, 0, 12, 4)
  .caixa('comum', -2, 7).caixa('comum', 2, 7)
  .caixa('mola', 0, 14).caixaNoAr('comum', 0, 14, 5)
  .goiaba(2.5, 19, { pulo: 1.6 }).goiaba(-2.5, 22, { pulo: 1.6 })
  .pudim(0, 24);
f.buraco(3.5);
f.reto(18)
  .caixa('checkpoint', 0, 3)
  .inimigo('maquininha', -3, 3, 9, 3)
  .pilha('comum', -3, 13, 3).pilha('comum', 3, 13, 3)
  .zigue(5, 17, 6);
f.moveis(3, { eixo: 'y', amp: 2, vel: 0.45, alternar: false });
f.subir(1.5).reto(22)
  .caixa('checkpoint', 0, 3)
  .goiaba(-1.5, 8).goiaba(1.5, 11).goiaba(0, 14, { pulo: 2 })
  .caixa('explosiva', -3, 17).caixa('comum', 3, 17)
  .inimigo('maquininha', 3, -3, 19, 3)
  .linha(-3, 6, -3, 15, 4);
f.pedras([[0, 0.8], [-2.5, 1.6], [0, 2.4], [2.5, 1.6]], { tam: 2.6 });
f.subir(2.1).reto(30)
  .caixa('checkpoint', 0, 3)
  .caixa('mola', -3, 7).alianca(-3, 7, 5.6)
  .muroMola(12)
  .goiaba(0, 20, { pulo: 1.4 })
  .pilha('comum', -2.5, 22, 2).pilha('comum', 2.5, 22, 2)
  .linha(0, 17, 0, 26, 4)
  .fim(27);

export default f.pronto();
