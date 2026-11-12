// Mundo IGREJA — Fase 2: Ensaio da Banda (louvor)
// Novidades: palco que sobe e desce, campo de caixas de som (trampolins) e degraus do altar em zigue-zague.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 2, nome: 'Ensaio da Banda', tema: 'igreja',
  descricao: 'Hoje tem ensaio do louvor! Pule nas caixas de som e suba no palco.' });

f.reto(24)
  .placa(-3.4, 3, ['Ensaio às 19h30', 'Não se atrase!'], '🎤')
  .linha(0, 3, 0, 12, 4)
  .caixa('comum', -2, 7).caixa('comum', 2, 7)
  .goiaba(2.5, 17, { pulo: 1.4 })
  .pudim(-2.5, 20)
  .caixa('tesouro', -3.5, 11)
  .gabi(3.5, 10);
f.moveis(3, { eixo: 'y', amp: 2, vel: 0.45, alternar: false });
f.subir(1.5).reto(16)
  .caixa('checkpoint', 0, 3)
  .placa(3.4, 4, ['Som da bateria:', 'tum-tá, tum-tum-tá'], '🥁')
  .inimigo('maquininha', -3, 3, 9, 3)
  .pilha('comum', -3, 12, 3).pilha('comum', 3, 12, 3);
f.trampolins(4, { zigue: 2.2 });
f.reto(16)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Microfone ligado!', 'Solta a voz, Bia'], '🎶')
  .goiaba(-1.5, 9).goiaba(1.5, 12, { pulo: 2 })
  .caixa('explosiva', 0, 14);
f.zigueBlocos(5, { amp: 2.4, subida: 0.5 });
f.reto(28)
  .caixa('checkpoint', 0, 3)
  .caixa('mola', -3, 7).alianca(-3, 7, 5.6)
  .muroMola(12)
  .pilha('comum', -2.5, 20, 2).pilha('comum', 2.5, 20, 2)
  .linha(0, 17, 0, 25, 4)
  .caixa('vida', 3.5, 4)
  .fim(25);

export default f.pronto();
