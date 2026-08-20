window.Cartas = window.Cartas || {};
Cartas.games = Cartas.games || {};
(function () {
  var escapeHtml = Cartas.escapeHtml;

  const LINHAS_INICIAIS = [5, 4, 3];
  const PLACAR_KEY = "games:sobra-uma-carta:placar";

  let app;
  let storage;
  let globalResetButton;
  let rulesButton;
  let styleLink;
  let state = null;

  Cartas.games["sobra-uma-carta"] = {
    id: "sobra-uma-carta",
    nome: "Sobra uma carta",
    mount(container, ctx) {
      app = container;
      storage = ctx.storage;
      globalResetButton = ctx.globalResetButton;
      rulesButton = ctx.rulesButton;
      if (!styleLink) {
        styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = "games/sobra-uma-carta/styles.css";
        styleLink.dataset.gameStyles = "sobra-uma-carta";
        document.head.appendChild(styleLink);
      }
      state = storage.load() || estadoSetup();
      if (globalResetButton) globalResetButton.onclick = resetGame;
      if (rulesButton) { rulesButton.onclick = mostrarRegras; rulesButton.classList.remove("hidden"); }
      render();
    },
    unmount() {
      if (app) app.innerHTML = "";
      styleLink?.remove();
      styleLink = null;
    },
  };

  function criarLinhas() { return LINHAS_INICIAIS.map(function (quantidade) { return Array.from({ length: quantidade }, function () { return true; }); }); }

  function normalizarNome(nome) { return String(nome || "").trim().toLowerCase(); }

  function carregarPlacar() { try { return JSON.parse(localStorage.getItem(PLACAR_KEY) || "null"); } catch (e) { return null; } }
  function salvarPlacar(placar) { localStorage.setItem(PLACAR_KEY, JSON.stringify(placar)); }

  function obterPlacar(nome1, nome2) {
    const atual = carregarPlacar();
    if (atual && normalizarNome(atual.nome1) === normalizarNome(nome1) && normalizarNome(atual.nome2) === normalizarNome(nome2)) return atual;
    const novo = { nome1: nome1, nome2: nome2, vitorias1: 0, vitorias2: 0 };
    salvarPlacar(novo);
    return novo;
  }

  function estadoSetup() {
    return { status: "setup", jogador1: "", jogador2: "", starter: 1, turno: 1, linhas: criarLinhas(), selecaoLinha: null, selecaoCartas: [], perdedor: null, placar: null };
  }

  function persist() { storage.save(state); }

  function resetGame() {
    if (!confirm("Reiniciar a partida? Todos os dados atuais serão apagados.")) return;
    state = estadoSetup();
    persist();
    render();
  }

  function iniciarPartida(nome1, nome2) {
    state = { status: "jogando", jogador1: nome1, jogador2: nome2, starter: 1, turno: 1, linhas: criarLinhas(), selecaoLinha: null, selecaoCartas: [], perdedor: null, placar: obterPlacar(nome1, nome2) };
    persist();
    render();
  }

  function jogarNovamente() {
    const novoIniciante = state.starter === 1 ? 2 : 1;
    state = { status: "jogando", jogador1: state.jogador1, jogador2: state.jogador2, starter: novoIniciante, turno: novoIniciante, linhas: criarLinhas(), selecaoLinha: null, selecaoCartas: [], perdedor: null, placar: state.placar };
    persist();
    render();
  }

  function nomeJogador(numero) { return (numero === 1 ? state.jogador1 : state.jogador2) || `Jogador ${numero}`; }

  function placarBadgeHtml() {
    if (!state.placar) return "";
    return `<span class="placar-badge">${escapeHtml(state.jogador1)} ${state.placar.vitorias1} × ${state.placar.vitorias2} ${escapeHtml(state.jogador2)}</span>`;
  }

  function cabecalhoJogoHtml() {
    return `<div class="su-header-row"><p class="eyebrow">Sobra uma carta</p>${placarBadgeHtml()}</div>`;
  }

  function selecionarCarta(linhaIndex, cartaIndex) {
    if (state.selecaoLinha !== null && state.selecaoLinha !== linhaIndex) {
      state.selecaoLinha = linhaIndex;
      state.selecaoCartas = [cartaIndex];
    } else {
      state.selecaoLinha = linhaIndex;
      const jaSelecionada = state.selecaoCartas.includes(cartaIndex);
      state.selecaoCartas = jaSelecionada ? state.selecaoCartas.filter(function (c) { return c !== cartaIndex; }) : state.selecaoCartas.concat([cartaIndex]);
      if (state.selecaoCartas.length === 0) state.selecaoLinha = null;
    }
    persist();
    render();
  }

  function totalRestante() { return state.linhas.reduce(function (soma, linha) { return soma + linha.filter(Boolean).length; }, 0); }

  function removerSelecionadas() {
    if (state.selecaoLinha === null || !state.selecaoCartas.length) return;
    const linha = state.linhas[state.selecaoLinha];
    state.selecaoCartas.forEach(function (indice) { linha[indice] = false; });
    state.selecaoLinha = null;
    state.selecaoCartas = [];
    if (totalRestante() <= 1) {
      state.status = "fim";
      const vencedor = state.turno;
      state.perdedor = vencedor === 1 ? 2 : 1;
      if (state.placar) {
        if (vencedor === 1) state.placar.vitorias1 += 1; else state.placar.vitorias2 += 1;
        salvarPlacar(state.placar);
      }
    } else {
      state.turno = state.turno === 1 ? 2 : 1;
    }
    persist();
    render();
  }

  function renderLinha(linhaIndex) {
    const linha = state.linhas[linhaIndex];
    const cartasHtml = linha.map(function (presente, cartaIndex) {
      if (!presente) return "";
      const selecionada = state.selecaoLinha === linhaIndex && state.selecaoCartas.includes(cartaIndex);
      return `<button class="su-card linha-${linhaIndex + 1} ${selecionada ? "selecionada" : ""}" data-linha="${linhaIndex}" data-carta="${cartaIndex}" type="button" aria-pressed="${selecionada}" aria-label="Carta da linha ${linhaIndex + 1}"></button>`;
    }).join("");
    return `<div class="su-linha">${cartasHtml}</div>`;
  }

  function showSetup() {
    app.innerHTML = `<section class="card narrow">
      <p class="eyebrow">Sobra uma carta</p>
      <h2>Quem vai jogar?</h2>
      <p class="muted">Informe o nome dos dois jogadores para começar a partida.</p>
      <form id="setupForm">
        <label>Jogador 1<input id="nomeJogador1" type="text" maxlength="24" value="${escapeHtml(state.jogador1 || "")}" placeholder="Nome do jogador 1" required /></label>
        <label class="su-setup-field">Jogador 2<input id="nomeJogador2" type="text" maxlength="24" value="${escapeHtml(state.jogador2 || "")}" placeholder="Nome do jogador 2" required /></label>
        <div class="actions"><button class="button" type="submit">Começar partida</button></div>
      </form>
    </section>`;
    app.querySelector("#setupForm").addEventListener("submit", function (event) {
      event.preventDefault();
      const nome1 = app.querySelector("#nomeJogador1").value.trim();
      const nome2 = app.querySelector("#nomeJogador2").value.trim();
      if (!nome1 || !nome2) return;
      iniciarPartida(nome1, nome2);
    });
  }

  function renderJogo() {
    const restantes = totalRestante();
    const podeRemover = state.selecaoLinha !== null && state.selecaoCartas.length > 0;
    app.innerHTML = `<section class="card">
      ${cabecalhoJogoHtml()}
      <div class="su-turno">Vez de: <strong>${escapeHtml(nomeJogador(state.turno))}</strong></div>
      <p class="hint">Escolha de 1 até todas as cartas de uma única linha e clique em Remover. Quem deixar apenas 1 carta no tabuleiro vence a partida.</p>
      <div class="su-tabuleiro">${[0, 1, 2].map(renderLinha).join("")}</div>
      <p class="hint su-restantes">${restantes} carta${restantes === 1 ? "" : "s"} no tabuleiro.</p>
      <div class="actions"><button class="button" data-action="remover" type="button" ${podeRemover ? "" : "disabled"}>Remover</button></div>
    </section>`;
    app.querySelectorAll("[data-linha]").forEach(function (card) {
      card.addEventListener("click", function () { selecionarCarta(Number(card.dataset.linha), Number(card.dataset.carta)); });
    });
    app.querySelector('[data-action="remover"]').addEventListener("click", removerSelecionadas);
  }

  function renderFim() {
    const perdedor = nomeJogador(state.perdedor);
    const vencedor = nomeJogador(state.perdedor === 1 ? 2 : 1);
    app.innerHTML = `<section class="card narrow">
      ${cabecalhoJogoHtml()}
      <h2>Fim de partida</h2>
      <p class="notice error"><strong>${escapeHtml(perdedor)}</strong> ficou com a última carta e perdeu!</p>
      <p class="notice success">🏆 <strong>${escapeHtml(vencedor)}</strong> venceu!</p>
      <div class="actions"><button class="button" data-action="de-novo" type="button">Jogar de novo</button></div>
    </section>`;
    app.querySelector('[data-action="de-novo"]').addEventListener("click", jogarNovamente);
  }

  function mostrarRegras() {
    app.innerHTML = `<section class="card rules-card"><p class="eyebrow">Regras do jogo</p><h2>Sobra uma carta</h2><ol class="rules-list">
      <li><strong>Objetivo</strong><p>Jogo de lógica para 2 jogadores. O tabuleiro tem 3 linhas de cartas (5, 4 e 3 cartas). Quem deixar apenas 1 carta sobrando no tabuleiro vence a partida.</p></li>
      <li><strong>Sua vez</strong><p>Escolha uma única linha que ainda tenha cartas e marque de 1 até todas as cartas restantes dessa linha. Depois clique em <strong>Remover</strong>.</p></li>
      <li><strong>Só uma linha por vez</strong><p>Não é possível remover cartas de mais de uma linha no mesmo turno. Ao marcar uma carta de outra linha, a seleção anterior é desfeita.</p></li>
      <li><strong>Passagem de turno</strong><p>Depois de cada remoção, é a vez do outro jogador, que segue a mesma regra.</p></li>
      <li><strong>Fim de jogo</strong><p>Assim que uma jogada deixar apenas 1 carta no tabuleiro, a partida termina imediatamente. Quem fez essa jogada vence, e o outro jogador — que seria forçado a remover a última carta — perde.</p></li>
      <li><strong>Nova partida</strong><p>Ao clicar em Jogar de novo, o tabuleiro volta ao início (5-4-3) e o jogador que não começou a partida anterior começa a nova.</p></li>
    </ol><div class="actions"><button class="button" data-action="voltar-regras" type="button">Voltar</button></div></section>`;
    app.querySelector('[data-action="voltar-regras"]').addEventListener("click", render);
  }

  function updateGlobalResetButton() { globalResetButton?.classList.toggle("hidden", !(state && state.status !== "setup")); }

  function render() {
    updateGlobalResetButton();
    if (state.status === "setup") return showSetup();
    if (state.status === "fim") return renderFim();
    renderJogo();
  }
})();
