window.Cartas = window.Cartas || {};
Cartas.renderHub = function (container, registry, navigate) {
  var cards = registry.map(function (game) {
    var emAndamento = Cartas.storage.hasState(game.id);
    return '<button class="game-card" data-jogo="' + Cartas.escapeHtml(game.id) + '" type="button">' +
      '<span class="game-icon">' + game.icone + '</span>' +
      '<span class="game-info"><strong>' + Cartas.escapeHtml(game.nome) + '</strong>' +
      '<span class="muted">' + Cartas.escapeHtml(game.descricao) + '</span></span>' +
      (emAndamento ? '<span class="pill">Em andamento</span>' : "") +
      "</button>";
  }).join("");
  container.innerHTML = '<section class="card narrow"><p class="eyebrow">Jogos de cartas</p><h2>Escolha um jogo</h2><p class="muted">Cada jogo salva o próprio progresso neste dispositivo.</p><div class="game-list">' + cards + "</div></section>";
  container.querySelectorAll("[data-jogo]").forEach(function (button) {
    button.addEventListener("click", function () { navigate("#/jogo/" + button.dataset.jogo); });
  });
};
