export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}
export function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
