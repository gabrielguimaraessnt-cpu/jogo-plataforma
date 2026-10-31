// Mundo XÔMAQ — Fase 6: A Loja (o antigo emprego) + chefão Gerente
import { Fase } from './construtor.js';

const f = new Fase({ numero: 6, nome: 'A Loja XôMaq', tema: 'loja',
  descricao: 'O antigo emprego. Metas, hora extra e o temido Gerente no fim do corredor.' });

f.reto(24)
  .placa(-3.4, 3, ['Bem-vinda à', 'XôMaq'])
  .inimigo('maquininha', -3, 3, 8, 3).inimigo('maquininha', 3, -3, 13, 3.5)
  .caixa('ferro', -2, 16).caixa('comum', 0, 16).caixa('ferro', 2, 16)
  .inimigoFrente('carretel', 0, 18, 23, 4)
  .linha(-3, 4, -3, 20, 5).linha(3, 4, 3, 20, 5);
f.buraco(4);
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .pudim(-3, 6)
  .caixa('tesouro', -3.5, 11) // caixa dourada: +15 flores
  .inimigo('maquininha', -3, 3, 9, 4)
  .caixa('explosiva', -2, 13).caixa('explosiva', 0, 13).caixa('explosiva', 2, 13)
  .inimigo('carretel', 3, -3, 17, 4.5)
  .zigue(4, 20, 7);
f.moveis(3, { eixo: 'x', amp: 6, vel: 0.45 });
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .goiabeira(0, 21, 3, 1.8, 7)
  .caixa('comum', -3, 9).caixa('comum', 3, 12).caixa('comum', -3, 15)
  .caixa('mola', 3, 17).caixaNoAr('comum', 3, 17, 5).alianca(3, 17, 6.3);
f.pedras([[-2, 0.7], [2, 1.4], [-2, 2.1], [2, 1.4]]);
f.subir(2.4).reto(16)
  .caixa('checkpoint', 0, 3)
  .pudim(0, 7)
  .placa(-3.4, 10, ['Sala do', 'GERENTE'])
  .caixa('vida', 3.5, 4) // caixa do coração: +1 vida
  .linha(0, 9, 0, 14, 3);
f.chefe('gerente');

export default f.pronto();
