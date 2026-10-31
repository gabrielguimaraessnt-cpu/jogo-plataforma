// Mundo XÔMAQ — Fase 6: A Loja (o antigo emprego) + chefão Gerente
// Novidades: esteira de estoque contra, piso que desaba e esteira lateral antes da sala do Gerente.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 6, nome: 'A Loja XôMaq', tema: 'loja',
  descricao: 'O antigo emprego. Metas, hora extra e o temido Gerente no fim do corredor.' });

f.reto(22)
  .placa(-3.4, 3, ['Bem-vinda à XôMaq', 'Bater ponto: 7h59'], '⏰')
  .inimigo('maquininha', -3, 3, 8, 3).inimigo('maquininha', 3, -3, 13, 3.5)
  .caixa('ferro', -2, 16).caixa('comum', 0, 16).caixa('ferro', 2, 16)
  .linha(-3, 4, -3, 20, 5)
  .caixa('tesouro', -3.5, 11);
f.esteira(24, { vel: 3.5 })
  .placa(3.4, 2, ['Esteira do estoque:', 'sempre contra você'], '📦')
  .inimigoFrente('carretel', 0, 8, 20, 4)
  .caixa('comum', -3, 10).caixa('comum', 3, 16)
  .pudim(-3, 20);
f.desabam(4, { zigue: 2 });
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Meta do mês:', 'vender 300 máquinas'], '📈')
  .caixa('explosiva', -2, 10).caixa('explosiva', 0, 10).caixa('explosiva', 2, 10)
  .inimigo('maquininha', -3, 3, 14, 4)
  .zigue(4, 18, 7);
f.moveis(3, { eixo: 'x', amp: 6, vel: 0.45 });
f.esteira(18, { vel: -2.5, lateral: true })
  .goiabeira(0, 17, 3, 1.8, 7)
  .caixa('mola', 3, 12).caixaNoAr('comum', 3, 12, 5).alianca(3, 12, 6.3);
f.reto(16)
  .caixa('checkpoint', 0, 3)
  .pudim(0, 7)
  .placa(-3.4, 10, ['Sala do GERENTE', 'Bata antes de entrar'], '🚪')
  .caixa('vida', 3.5, 4)
  .linha(0, 9, 0, 14, 3);
f.chefe('gerente');

export default f.pronto();
