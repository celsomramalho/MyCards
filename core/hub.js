import { hasState } from "./storage.js";
import { escapeHtml } from "./utils.js";

export function renderHub(container, registry, navigate) {
  const cards = registry.map(game => {
    const emAndamento = hasState(game.id);
    return `<button class="game-card" data-jogo="${escapeHtml(game.id)}" type="button">
      <span class="game-icon">${game.icone}</span>
      <span class="game-info">
        <strong>${escapeHtml(game.nome)}</strong>
        <span class="muted">${escapeHtml(game.descricao)}</span>
      </span>
      ${emAndamento ? '<span class="pill">Em andamento</span>' : ""}
    </button>`;
  }).join("");
  container.innerHTML = `<section class="card narrow"><p class="eyebrow">Jogos de cartas</p><h2>Escolha um jogo</h2><p class="muted">Cada jogo salva o próprio progresso neste dispositivo.</p><div class="game-list">${cards}</div></section>`;
  container.querySelectorAll("[data-jogo]").forEach(button => button.addEventListener("click", () => navigate(`#/jogo/${button.dataset.jogo}`)));
}
