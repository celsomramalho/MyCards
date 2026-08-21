window.Cartas = window.Cartas || {};
Cartas.games = Cartas.games || {};
(function () {
  var app;
  var styleLink;
  var voltarCtx;

  var GRID_SIZE = 4;
  var TOTAL_PIECES = GRID_SIZE * GRID_SIZE;
  var IMAGE_URL = "games/puzzle/assets/puzzle1.png";

  var pieces = [];
  var shuffled = false;
  var gameOver = false;
  var time = 0;
  var moves = 0;
  var score = 0;
  var timerInterval = null;
  var hasUsedSwap = false;
  var swapMode = false;
  var selectedPieces = [];
  var showOriginal = false;
  var showCongrats = false;
  var showSwapConfirm = false;

  var ICONS = {
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3 4 7l4 4"></path><path d="M4 7h16"></path><path d="m16 21 4-4-4-4"></path><path d="M20 17H4"></path></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  };

  Cartas.games["puzzle"] = {
    id: "puzzle",
    nome: "Puzzle",
    mount(container, ctx) {
      app = container;
      voltarCtx = ctx.voltar;
      if (!styleLink) {
        styleLink = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = "games/puzzle/styles.css";
        styleLink.dataset.gameStyles = "puzzle";
        document.head.appendChild(styleLink);
      }
      resetState();
      render();
    },
    unmount() {
      pararTimer();
      if (app) app.innerHTML = "";
      app = null;
      styleLink?.remove();
      styleLink = null;
    },
  };

  function resetState() {
    pieces = [];
    for (var i = 0; i < TOTAL_PIECES; i++) {
      var row = Math.floor(i / GRID_SIZE);
      var col = i % GRID_SIZE;
      pieces.push({ id: i, x: col, y: row, originalX: col, originalY: row });
    }
    shuffled = false;
    gameOver = false;
    time = 0;
    moves = 0;
    score = 0;
    hasUsedSwap = false;
    swapMode = false;
    selectedPieces = [];
    showOriginal = false;
    showCongrats = false;
    showSwapConfirm = false;
    pararTimer();
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function pararTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function iniciarTimer() {
    pararTimer();
    timerInterval = setInterval(function () {
      time += 1;
      atualizarStats();
    }, 1000);
  }

  function getPieceAt(list, x, y) {
    return list.find(function (p) { return p.x === x && p.y === y; });
  }

  function shufflePieces() {
    var working = pieces.map(function (p) { return { id: p.id, x: p.originalX, y: p.originalY, originalX: p.originalX, originalY: p.originalY }; });
    var blank = working.find(function (p) { return p.id === TOTAL_PIECES - 1; });
    var lastDx = 0, lastDy = 0;
    var SHUFFLE_MOVES = TOTAL_PIECES * 40;

    for (var i = 0; i < SHUFFLE_MOVES; i++) {
      var candidates = [];
      if (blank.x > 0) candidates.push({ dx: -1, dy: 0 });
      if (blank.x < GRID_SIZE - 1) candidates.push({ dx: 1, dy: 0 });
      if (blank.y > 0) candidates.push({ dx: 0, dy: -1 });
      if (blank.y < GRID_SIZE - 1) candidates.push({ dx: 0, dy: 1 });
      var filtered = candidates.filter(function (c) { return !(c.dx === -lastDx && c.dy === -lastDy); });
      var options = filtered.length > 0 ? filtered : candidates;
      var move = options[Math.floor(Math.random() * options.length)];
      var targetX = blank.x + move.dx;
      var targetY = blank.y + move.dy;
      var neighbor = getPieceAt(working, targetX, targetY);
      neighbor.x = blank.x; neighbor.y = blank.y;
      blank.x = targetX; blank.y = targetY;
      lastDx = move.dx; lastDy = move.dy;
    }

    pieces = working;
    shuffled = true;
    time = 0;
    moves = 0;
    gameOver = false;
    hasUsedSwap = false;
    swapMode = false;
    selectedPieces = [];
    iniciarTimer();
    render();
  }

  function isSolved() {
    return pieces.every(function (p) { return p.x === p.originalX && p.y === p.originalY; });
  }

  function checarVitoria() {
    if (shuffled && isSolved()) {
      pararTimer();
      gameOver = true;
      score = Math.max(0, 10000 - time * 10 - moves * 5);
      showCongrats = true;
      shuffled = false;
    }
  }

  function handlePieceClick(clicked) {
    if (!shuffled || gameOver) return;

    if (swapMode) {
      var jaSelecionada = selectedPieces.some(function (p) { return p.id === clicked.id; });
      if (jaSelecionada) {
        selectedPieces = selectedPieces.filter(function (p) { return p.id !== clicked.id; });
      } else if (selectedPieces.length < 2) {
        if (selectedPieces.length === 1 && clicked.y !== selectedPieces[0].y) {
          alert("A segunda peça deve estar na mesma linha da primeira.");
          return;
        }
        selectedPieces = selectedPieces.concat([clicked]);
      }
      render();
      return;
    }

    var newPieces = pieces.map(function (p) { return Object.assign({}, p); });
    var targetEmptyX = clicked.x, targetEmptyY = clicked.y;
    var emptyPiece = newPieces.find(function (p) { return p.id === TOTAL_PIECES - 1; });
    var clickedPiece = newPieces.find(function (p) { return p.id === clicked.id; });
    if (!emptyPiece || !clickedPiece) return;

    var moved = false;

    if (clickedPiece.y === emptyPiece.y) {
      var dir = clickedPiece.x < emptyPiece.x ? 1 : -1;
      var toSlide = newPieces.filter(function (p) {
        return p.y === clickedPiece.y && (
          (dir === 1 && p.x >= clickedPiece.x && p.x < emptyPiece.x) ||
          (dir === -1 && p.x <= clickedPiece.x && p.x > emptyPiece.x)
        );
      });
      toSlide.forEach(function (p) { p.x += dir; });
      emptyPiece.x = targetEmptyX;
      moved = true;
    } else if (clickedPiece.x === emptyPiece.x) {
      var dirY = clickedPiece.y < emptyPiece.y ? 1 : -1;
      var toSlideY = newPieces.filter(function (p) {
        return p.x === clickedPiece.x && (
          (dirY === 1 && p.y >= clickedPiece.y && p.y < emptyPiece.y) ||
          (dirY === -1 && p.y <= clickedPiece.y && p.y > emptyPiece.y)
        );
      });
      toSlideY.forEach(function (p) { p.y += dirY; });
      emptyPiece.y = targetEmptyY;
      moved = true;
    }

    if (moved) {
      pieces = newPieces;
      moves += 1;
      checarVitoria();
      render();
    }
  }

  function confirmarSwap() {
    if (selectedPieces.length !== 2) return;
    var p1 = selectedPieces[0], p2 = selectedPieces[1];
    pieces = pieces.map(function (p) {
      if (p.id === p1.id) return Object.assign({}, p, { x: p2.x, y: p2.y });
      if (p.id === p2.id) return Object.assign({}, p, { x: p1.x, y: p1.y });
      return p;
    });
    moves += 1;
    hasUsedSwap = true;
    selectedPieces = [];
    swapMode = false;
    showSwapConfirm = false;
    checarVitoria();
    render();
  }

  function cancelarSwap() {
    selectedPieces = [];
    swapMode = false;
    showSwapConfirm = false;
    render();
  }

  function posPercent(v) { return GRID_SIZE > 1 ? (v / (GRID_SIZE - 1)) * 100 : 0; }

  function renderPeca(p) {
    var isBlank = p.id === TOTAL_PIECES - 1;
    var isSelected = selectedPieces.some(function (s) { return s.id === p.id; });
    var classes = ["pz-piece"];
    if (isBlank) classes.push("pz-blank");
    else if (shuffled && !gameOver) classes.push("pz-clickable");
    if (isSelected) classes.push("pz-selected");
    var style = "grid-column:" + (p.x + 1) + ";grid-row:" + (p.y + 1) + ";";
    if (!isBlank) {
      style += "background-image:url('" + IMAGE_URL + "');background-position:" + posPercent(p.originalX) + "% " + posPercent(p.originalY) + "%;";
    }
    return '<div class="' + classes.join(" ") + '" style="' + style + '" data-piece="' + p.id + '"></div>';
  }

  function atualizarStats() {
    var el = app && app.querySelector(".pz-stats");
    if (el) {
      el.innerHTML = '<span>Tempo: ' + formatTime(time) + '</span><span>Movimentos: ' + moves + '</span>' +
        (gameOver ? '<span class="pz-score">Pontuação: ' + score + '</span>' : "");
    }
  }

  function render() {
    var swapBtnConteudo = ICONS.swap;
    var swapDisabled = !shuffled || gameOver || hasUsedSwap;
    if (swapMode) {
      swapBtnConteudo = selectedPieces.length < 2 ? "Escolha 2 peças" : "Trocar";
    }

    app.innerHTML = '' +
      '<div class="pz-wrap">' +
        '<h2>Jogo de quebra-cabeça (' + GRID_SIZE + 'x' + GRID_SIZE + ')</h2>' +
        '<div class="pz-stats">' +
          '<span>Tempo: ' + formatTime(time) + '</span>' +
          '<span>Movimentos: ' + moves + '</span>' +
          (gameOver ? '<span class="pz-score">Pontuação: ' + score + '</span>' : '') +
        '</div>' +
        '<div class="pz-board-outer"><div class="pz-board">' + pieces.map(renderPeca).join("") + '</div></div>' +
        '<div class="pz-actions">' +
          '<button class="pz-btn pz-btn-play" data-action="play" type="button" ' + (shuffled || gameOver ? "disabled" : "") + ' aria-label="Embaralhar">' + ICONS.play + '</button>' +
          '<button class="pz-btn pz-btn-swap ' + (swapMode ? "pz-active" : "") + '" data-action="swap" type="button" ' + (swapDisabled ? "disabled" : "") + ' aria-label="Trocar peças">' + swapBtnConteudo + '</button>' +
          '<button class="pz-btn pz-btn-eye" data-action="eye" type="button" aria-label="Ver imagem original">' + ICONS.eye + '</button>' +
          '<button class="pz-btn pz-btn-home" data-action="home" type="button" aria-label="Voltar">' + ICONS.home + '</button>' +
        '</div>' +
      '</div>' +
      (showCongrats ? renderCongratsModal() : "") +
      (showOriginal ? renderImagemModal() : "") +
      (showSwapConfirm ? renderSwapModal() : "");

    app.querySelectorAll("[data-piece]").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = Number(el.dataset.piece);
        var piece = pieces.find(function (p) { return p.id === id; });
        if (piece) handlePieceClick(piece);
      });
    });

    var btnPlay = app.querySelector('[data-action="play"]');
    if (btnPlay) btnPlay.addEventListener("click", shufflePieces);

    var btnSwap = app.querySelector('[data-action="swap"]');
    if (btnSwap) btnSwap.addEventListener("click", function () {
      if (!shuffled || gameOver || hasUsedSwap) return;
      if (swapMode) {
        if (selectedPieces.length === 2) { showSwapConfirm = true; render(); }
        else { cancelarSwap(); }
      } else {
        swapMode = true;
        selectedPieces = [];
        render();
      }
    });

    var btnEye = app.querySelector('[data-action="eye"]');
    if (btnEye) btnEye.addEventListener("click", function () { showOriginal = true; render(); });

    var btnHome = app.querySelector('[data-action="home"]');
    if (btnHome) btnHome.addEventListener("click", function () { pararTimer(); voltarCtx(); });

    if (showCongrats) {
      var btnDeNovo = app.querySelector('[data-action="jogar-de-novo"]');
      if (btnDeNovo) btnDeNovo.addEventListener("click", function () { showCongrats = false; resetState(); shufflePieces(); });
      var btnVoltarInicio = app.querySelector('[data-action="voltar-inicio"]');
      if (btnVoltarInicio) btnVoltarInicio.addEventListener("click", function () { showCongrats = false; pararTimer(); voltarCtx(); });
    }

    if (showOriginal) {
      var btnFecharImg = app.querySelector('[data-action="fechar-imagem"]');
      if (btnFecharImg) btnFecharImg.addEventListener("click", function () { showOriginal = false; render(); });
    }

    if (showSwapConfirm) {
      var btnConfirmarSwap = app.querySelector('[data-action="confirmar-swap"]');
      if (btnConfirmarSwap) btnConfirmarSwap.addEventListener("click", confirmarSwap);
      var btnCancelarSwap = app.querySelector('[data-action="cancelar-swap"]');
      if (btnCancelarSwap) btnCancelarSwap.addEventListener("click", cancelarSwap);
    }
  }

  function renderCongratsModal() {
    return '' +
      '<div class="pz-modal-overlay">' +
        '<div class="pz-modal">' +
          '<h2>Parabéns!</h2>' +
          '<p>Você resolveu o quebra-cabeça em <strong>' + formatTime(time) + '</strong> com <strong>' + moves + '</strong> movimentos.</p>' +
          '<p class="pz-final-score">Pontuação final: ' + score + '</p>' +
          '<div class="pz-modal-actions">' +
            '<button class="pz-btn pz-btn-play" data-action="jogar-de-novo" type="button">Jogar novamente</button>' +
            '<button class="pz-btn pz-btn-home" data-action="voltar-inicio" type="button">Voltar para o início</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderImagemModal() {
    return '' +
      '<div class="pz-modal-overlay">' +
        '<div class="pz-modal pz-image-modal">' +
          '<button class="pz-close" data-action="fechar-imagem" type="button" aria-label="Fechar">✕</button>' +
          '<img src="' + IMAGE_URL + '" alt="Quebra-cabeça original">' +
        '</div>' +
      '</div>';
  }

  function renderSwapModal() {
    return '' +
      '<div class="pz-modal-overlay">' +
        '<div class="pz-modal">' +
          '<h2>Confirmar troca de peças?</h2>' +
          '<p>Você selecionou duas peças para trocar de posição. Deseja confirmar esta ação?</p>' +
          '<div class="pz-modal-actions">' +
            '<button class="pz-btn pz-btn-play" data-action="confirmar-swap" type="button">Confirmar</button>' +
            '<button class="pz-btn pz-btn-home" data-action="cancelar-swap" type="button">Cancelar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
})();
