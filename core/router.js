import registry from "../registry.js";
import { renderHub } from "./hub.js";
import { createStorage } from "./storage.js";
import { escapeHtml, uid } from "./utils.js";

const app = document.querySelector("#app");
const hubButton = document.querySelector("#hubButton");
const rulesButton = document.querySelector("#rulesButton");
const globalResetButton = document.querySelector("#globalResetButton");

let currentGame = null;

function navigate(hash) { location.hash = hash; }

async function unmountCurrent() {
  if (currentGame?.unmount) currentGame.unmount();
  currentGame = null;
  rulesButton.classList.add("hidden");
  globalResetButton.classList.add("hidden");
}

async function route() {
  const hash = location.hash || "#/";
  const match = hash.match(/^#\/jogo\/(.+)$/);
  if (!match) {
    await unmountCurrent();
    hubButton.classList.add("hidden");
    renderHub(app, registry, navigate);
    return;
  }
  const jogoId = decodeURIComponent(match[1]);
  const entry = registry.find(game => game.id === jogoId);
  if (!entry) { location.hash = "#/"; return; }
  await unmountCurrent();
  hubButton.classList.remove("hidden");
  const module = await import(entry.modulo);
  currentGame = module.default;
  currentGame.mount(app, {
    storage: createStorage(jogoId),
    escapeHtml,
    uid,
    voltar: () => navigate("#/"),
    rulesButton,
    globalResetButton,
  });
}

hubButton.addEventListener("click", () => navigate("#/"));
window.addEventListener("hashchange", route);

export function startRouter() { route(); }
