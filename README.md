# As Aventuras da Bia 🌲

Jogo de plataforma 3D em corredor, feito de presente para a Bia (Beatriz Pinheiro). Roda no navegador,
no computador e no celular.

A Bia atravessa 6 mundos da vida dela. Ela abre presentes, junta flores, foge das goiabas (é alérgica!)
e enfrenta a turma da **XôMaq** (sátira da antiga loja). No fim, chega ao altar no dia **17/10/2027**.

| Mundo | Fase | Tema |
|---|---|---|
| 🏡 Família | 1. Quintal da Família | casinhas, pinheiros, a família torcendo, mesa com bolo e pudim |
| ⛪ Igreja | 2. Ensaio da Banda | palco, bateria, teclado, guitarras, telões do louvor, palco que sobe e desce |
| 🎨 Hobbies | 3. Ateliê de Costura | lápis, alfinetes, botões e carretéis gigantes, manequins |
| 🎨 Hobbies | 4. Rodízio de Sushi | sushi, estrogonofe e pudim gigantes, esteira de pratos, lanternas |
| 🎨 Hobbies | 5. Aulão de Fit Dance | pista neon, caixas de som, plataformas no ritmo da música eletrônica |
| 🧵 XôMaq | 6. A Loja XôMaq | prateleiras, metas, hora extra e o chefão **Gerente** |
| 🎄 Natal | 7. Noite de Natal | neve caindo, pinheiros com pisca-pisca, bonecos de neve, bengalas doces, árvore gigante |
| 💍 Casamento | 8. O Grande Dia | tapete vermelho, convidados, pinheiros com luzes e a cena final no altar |

## Itens e perigos

| | O que é |
|---|---|
| 🌹 Flor | coletável; 100 flores = 1 vida |
| 🎁 Presente | quebra ao pisar ou girar; solta flores |
| 🔊 Caixa de som | trampolim (pulo bem alto) |
| 🌲 Caixa do pinheiro | checkpoint; nasce um pinheirinho no lugar |
| 🍈 Caixote de goiaba | explode (pisar acende o pavio; girar explode na hora) |
| 🔩 Caixa XôMaq | de metal, não quebra |
| 🍮 Pudim | protege de um golpe e fica voando em volta da Bia |
| 💍 Aliança | uma escondida em cada fase |
| 🧵 Maquininha / carretel | vilões da XôMaq: pule em cima ou gire |
| 🍈 Goiaba | não dá para derrotar: só desviar |

O menu mostra quantos dias faltam para o casamento. Nos dias antes do aniversário (8/11) aparece uma
contagem, e no próprio dia aparecem parabéns com confete.

## Rodar no computador

```bash
python3 -m http.server 8000
```

Depois é só abrir http://localhost:8000. Para testar todas as fases sem precisar terminar as anteriores:
http://localhost:8000/?tudo=1. Para ver a tela de aniversário: `?hoje=2026-11-08`.

## Controles

| Ação | Teclado | Controle |
|---|---|---|
| Andar | WASD ou setas | analógico / direcional |
| Pular | Espaço | A / ✕ |
| Giro do Fit Dance | J ou Shift | X / ▢ |
| Pausar | Esc ou P | Start |
| Som | M | |

No celular aparecem botões na tela.

## Onde mexer em cada coisa

| Quero mudar… | Arquivo |
|---|---|
| Nome do noivo e mensagem final, datas | `src/config.js` (`HISTORIA`) |
| Nome e cores do vilão | `src/config.js` (`VILAO`) |
| Velocidade, pulo, vidas | `src/config.js` (`AJUSTES`) |
| As fases (caixas, flores, inimigos, buracos) | `src/fases/*.js` (construtor explicado em `construtor.js`) |
| Cenários, céu e enfeites de cada mundo | `src/temas.js` |
| A Bia e os vestidos | `src/modelos/bia.js` |
| Presentes, pudim, aliança, pinheiro, pessoas | `src/modelos/itens.js` |
| Vilões e chefão | `src/modelos/inimigos.js` e a classe `Chefe` em `src/mundo.js` |
| Músicas | `src/musica.js` (todas originais, geradas na hora) |
| Efeitos sonoros | `src/som.js` |
| Telas e menu | `index.html`, `estilo.css`, `src/main.js` |

## Tecnologia

- [Three.js](https://threejs.org) 0.169 (já incluído em `vendor/`). Sem etapa de build.
- Visual "desenho animado": materiais toon e contorno escuro.
- Placar online no Supabase (projeto `jogo-plataforma`): tabela `recordes` com leitura pública; gravação
  só pela função `registrar_recorde`, que valida os dados. A chave em `src/config.js` é a publishable,
  feita para ficar no navegador.
- O progresso (fases liberadas, alianças, roupa escolhida) fica salvo no próprio navegador.
