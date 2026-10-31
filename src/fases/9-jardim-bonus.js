// Fase BÔNUS — Jardim das Flores: sem bichinhos e sem perder vida. Só para juntar flores e abrir caixas.
// Se cair, a Bia volta para o último pinheirinho sem perder nada.
import { Fase } from './construtor.js';

const f = new Fase({ numero: 9, nome: 'Jardim das Flores', tema: 'jardim',
  descricao: 'Fase bônus: sem bichinhos e sem perder vida. Junte todas as flores e abra todos os presentes!' });

f.reto(30)
  .placa(-3.4, 3, ['Fase', 'bônus!'])
  .zigue(3, 28, 12)
  .caixa('comum', -2.5, 6).caixa('comum', 2.5, 6).pilha('comum', 0, 10, 3)
  .caixa('tesouro', -3, 14).caixa('vida', 3, 14)
  .caixa('mola', 0, 19).caixaNoAr('tesouro', 0, 19, 5)
  .pilha('comum', -3, 24, 2).pilha('comum', 3, 24, 2).caixa('comum', 0, 27);
f.buraco(4);
f.reto(24)
  .caixa('checkpoint', 0, 3)
  .linha(-3, 5, -3, 21, 6).linha(3, 5, 3, 21, 6).linha(0, 5, 0, 21, 6)
  .pilha('comum', -1.5, 9, 2).pilha('comum', 1.5, 9, 2)
  .caixa('mola', -3, 14).caixaNoAr('comum', -3, 14, 5).caixaNoAr('comum', -3, 16, 5)
  .caixa('mola', 3, 14).caixaNoAr('vida', 3, 14, 5)
  .caixa('tesouro', 0, 19);
f.moveis(3, { eixo: 'x', amp: 5, vel: 0.3 });
f.reto(22)
  .caixa('checkpoint', 0, 3)
  .zigue(5, 20, 10, 3)
  .pilha('comum', -3, 8, 3).pilha('comum', 3, 8, 3).pilha('comum', 0, 12, 4)
  .caixa('tesouro', -2, 17).caixa('tesouro', 2, 17);
f.pedras([[0, 0.8], [-2.5, 1.6], [2.5, 2.4], [0, 3.2]]);
f.subir(3.4).reto(32)
  .caixa('checkpoint', 0, 3)
  .linha(-3, 5, -3, 28, 8).linha(3, 5, 3, 28, 8)
  .caixa('mola', 0, 7).caixaNoAr('tesouro', 0, 7, 5).caixaNoAr('comum', 0, 9, 5)
  .pilha('comum', -2, 13, 2).pilha('comum', 2, 13, 2)
  .caixa('vida', 0, 17).caixa('tesouro', -3, 21).caixa('tesouro', 3, 21)
  .pilha('comum', -1, 24, 3).pilha('comum', 1, 24, 3)
  .fim(29);

const dados = f.pronto();
dados.bonus = true; // sem perder vida
export default dados;
