window.Cartas = window.Cartas || {};
(function () {
  var key = function (jogoId) { return "games:" + jogoId + ":state"; };
  Cartas.storage = {
    loadState: function (jogoId) { try { return JSON.parse(localStorage.getItem(key(jogoId)) || "null"); } catch (e) { return null; } },
    saveState: function (jogoId, state) { localStorage.setItem(key(jogoId), JSON.stringify(state)); },
    clearState: function (jogoId) { localStorage.removeItem(key(jogoId)); },
    hasState: function (jogoId) { return localStorage.getItem(key(jogoId)) !== null; },
    createStorage: function (jogoId) {
      return {
        load: function () { return Cartas.storage.loadState(jogoId); },
        save: function (state) { Cartas.storage.saveState(jogoId, state); },
        clear: function () { Cartas.storage.clearState(jogoId); },
        has: function () { return Cartas.storage.hasState(jogoId); }
      };
    }
  };
})();
