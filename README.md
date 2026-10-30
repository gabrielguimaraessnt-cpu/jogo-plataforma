# Zuca e a Floresta do Caju

Jogo de plataforma 3D em corredor que roda no navegador: o tatu Zuca corre pela floresta, pula, gira para
quebrar caixas, pega cajus, derruba besouros e tenta chegar ao anel dourado no menor tempo. Os tempos vão
para um placar online.

- **Motor:** [Three.js](https://threejs.org) 0.169 (já incluído em `vendor/`, não precisa instalar nada)
- **Placar online:** Supabase (projeto `jogo-plataforma`)
- **Publicação:** Vercel (site estático, sem etapa de build)

## Rodar no computador

Qualquer servidor estático serve. Por exemplo, com Python:

```bash
python3 -m http.server 8000
```

Depois é só abrir http://localhost:8000. Abrir o `index.html` direto com dois cliques não funciona, porque
o navegador bloqueia os módulos JavaScript fora de um servidor.

## Controles

| Ação | Teclado | Controle |
|---|---|---|
| Andar | WASD ou setas | analógico / direcional |
| Pular | Espaço | A / ✕ |
| Girar (ataque) | J ou Shift | X / ▢ |
| Pausar | Esc ou P | Start |
| Som | M | |

No celular aparecem botões na tela.

## Onde mexer em cada coisa

| Quero mudar… | Arquivo |
|---|---|
| Velocidade, altura do pulo, gravidade, vidas | `src/config.js` (objeto `AJUSTES`) |
| A fase: chão, caixas, cajus, inimigos, plataformas | `src/fases/fase1.js` |
| Criar outra fase | copiar `fase1.js` e registrar em `src/fases/index.js` |
| Aparência do personagem, inimigos, caixas e árvores | `src/modelos.js`, ou modelos do Blender (abaixo) |
| Física e controles do personagem | `src/jogador.js` |
| Regras de caixas, inimigos e explosões | `src/mundo.js` |
| Sons | `src/som.js` |
| Telas, menu e HUD | `index.html` e `estilo.css` |
| Placar online | `src/placar.js` e `supabase/migrations/` |

## Trocar os modelos pelos seus (Blender)

Hoje todos os modelos são montados por código com formas simples. Para usar modelos próprios, veja
[`assets/modelos/LEIA-ME.md`](assets/modelos/LEIA-ME.md). Em resumo: exporte um `.glb`, coloque em
`assets/modelos/` e acrescente o nome na lista `assets/modelos/modelos.json`.

## Tipos de caixa

| Caixa | O que faz |
|---|---|
| Comum (madeira) | Quebra ao pisar, girar ou dar cabeçada. Solta cajus. |
| Mola (seta verde) | Pisar dá um pulo bem alto. Girar quebra. |
| Checkpoint (azul) | Ao quebrar, vira o novo ponto de volta quando o Zuca cai. |
| Explosiva (vermelha) | Pisar acende o pavio (1,6 s). Girar explode na hora. Explosão perto mata. |
| Metal | Não quebra. Serve de parede ou degrau. |

## Placar online (Supabase)

- Tabela `recordes`: leitura pública. Ninguém grava direto nela.
- Função `registrar_recorde(nome, fase, tempo_ms, caixas, frutas)`: única forma de gravar. Ela limpa o
  nome, confere os limites e segura excesso de envios.
- A chave no `src/config.js` é a **publishable**, feita para ficar no navegador. A chave secreta
  (`service_role`) nunca entra neste repositório.

## Próximos passos sugeridos

1. Jogar bastante e ajustar `AJUSTES` até o pulo e a corrida ficarem gostosos.
2. Fazer o personagem no Blender e trocar o modelo.
3. Mais fases (neve, caverna, praia), chefe no fim de cada mundo, mapa de fases.
4. Música de fundo, menu de opções, save do progresso.
5. Multiplayer (corrida fantasma com o tempo dos outros jogadores, ou corrida ao vivo usando o Realtime do Supabase).
