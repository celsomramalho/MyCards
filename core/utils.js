window.Cartas = window.Cartas || {};
Cartas.escapeHtml = function (value) {
  return String(value).replace(/[&<>'"]/g, function (char) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]; });
};
Cartas.uid = function () { return Date.now() + "-" + Math.random().toString(36).slice(2, 8); };
