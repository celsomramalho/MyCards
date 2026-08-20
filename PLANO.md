# Plano de implementação — Hub de jogos + "Adivinhar data"

> Acompanhe o progresso pelas caixas abaixo. Cada etapa concluída será marcada com `[x]`.
> As etapas estão ordenadas por dependência — conclua uma antes de passar à próxima dentro de cada fase.

---

## Contexto

Hoje o app é um PWA vanilla (sem build, sem framework) 100% dedicado ao jogo **Sobe Desce**.
Tudo (constantes do jogo, regras, textos, chaves de localStorage) vive em `app.js`, `index.html` e `manifest.json`.

O objetivo é transformar isso num **hub de vários jogos** e já implementar o segundo jogo,
**Adivinhar data**, que tem mecânica totalmente diferente do primeiro (sem placar, sem rodadas
de cartas/vazas — é um truque de adivinhação com cartas binárias).

### Como funciona "Adivinhar data"

- 5 cartas, cada uma com 16 números dispostos numa grade 4×4.
- O jogador pensa numa data (dia + mês).
- **Rodada 1 (descobrir o dia):** mostramos as 5 cartas; o jogador marca todas as cartas
  que contêm o dia. Somamos o **primeiro número** de cada carta marcada → resultado = dia.
- **Rodada 2 (descobrir o mês):** mostramos as 5 cartas de novo; o jogador marca todas as
  cartas que contêm o mês. Somamos o primeiro número de cada carta marcada → resultado = mês.
- **Revelação:** recolhe as cartas e mostra o dia e o mês.

> O primeiro número de cada carta é uma potência de 2 (16, 2, 8, 1, 4). Um número aparece
> numa carta exatamente quando o bit correspondente está "aceso" no número — por isso somar
> os primeiros números das cartas marcadas reconstrói o valor. É o truque clássico de cartas
> binárias, aplicado a dia (1–31) e mês (1–12).

### Cartas (primeiro número = chave de soma)

```
Carta 1 (chave 16): 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
Carta 2 (chave  2):  2, 22, 18, 23, 14,  7,  6, 19, 31, 10,  3, 30, 11, 27, 15, 26
Carta 3 (chave  8):  8, 31, 15, 28, 25, 10, 30, 29, 26, 14, 12, 24, 13,  9, 27, 11
Carta 4 (chave  1):  1,  5,  9, 31,  7, 29, 23, 21, 25, 11, 27, 17, 15,  3, 13, 19
Carta 5 (chave  4):  4, 13, 12,  5, 23, 21, 15, 14,  7, 31, 22, 20, 28,  6, 29, 30
```

Cada carta é exibida como grade 4×4 (4 colunas × 4 linhas), conforme o esboço enviado.

---

## Contrato entre hub e jogo

Cada jogo é um módulo JS que exporta um objeto mínimo:

```js
export default {
  id: "adivinhar-data",
  nome: "Adivinhar data",
  descricao: "Descubra o dia e o mês que o jogador pensou.",
  icone: "📅", // emoji ou caminho de svg
  mount(container, { storage, escapeHtml, voltar }) { /* renderiza no container */ },
  unmount() { /* limpa listeners/timers ao sair */ },
};
```

- `mount(container, ctx)` recebe o `<div id="app">` e um contexto com utilidades
  compartilhadas (`storage` namespaced por jogo, `escapeHtml`, `voltar` para a hub).
- `unmount()` é chamado pelo roteador antes de montar outro jogo (ou voltar à hub).
- Nada de modelo de dados comum — cada jogo guarda o próprio estado como quiser.

---

## Fase 0 — Documento e base

- [x] 0.1 Criar este documento de passo a passo (`PLANO.md`)
- [x] 0.2 Validar o plano com o usuário antes de começar a implementar

---

## Fase 1 — Reestruturação de pastas e shell

- [x] 1.1 Criar a estrutura de pastas:
  - `core/` — utilidades compartilhadas (storage namespaced, `uid()`, `escapeHtml()`,
    prompt de instalação, roteador, render da hub)
  - `games/sobe-desce/` — jogo atual movido para cá
  - `games/adivinhar-data/` — segundo jogo (novo)
  - `registry.js` — lista de jogos disponíveis `{ id, nome, icone, descricao, modulo }`
- [x] 1.2 Extrair utilidades compartilhadas para `core/storage.js`:
  - `loadState(jogoId)`, `saveState(jogoId, state)`, `clearState(jogoId)`
  - padrão de chave: `games:<id>:state` (evita colisão entre jogos)
  - mover `escapeHtml()` e `uid()` para `core/utils.js`
- [x] 1.3 Criar `core/router.js` — roteador simples por hash:
  - `#/` → hub (lista de jogos)
  - `#/jogo/sobe-desce` → carrega e monta o jogo
  - `#/jogo/adivinhar-data` → carrega e monta o jogo
  - chama `unmount()` do jogo atual antes de montar o próximo
  - carrega cada jogo sob demanda com `import()` dinâmico
- [x] 1.4 Criar `core/hub.js` — tela da hub:
  - lista os jogos a partir de `registry.js`
  - cada jogo vira um card clicável que navega para `#/jogo/<id>`
  - mostra "continuar" se houver estado salvo do jogo (opcional)
- [x] 1.5 Ajustar `index.html`:
  - título e `<h1>` deixam de ser "Sobe Desce" e viram o nome do hub (ex.: "Cartas")
  - carregar `core/router.js` como `<script type="module">`
  - footer/contextual: botões "Reiniciar partida" e "Instalar" só aparecem dentro de um jogo

---

## Fase 2 — Migrar o Sobe Desce para a nova estrutura

- [ ] 2.1 Mover `app.js` → `games/sobe-desce/game.js` e adaptar para o contrato
  (`mount`/`unmount`), usando `ctx.storage` e `ctx.escapeHtml` em vez das constantes globais
- [ ] 2.2 Mover as regras do Sobe Desce para `games/sobe-desce/rules.js` (texto das regras)
- [ ] 2.3 Mover estilos específicos do Sobe Desce para `games/sobe-desce/styles.css`
  (manter os estilos base compartilhados em `styles.css` global)
- [ ] 2.4 Registrar o Sobe Desce em `registry.js`
- [ ] 2.5 Confirmar que o Sobe Desce continua funcionando igual (setup, rodadas, placar,
  finalização) dentro da nova estrutura

---

## Fase 3 — Implementar "Adivinhar data"

- [ ] 3.1 Criar `games/adivinhar-data/game.js` com o contrato (`mount`/`unmount`)
- [ ] 3.2 Definir os dados das 5 cartas (arrays de 16 números) e a chave de soma de cada uma
  (primeiro número = 16, 2, 8, 1, 4)
- [ ] 3.3 Tela de introdução: explicar a mecânica e botão "Começar"
- [ ] 3.4 **Rodada 1 (dia):** renderizar as 5 cartas como grades 4×4, cada carta com um
  checkbox/estado "marcada"; botão "Descobrir o dia" que soma os primeiros números das cartas
  marcadas e mostra o dia
- [ ] 3.5 **Rodada 2 (mês):** reapresentar as 5 cartas (limpar marcações da rodada 1);
  botão "Descobrir o mês" que soma os primeiros números das cartas marcadas e mostra o mês
- [ ] 3.6 **Revelação:** mostrar dia + mês juntos (ex.: "19 de agosto") e botão "Jogar de novo"
- [ ] 3.7 Estilos da grade 4×4 em `games/adivinhar-data/styles.css` (células com borda,
  números centralizados, estado marcado destacado) — seguir o esboço enviado
- [ ] 3.8 Registrar "Adivinhar data" em `registry.js`
- [ ] 3.9 Testar o fluxo completo: pensar numa data → marcar dia → marcar mês → conferir
  revelação contra a data pensada

---

## Fase 4 — Shell, PWA e ajustes finais

- [x] 4.1 Atualizar `manifest.json`: nome/short_name do hub (não mais "Sobe Desce"),
  ícone e cores neutras
- [x] 4.2 Atualizar `sw.js`: incluir os novos arquivos (`core/*`, `games/*`, `registry.js`)
  na lista de precache; bumpar a versão do cache
- [x] 4.3 Garantir que o botão "Voltar" (navegação por hash) funciona de cada jogo para a hub
- [x] 4.4 Revisar responsividade no viewport de tablet (1004px) e mobile
- [x] 4.5 Smoke test final: hub → Sobe Desce → voltar → Adivinhar data → voltar

---

## Notas

- Sem build, sem bundler: usar `<script type="module">` e `import()` dinâmico.
- Cada jogo só é baixado quando aberto (import dinâmico) — bom para jogos "bem diferentes".
- localStorage namespaced por jogo (`games:<id>:state`) evita colisão.
- O contrato é fino de propósito: não forçar modelo de dados comum entre jogos.
