// As 5 cartas do truque. O primeiro número de cada carta é sempre uma
// potência de 2 (16, 2, 8, 1, 4): somando o primeiro número das cartas
// em que o valor escolhido aparece, chegamos ao próprio valor (base binária).
const CARDS = [
  [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
  [2, 22, 18, 23, 14, 7, 6, 19, 31, 10, 3, 30, 11, 27, 15, 26],
  [8, 31, 15, 28, 25, 10, 30, 29, 26, 14, 12, 24, 13, 9, 27, 11],
  [1, 5, 9, 31, 7, 29, 23, 21, 25, 11, 27, 17, 15, 3, 13, 19],
  [4, 13, 12, 5, 23, 21, 15, 14, 7, 31, 22, 20, 28, 6, 29, 30],
];

const MONTH_NAMES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const app = document.querySelector("#app");

function freshState() {
  return { screen: "intro", round1: new Set(), round2: new Set(), day: 0, month: 0, order1: null, order2: null };
}
let state = freshState();

function shuffledOrder() {
  const order = CARDS.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function cardHtml(card, index, selectedSet) {
  const selected = selectedSet.has(index);
  const cells = card.map(number => `<div class="cell">${number}</div>`).join("");
  return `<button type="button" class="date-card ${selected ? "selected" : ""}" data-card="${index}">
    <p class="card-label">Carta ${index + 1}</p>
    <div class="card-grid">${cells}</div>
  </button>`;
}

function renderIntro() {
  app.innerHTML = `
    <section class="card narrow">
      <p class="eyebrow">Truque de adivinhação</p>
      <h2>Pense em uma data</h2>
      <p class="muted">Pense em uma data (dia e mês) sem me contar qual é. Depois toque em "Começar" e vá marcando, carta por carta, se o número escolhido aparece nela.</p>
      <div class="home-actions">
        <button class="button" data-action="start" type="button">Começar</button>
      </div>
    </section>`;
  app.querySelector('[data-action="start"]').addEventListener("click", () => {
    state = { ...freshState(), screen: "round1" };
    render();
  });
}

function renderRound(isDay) {
  const selected = isDay ? state.round1 : state.round2;
  const label = isDay ? "dia" : "mês";
  const orderKey = isDay ? "order1" : "order2";
  if (!state[orderKey]) state[orderKey] = shuffledOrder();
  const order = state[orderKey];
  app.innerHTML = `
    <section class="card">
      <p class="eyebrow">Passo ${isDay ? "1" : "2"} de 2</p>
      <h2>Pense no ${label.toUpperCase()} da data</h2>
      <p class="hint">Toque em todas as cartas onde o ${label} que você escolheu aparece.</p>
      <div class="cards-grid">${order.map(index => cardHtml(CARDS[index], index, selected)).join("")}</div>
      <div class="actions">
        <button class="button" data-action="calc" type="button" ${selected.size === 0 ? "disabled" : ""}>Próximo</button>
      </div>
    </section>`;

  const nextButton = app.querySelector('[data-action="calc"]');

  app.querySelectorAll("[data-card]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.card);
      if (selected.has(index)) selected.delete(index);
      else selected.add(index);
      button.classList.toggle("selected");
      nextButton.disabled = selected.size === 0;
    });
  });

  nextButton.addEventListener("click", () => {
    const sum = [...selected].reduce((total, index) => total + CARDS[index][0], 0);
    if (isDay) {
      state.day = sum;
      state.screen = "round2";
    } else {
      state.month = sum;
      state.screen = "result";
    }
    render();
  });
}

function renderResult() {
  const monthName = MONTH_NAMES[state.month - 1] || `mês ${state.month}`;
  const valid = state.day >= 1 && state.day <= 31 && state.month >= 1 && state.month <= 12;
  app.innerHTML = `
    <section class="card narrow">
      <p class="eyebrow">Resultado</p>
      <h2>A data pensada é...</h2>
      <p class="result-date">${state.day} de ${monthName}</p>
      ${!valid ? `<p class="notice error">Os números não formaram uma data válida. Confira se todas as cartas certas foram marcadas e tente de novo.</p>` : ""}
      <div class="actions">
        <button class="button" data-action="again" type="button">Jogar de novo</button>
      </div>
    </section>`;
  app.querySelector('[data-action="again"]').addEventListener("click", () => {
    state = freshState();
    render();
  });
}

function render() {
  if (state.screen === "intro") return renderIntro();
  if (state.screen === "round1") return renderRound(true);
  if (state.screen === "round2") return renderRound(false);
  return renderResult();
}

render();
