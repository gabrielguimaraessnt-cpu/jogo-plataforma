// Lista das fases, na ordem, agrupadas por mundo (igual ao mapa do jogo).
import f1 from './1-quintal-da-familia.js';
import f2 from './2-ensaio-da-banda.js';
import f3 from './3-atelie-de-costura.js';
import f4 from './4-rodizio-de-sushi.js';
import f5 from './5-aulao-de-fit-dance.js';
import f6 from './6-loja-xomaq.js';
import f7 from './7-noite-de-natal.js';
import f8 from './8-o-grande-dia.js';
import f9 from './9-ferias-na-praia.js';

export const MUNDOS = [
  { nome: 'Família', icone: '🏡', fases: [f1] },
  { nome: 'Igreja', icone: '⛪', fases: [f2] },
  { nome: 'Hobbies', icone: '🎨', fases: [f3, f4, f5] },
  { nome: 'XôMaq', icone: '🧵', fases: [f6] },
  { nome: 'Natal', icone: '🎄', fases: [f7] },
  { nome: 'Casamento', icone: '💍', fases: [f8] },
  { nome: 'Férias (bônus)', icone: '🏖️', fases: [f9] },
];

export const FASES = MUNDOS.flatMap((m) => m.fases.map((f) => ({ ...f, mundo: m.nome })));
