window.Cartas = window.Cartas || {};
Cartas.games = Cartas.games || {};
(function () {
  var escapeHtml = Cartas.escapeHtml;

  const CARTAS = [
  { chave: 16, numeros: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] },
  { chave: 2, numeros: [2, 22, 18, 23, 14, 7, 6, 19, 31, 10, 3, 30, 11, 27, 15, 26] },
  { chave: 8, numeros: [8, 31, 15, 28, 25, 10, 30, 29, 26, 14, 12, 24, 13, 9, 27, 11] },
  { chave: 1, numeros: [1, 5, 9, 31, 7, 29, 23, 21, 25, 11, 27, 17, 15, 3, 13, 19] },
  { chave: 4, numeros: [4, 13, 12, 5, 23, 21, 15, 14, 7, 31, 22, 20, 28, 6, 29, 30] },
];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

let app;
let rulesButton;
let styleLink;
let fase = "intro";
let dia = null;
let mes = null;
let marcadas = [false, false, false, false, false];

Cartas.games["adivinhar-data"] = {
  id: "adivinhar-data",
  nome: "Adivinhar data",
  mount(container, ctx) {
    app = container;
    rulesButton = ctx.rulesButton;
    if (rulesButton) { rulesButton.onclick = mostrarRegras; rulesButton.classList.remove("hidden"); }
    if (!styleLink) {
      styleLink = document.createElement("link");
      styleLink.rel = "stylesheet";
      styleLink.href = "games/adivinhar-data/styles.css";
      styleLink.dataset.gameStyles = "adivinhar-data";
      document.head.appendChild(styleLink);
    }
    fase = "intro"; dia = null; mes = null; marcadas = [false, false, false, false, false];
    render();
  },
  unmount() {
    if (app) app.innerHTML = "";
    styleLink?.remove();
    styleLink = null;
  },
};

function numerosGrid(numeros) {
  const ordenados = [];
  for (let i = 0; i < numeros.length; i += 4) ordenados.push(...numeros.slice(i, i + 4).reverse());
  return ordenados;
}

function somaChaves() { return marcadas.reduce((soma, marcada, i) => marcada ? soma + CARTAS[i].chave : soma, 0); }

function renderCarta(carta, index) {
  const marcada = marcadas[index];
  return `<button class="ad-card ${marcada ? "marcada" : ""}" data-carta="${index}" type="button" aria-pressed="${marcada}">
    <span class="ad-card-tag">Carta ${index + 1}${marcada ? " ✓" : ""}</span>
    <span class="ad-grid">${numerosGrid(carta.numeros).map(n => `<span class="ad-cell">${n}</span>`).join("")}</span>
  </button>`;
}

function renderCartas(rodada, titulo, instrucao, botao) {
  const marcadasCount = marcadas.filter(Boolean).length;
  app.innerHTML = `<section class="card"><p class="eyebrow">Adivinhar data</p><h2>${titulo}</h2><p class="muted">${instrucao}</p><p class="hint">Toque nas cartas que contêm o número para marcá-las.${marcadasCount ? ` ${marcadasCount} carta${marcadasCount === 1 ? "" : "s"} marcada${marcadasCount === 1 ? "" : "s"}.` : ""}</p><div class="ad-cards">${CARTAS.map((c, i) => renderCarta(c, i)).join("")}</div><div class="actions"><button class="button" data-action="descobrir" type="button" ${marcadasCount ? "" : "disabled"}>${botao}</button></div></section>`;
  app.querySelectorAll("[data-carta]").forEach(card => card.addEventListener("click", () => { const i = Number(card.dataset.carta); marcadas[i] = !marcadas[i]; render(); }));
  app.querySelector('[data-action="descobrir"]').addEventListener("click", () => {
    const resultado = somaChaves();
    if (rodada === "dia") { dia = resultado; fase = "mes"; marcadas = [false, false, false, false, false]; render(); }
    else { mes = resultado; fase = "revelacao"; render(); }
  });
}

function renderIntro() {
  app.innerHTML = `<section class="card narrow"><p class="eyebrow">Adivinhar data</p><h2>Descubra a data secreta</h2><p class="muted">Peça para alguém pensar numa data (dia e mês). Através das 5 cartas, você vai descobrir o dia e o mês que a pessoa pensou.</p><ol class="rules-list"><li><strong>Dia</strong><p>Mostre as 5 cartas e peça para a pessoa marcar todas que contêm o dia pensado. Some o primeiro número de cada carta marcada — o resultado é o dia.</p></li><li><strong>Mês</strong><p>Mostre as cartas de novo e peça para marcar todas que contêm o mês. Some o primeiro número de cada carta marcada — o resultado é o mês.</p></li><li><strong>Revelação</strong><p>Mostre o dia e o mês descobertos.</p></li></ol><div class="actions"><button class="button" data-action="comecar" type="button">Começar</button></div></section>`;
  app.querySelector('[data-action="comecar"]').addEventListener("click", () => { fase = "dia"; marcadas = [false, false, false, false, false]; render(); });
}

function renderRevelacao() {
  const nomeMes = MESES[mes - 1] || "?";
  app.innerHTML = `<section class="card narrow"><p class="eyebrow">Adivinhar data</p><h2>Data descoberta!</h2><p class="notice success">A data pensada foi <strong>${dia} de ${escapeHtml(nomeMes)}</strong>.</p><div class="actions"><button class="button" data-action="de-novo" type="button">Jogar de novo</button></div></section>`;
  app.querySelector('[data-action="de-novo"]').addEventListener("click", () => { fase = "intro"; dia = null; mes = null; render(); });
}

function mostrarRegras() {
  app.innerHTML = `<section class="card rules-card"><p class="eyebrow">Regras do jogo</p><h2>Adivinhar data</h2><ol class="rules-list"><li><strong>Objetivo</strong><p>Descobrir o dia e o mês de uma data que alguém pensou, usando 5 cartas com 16 números cada.</p></li><li><strong>Primeiro número de cada carta</strong><p>Cada carta tem um número-chave (o primeiro número): 16, 2, 8, 1 e 4. Somar os números-chave das cartas marcadas revela o valor pensado.</p></li><li><strong>Rodada do dia</strong><p>Peça para a pessoa pensar num dia de 1 a 31. Mostre as 5 cartas e peça que marque todas as que contêm o dia. Some os números-chave das cartas marcadas — o resultado é o dia.</p></li><li><strong>Rodada do mês</strong><p>Peça para a pessoa pensar no mês (1 a 12). Mostre as 5 cartas novamente e peça que marque todas as que contêm o mês. Some os números-chave das cartas marcadas — o resultado é o mês.</p></li><li><strong>Revelação</strong><p>Mostre o dia e o mês descobertos.</p></li></ol><div class="actions"><button class="button" data-action="voltar-regras" type="button">Voltar</button></div></section>`;
  app.querySelector('[data-action="voltar-regras"]').addEventListener("click", render);
}

function render() {
  if (fase === "intro") return renderIntro();
  if (fase === "dia") return renderCartas("dia", "Descubra o dia", "Peça para pensar num dia de 1 a 31 e marque as cartas que contêm esse dia.", "Descobrir o dia");
  if (fase === "mes") return renderCartas("mes", "Descubra o mês", "Agora peça para pensar no mês (1 a 12) e marque as cartas que contêm esse mês.", "Descobrir o mês");
  if (fase === "revelacao") return renderRevelacao();
}
})();
