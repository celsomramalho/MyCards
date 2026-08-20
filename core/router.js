window.Cartas = window.Cartas || {};
Cartas.startRouter = function () {
  var app = document.querySelector("#app");
  var hubButton = document.querySelector("#hubButton");
  var rulesButton = document.querySelector("#rulesButton");
  var globalResetButton = document.querySelector("#globalResetButton");
  var currentGame = null;

  function navigate(hash) { location.hash = hash; }

  function unmountCurrent() {
    if (currentGame && currentGame.unmount) currentGame.unmount();
    currentGame = null;
    rulesButton.classList.add("hidden");
    globalResetButton.classList.add("hidden");
  }

  function route() {
    var hash = location.hash || "#/";
    var match = hash.match(/^#\/jogo\/(.+)$/);
    if (!match) {
      unmountCurrent();
      hubButton.classList.add("hidden");
      Cartas.renderHub(app, Cartas.registry, navigate);
      return;
    }
    var jogoId = decodeURIComponent(match[1]);
    var entry = Cartas.registry.find(function (g) { return g.id === jogoId; });
    if (!entry) { location.hash = "#/"; return; }
    unmountCurrent();
    hubButton.classList.remove("hidden");
    var game = Cartas.games[jogoId];
    if (!game) { location.hash = "#/"; return; }
    currentGame = game;
    game.mount(app, {
      storage: Cartas.storage.createStorage(jogoId),
      escapeHtml: Cartas.escapeHtml,
      uid: Cartas.uid,
      voltar: function () { navigate("#/"); },
      rulesButton: rulesButton,
      globalResetButton: globalResetButton
    });
  }

  hubButton.addEventListener("click", function () { navigate("#/"); });
  window.addEventListener("hashchange", route);
  route();
};
