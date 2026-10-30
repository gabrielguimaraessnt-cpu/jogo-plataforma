# Modelo próprio da Bia (Blender → jogo)

Hoje a Bia é montada por código (`src/modelos/bia.js`). Se um dia quiser trocar por um modelo feito no
Blender, coloque o arquivo `bia.glb` nesta pasta e deixe o `modelos.json` assim:

```json
["bia"]
```

Se o arquivo não existir ou der erro, o jogo volta sozinho para o modelo feito por código.

## Regras para exportar do Blender

1. **Escala:** 1 unidade do Blender = 1 metro. A Bia do jogo tem uns 1,45 m (estilo cabeção, fofinho).
2. **Posição:** os pés no ponto de origem (0, 0, 0).
3. **Frente:** a personagem olhando para a vista **Frontal** do Blender (tecla 1 do teclado numérico).
4. **Aplique as transformações** antes de exportar: `Ctrl+A` → *All Transforms*.
5. **Exportar:** *File → Export → glTF 2.0*, formato **glTF Binary (.glb)**, com *Apply Modifiers* e *Animation*.
6. **Estilo:** poucos polígonos (2.000 a 8.000) e cores ou texturas pequenas. Fica leve no celular.

## Animações

O jogo escolhe a animação pelo **nome** da ação (Action) no Blender:

| Nome da ação | Quando toca |
|---|---|
| `parado` | sem andar |
| `correr` | andando no chão |
| `pular` | no ar |
| `girar` | giro do fit dance (se não existir, o jogo gira o modelo inteiro) |

Caminho mais fácil: modelar no Blender, subir no [Mixamo](https://www.mixamo.com) para gerar o esqueleto
e as animações, trazer de volta ao Blender, renomear as ações como acima e exportar.
