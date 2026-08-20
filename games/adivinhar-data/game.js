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
let fase = "dia";
let dia = null;
let mes = null;
let ano = null;
let marcadas = [false, false, false, false, false];
let marcadasDia = [false, false, false, false, false];
let marcadasMes = [false, false, false, false, false];
let marcadasAno = [false, false, false, false, false];
let ordem = [0, 1, 2, 3, 4];

function embaralharOrdem() {
  ordem = [0, 1, 2, 3, 4];
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
}

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
    fase = "dia"; dia = null; mes = null; ano = null; marcadas = [false, false, false, false, false]; marcadasDia = [false, false, false, false, false]; marcadasMes = [false, false, false, false, false]; marcadasAno = [false, false, false, false, false];
    embaralharOrdem();
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

function renderCartas(rodada, titulo, instrucao, botao, mostrarVoltar, faseVoltar, marcadasVoltar) {
  const marcadasCount = marcadas.filter(Boolean).length;
  const botaoVoltar = mostrarVoltar ? `<button class="button ghost" data-action="voltar" type="button">Voltar</button>` : "";
  // Na rodada do mês (1 a 12), a Carta 1 (chave 16) nunca é necessária: nenhum
  // dos seus números é <= 12. Exibi-la só confunde e permite marcações
  // impossíveis (mês > 12), que resultam em "?" na revelação. Por isso ela
  // é ocultada nessa rodada.
  const ordemVisivel = rodada === "mes" ? ordem.filter(i => CARTAS[i].numeros.some(n => n <= 12)) : ordem;
  app.innerHTML = `<section class="card"><p class="eyebrow">Adivinhar data</p><h2>${titulo}</h2><p class="muted">${instrucao}</p><p class="hint">Toque nas cartas que contêm o número para marcá-las.${marcadasCount ? ` ${marcadasCount} carta${marcadasCount === 1 ? "" : "s"} marcada${marcadasCount === 1 ? "" : "s"}.` : ""}</p><div class="ad-cards">${ordemVisivel.map(i => renderCarta(CARTAS[i], i)).join("")}</div><div class="actions">${botaoVoltar}<button class="button" data-action="descobrir" type="button" ${marcadasCount ? "" : "disabled"}>${botao}</button></div></section>`;
  app.querySelectorAll("[data-carta]").forEach(card => card.addEventListener("click", () => { const i = Number(card.dataset.carta); marcadas[i] = !marcadas[i]; render(); }));
  if (mostrarVoltar) {
    app.querySelector('[data-action="voltar"]').addEventListener("click", () => {
      if (rodada === "mes") marcadasMes = marcadas.slice();
      else if (rodada === "ano") marcadasAno = marcadas.slice();
      fase = faseVoltar;
      marcadas = marcadasVoltar.slice();
      render();
    });
  }
  app.querySelector('[data-action="descobrir"]').addEventListener("click", () => {
    const resultado = somaChaves();
    if (rodada === "dia") { dia = resultado; marcadasDia = marcadas.slice(); fase = "mes"; marcadas = marcadasMes.slice(); embaralharOrdem(); render(); }
    else if (rodada === "mes") { mes = resultado; marcadasMes = marcadas.slice(); fase = "ano"; marcadas = marcadasAno.slice(); embaralharOrdem(); render(); }
    else { ano = resultado; marcadasAno = marcadas.slice(); fase = "revelacao"; render(); }
  });
}

function renderRevelacao() {
  const nomeMes = MESES[mes - 1] || "?";
  const anoCompleto = 2000 + ano;
  app.innerHTML = `<section class="card narrow"><p class="eyebrow">Adivinhar data</p><h2>Data descoberta!</h2><p class="notice success">A data pensada foi <strong>${dia} de ${escapeHtml(nomeMes)} de ${anoCompleto}</strong>.</p><p class="hint">Se a data pensada não for essa, volte e reveja suas cartas marcadas.</p><div class="actions"><button class="button" data-action="de-novo" type="button">Jogar de novo</button><button class="button ghost" data-action="voltar" type="button">Voltar</button></div></section>`;
  app.querySelector('[data-action="de-novo"]').addEventListener("click", () => { fase = "dia"; dia = null; mes = null; ano = null; marcadas = [false, false, false, false, false]; marcadasDia = [false, false, false, false, false]; marcadasMes = [false, false, false, false, false]; marcadasAno = [false, false, false, false, false]; embaralharOrdem(); render(); });
  app.querySelector('[data-action="voltar"]').addEventListener("click", () => { fase = "ano"; render(); });
}

function mostrarRegras() {
  app.innerHTML = `<section class="card rules-card"><p class="eyebrow">Regras do jogo</p><h2>Adivinhar data</h2><ol class="rules-list"><li><strong>Objetivo</strong><p>Descobrir o dia, o mês e o ano de uma data que alguém pensou, usando 5 cartas com 16 números cada. Então peça para a pessoa pensar em uma data qualquer entre o ano 2001 até 2031.</p></li><li><strong>Rodada do dia</strong><p>Peça para a pessoa pensar num dia de 1 a 31. Mostre as 5 cartas e peça que marque todas as que contêm o dia. Uma vez marcada todas as cartas clicar no botão Avançar.</p></li><li><strong>Rodada do mês</strong><p>Peça para a pessoa pensar no mês (1 a 12). Mostre as 5 cartas novamente e peça que marque todas as que contêm o mês. Uma vez marcada todas as cartas clicar no botão Avançar.</p></li><li><strong>Rodada do ano</strong><p>Peça para a pessoa pensar num ano entre 2001 e 2031, usando apenas os 2 últimos dígitos (1 a 31). Mostre as 5 cartas novamente e peça que marque todas as que contêm esse número. Uma vez marcada todas as cartas clicar no botão Mostrar a data.</p></li><li><strong>Revelação</strong><p>Mostre o dia, o mês e o ano descobertos.</p><p class="hint">Obs: Se a data pensada não for essa, volte e reveja suas cartas marcadas.</p></li></ol><div class="actions"><button class="button" data-action="voltar-regras" type="button">Voltar</button></div></section>`;
  app.querySelector('[data-action="voltar-regras"]').addEventListener("click", render);
}

function render() {
  if (fase === "dia") return renderCartas("dia", "Etapa: Dia", "Pense em uma data entre 2001 e 2031.<br>Agora marque todas as cartas que contêm o dia.", "Avançar");
  if (fase === "mes") return renderCartas("mes", "Etapa: Mês", "Agora marque todas as cartas que contêm o mês", "Avançar", true, "dia", marcadasDia);
  if (fase === "ano") return renderCartas("ano", "Etapa: Ano", "Agora marque todas as cartas que contêm o ano, lembrando que o intervalo é do ano 1 ao ano 31", "Mostrar a data", true, "mes", marcadasMes);
  if (fase === "revelacao") return renderRevelacao();
}
})();
