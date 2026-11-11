# Ateliê de Guerrilha

App estático (HTML, CSS e JavaScript puro, sem build, sem CDN). Abre direto do disco (`index.html`) e funciona no GitHub Pages.

## Como usar
1. **Inventário**: confira as quantidades (vazio = "preencher").
2. **Linhas** ou **Assistente** (aba Plano): escolha a linha e o número de kits; o app monta o plano.
3. **Plano**: veja folhas, cortes, alertas de falta, fila de impressão e a lista de montagem.
4. **Folhas e corte**: confira a folha A4 e o roteiro de corte (posição em mm de cada corte).
5. **Imprimir**: escala 100%, sem ajustar à página, qualidade alta. Imprima primeiro uma folha e meça a régua de 100 mm.
6. **Distribuição**: lista de marcar com contagem de peças entregues.
7. **Projeto**: salvar/abrir JSON e restaurar padrão.

## Publicar
Copie a pasta `atelie/` para `estudio/` no repositório `jl` (GitHub Pages: https://jz3h.github.io/jl/estudio/). A pasta `_teste/` não precisa subir.

## Onde ficam os dados
- Navegador deste aparelho, `localStorage`, chave `atelie.v1` (inventário, peças, plano, marcas de distribuição).
- Locais: `data/locais.js` (`window.LOCAIS`). Pode ser substituído mantendo o formato.
- Dados fixos (símbolos, frases, tintas, linhas): `js/data.js`. Peças: `js/pieces.js`. Imposição e plano: `js/engine.js`. QR fixo: `assets/qr.png` (aponta para https://jz3h.github.io/jl/).

## Teste
`node _teste/teste.js` (Playwright e PyMuPDF/OpenCV instalados). Gera PDFs e capturas em `_teste/`.
