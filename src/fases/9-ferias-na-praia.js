// Fase BÔNUS — Férias na Praia: sem bichinhos e sem perder vida. Só para juntar flores e abrir caixas.
// Se cair no mar, a Bia volta para o último pinheirinho sem perder nada.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 9, nome: 'Férias na Praia', tema: 'ferias',
  descricao: 'Fase bônus: férias! Sem bichinhos e sem perder vida. Junte as flores e abra todos os presentes.' });

f.reto(28)
  .placa(-3.4, 3, ['Férias!', 'Protetor solar: ok'], '🏖️')
  .zigue(3, 26, 10)
  .caixa('comum', -2.5, 6).caixa('comum', 2.5, 6).pilha('comum', 0, 10, 3)
  .caixa('tesouro', -3, 14).caixa('vida', 3, 14)
  .pilha('comum', -3, 22, 2).pilha('comum', 3, 22, 2).caixa('comum', 0, 25);
f.ponte(14, { largura: 3 });
f.trampolins(5, { zigue: 2.5 });
f.reto(20)
  .caixa('checkpoint', 0, 3)
  .placa(3.4, 4, ['Água de coco', 'grátis até as 17h'], '🥥')
  .linha(-3, 5, -3, 17, 5).linha(3, 5, 3, 17, 5)
  .pilha('comum', -1.5, 8, 2).pilha('comum', 1.5, 8, 2)
  .caixa('tesouro', 0, 14);
f.moveis(3, { eixo: 'x', amp: 5, vel: 0.3 });
f.zigueBlocos(5, { amp: 2.6, subida: 0.4 });
f.reto(32)
  .caixa('checkpoint', 0, 3)
  .placa(-3.4, 5, ['Pôr do sol', 'mais lindo do Brasil'], '🌅')
  .linha(-3, 5, -3, 28, 8).linha(3, 5, 3, 28, 8)
  .caixa('mola', 0, 7).caixaNoAr('tesouro', 0, 7, 5).caixaNoAr('comum', 0, 9, 5)
  .pilha('comum', -2, 13, 2).pilha('comum', 2, 13, 2)
  .caixa('vida', 0, 17).caixa('tesouro', -3, 21).caixa('tesouro', 3, 21)
  .pilha('comum', -1, 24, 3).pilha('comum', 1, 24, 3)
  .fim(29);

const dados = f.pronto();
dados.bonus = true; // sem perder vida
export default dados;
