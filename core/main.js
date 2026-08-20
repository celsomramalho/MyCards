window.Cartas = window.Cartas || {};
(function () {
  var installButton = document.querySelector("#installButton");
  var deferredInstall;
  window.addEventListener("beforeinstallprompt", function (event) { event.preventDefault(); deferredInstall = event; installButton.classList.remove("hidden"); });
  installButton.addEventListener("click", async function () { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; installButton.classList.add("hidden"); });
  if ("serviceWorker" in navigator) window.addEventListener("load", async function () { try { var registration = await navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }); await registration.update(); } catch (e) {} });
  Cartas.startRouter();
})();
