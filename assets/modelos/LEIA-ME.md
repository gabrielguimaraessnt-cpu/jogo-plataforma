# Modelos próprios (Blender → jogo)

O jogo procura modelos `.glb` nesta pasta. Se um modelo existir e estiver na lista `modelos.json`, ele
substitui o modelo feito por código. Se não existir, o jogo usa o modelo padrão.

## Nomes aceitos

| Arquivo | O que substitui | Tamanho aproximado |
|---|---|---|
| `zuca.glb` | personagem principal (com animações) | 1 m de altura |
| `besouro.glb` | inimigo | 0,6 m de altura, 1 m de comprimento |
| `caju.glb` | coletável | 0,5 m |
| `arvore.glb` | árvores do cenário | 4 a 6 m |
| `chegada.glb` | anel do fim da fase | 3 m |
| `caixa-comum.glb`, `caixa-mola.glb`, `caixa-checkpoint.glb`, `caixa-explosiva.glb`, `caixa-ferro.glb` | caixas | cubo de 1 m, centro no meio |

Depois de copiar o arquivo, acrescente o nome em `modelos.json`. Por exemplo:

```json
["zuca", "caju"]
```

## Regras para exportar do Blender

1. **Escala:** 1 unidade do Blender = 1 metro no jogo.
2. **Posição:** os pés do personagem (ou a base do objeto) no ponto de origem (0, 0, 0). A exceção são as
   caixas, que ficam com o centro na origem.
3. **Frente:** o personagem olhando para a vista **Frontal** do Blender (tecla 1 do teclado numérico).
4. **Aplique as transformações** antes de exportar: `Ctrl+A` → *All Transforms*.
5. **Exportar:** *File → Export → glTF 2.0*, formato **glTF Binary (.glb)**.
   Marque *Apply Modifiers* e, se tiver animações, *Animation*.
6. **Estilo:** poucos polígonos (500 a 3.000 no personagem) e cores ou texturas pequenas. Fica leve no celular e combina com o resto.

## Animações do personagem

O jogo troca de animação pelo **nome** da ação (Action) no Blender:

| Nome da ação | Quando toca |
|---|---|
| `parado` | sem andar |
| `correr` | andando no chão |
| `pular` | no ar |
| `girar` | ataque giratório (se não existir, o jogo gira o modelo inteiro) |

Caminho mais fácil para um personagem com forma humana: modelar no Blender, subir no
[Mixamo](https://www.mixamo.com) para gerar o esqueleto e as animações, trazer de volta ao Blender,
renomear as ações como acima e exportar.

Personagem de quatro patas (como o tatu) precisa de esqueleto feito à mão no Blender. Dá mais trabalho;
dá para começar só com `parado` e `correr`.
