const key = jogoId => `games:${jogoId}:state`;

export function loadState(jogoId) { try { return JSON.parse(localStorage.getItem(key(jogoId)) || "null"); } catch { return null; } }
export function saveState(jogoId, state) { localStorage.setItem(key(jogoId), JSON.stringify(state)); }
export function clearState(jogoId) { localStorage.removeItem(key(jogoId)); }
export function hasState(jogoId) { return localStorage.getItem(key(jogoId)) !== null; }

export function createStorage(jogoId) {
  return {
    load: () => loadState(jogoId),
    save: state => saveState(jogoId, state),
    clear: () => clearState(jogoId),
    has: () => hasState(jogoId),
  };
}
