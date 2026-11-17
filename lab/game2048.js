/* 2048：滑动合并 + 一步撤销。零依赖。 */
(function () {
  'use strict';

  const SIZE = 4;
  const board = document.getElementById('board');
  const overlay = document.getElementById('overlay');
  const ovTitle = document.getElementById('ovTitle');
  const ovText = document.getElementById('ovText');
  const ovBtn = document.getElementById('ovBtn');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const undoBtn = document.getElementById('undoBtn');
  const newBtn = document.getElementById('newBtn');

  let grid = [];
  let score = 0;
  let best = Number(localStorage.getItem('lab.2048.best')) || 0;
  let over = false;
  let won = false;
  let history = null;

  bestEl.textContent = best;

  function emptyGrid() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  }

  function buildCells() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const d = document.createElement('div');
        d.className = 'cell';
        d.style.setProperty('--r', r);
        d.style.setProperty('--c', c);
        board.appendChild(d);
      }
    }
  }

  function makeTile(v, r, c, animate) {
    const el = document.createElement('div');
    el.className = 'tile' + (animate ? ' pop' : '');
    el.dataset.v = v;
    el.textContent = v;
    el.style.setProperty('--r', r);
    el.style.setProperty('--c', c);
    if (String(v).length > 3) el.classList.add('big');
    board.appendChild(el);
    return { el: el, v: v, r: r, c: c, merged: false };
  }

  function clearTiles() {
    board.querySelectorAll('.tile').forEach(function (el) { el.remove(); });
  }

  function addRandom() {
    const spots = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (!grid[r][c]) spots.push([r, c]);
      }
    }
    if (!spots.length) return;
    const pick = spots[Math.floor(Math.random() * spots.length)];
    const v = Math.random() < 0.9 ? 2 : 4;
    grid[pick[0]][pick[1]] = makeTile(v, pick[0], pick[1], true);
  }

  function updateScore(add) {
    score += add;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem('lab.2048.best', String(best));
    }
  }

  function linesFor(dir) {
    const out = [];
    for (let i = 0; i < SIZE; i++) {
      const line = [];
      for (let j = 0; j < SIZE; j++) {
        let r, c;
        if (dir === 'left') { r = i; c = j; }
        else if (dir === 'right') { r = i; c = SIZE - 1 - j; }
        else if (dir === 'up') { r = j; c = i; }
        else { r = SIZE - 1 - j; c = i; }
        line.push([r, c]);
      }
      out.push(line);
    }
    return out;
  }

  function snapshot() {
    const cells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c]) cells.push([grid[r][c].v, r, c]);
      }
    }
    return { cells: cells, score: score, over: over };
  }

  function restore(snap) {
    clearTiles();
    grid = emptyGrid();
    score = snap.score;
    scoreEl.textContent = score;
    over = false;
    won = false;
    overlay.classList.remove('show');
    snap.cells.forEach(function (item) {
      const t = makeTile(item[0], item[1], item[2], false);
      grid[item[1]][item[2]] = t;
    });
    history = null;
    undoBtn.disabled = true;
  }

  function move(dir) {
    if (over) return;
    const old = snapshot();

    grid.forEach(function (row) {
      row.forEach(function (t) { if (t) t.merged = false; });
    });

    const next = emptyGrid();
    let gained = 0;
    let moved = false;

    linesFor(dir).forEach(function (line) {
      const tiles = line.map(function (rc) { return grid[rc[0]][rc[1]]; })
        .filter(Boolean);
      let pos = 0;
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        if (i + 1 < tiles.length && tiles[i + 1].v === t.v && !t.merged) {
          const other = tiles[i + 1];
          other.merged = true;
          other.el.classList.add('gone');
          const victim = other.el;
          setTimeout(function () { victim.remove(); }, 180);
          t.v *= 2;
          t.merged = true;
          gained += t.v;
          i++;
        }
        const target = line[pos];
        if (t.r !== target[0] || t.c !== target[1]) moved = true;
        next[target[0]][target[1]] = t;
        t.r = target[0];
        t.c = target[1];
        t.el.style.setProperty('--r', t.r);
        t.el.style.setProperty('--c', t.c);
        if (t.el.textContent !== String(t.v)) {
          t.el.textContent = t.v;
          t.el.dataset.v = t.v;
          t.el.classList.toggle('big', String(t.v).length > 3);
          t.el.classList.remove('pop');
          void t.el.offsetWidth;
          t.el.classList.add('pop');
        }
        pos++;
      }
    });

    if (!moved) return;

    grid = next;
    if (gained) updateScore(gained);
    history = old;
    undoBtn.disabled = false;

    addRandom();

    if (!won) {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          if (grid[r][c] && grid[r][c].v === 2048) {
            won = true;
            showOverlay('达成 2048', '还能继续往上叠', '继续玩');
          }
        }
      }
    }

    if (!canMove()) {
      over = true;
      showOverlay('没有可走的步了', '本局 ' + score + ' 分', '再来一局');
    }
  }

  function canMove() {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const t = grid[r][c];
        if (!t) return true;
        if (c + 1 < SIZE && grid[r][c + 1] && grid[r][c + 1].v === t.v) return true;
        if (r + 1 < SIZE && grid[r + 1][c] && grid[r + 1][c].v === t.v) return true;
      }
    }
    return false;
  }

  function showOverlay(title, text, btnText) {
    ovTitle.textContent = title;
    ovText.textContent = text;
    ovBtn.textContent = btnText;
    overlay.classList.add('show');
  }

  function newGame() {
    clearTiles();
    grid = emptyGrid();
    score = 0;
    over = false;
    won = false;
    history = null;
    scoreEl.textContent = '0';
    undoBtn.disabled = true;
    overlay.classList.remove('show');
    addRandom();
    addRandom();
    board.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const map = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      a: 'left', d: 'right', w: 'up', s: 'down',
      A: 'left', D: 'right', W: 'up', S: 'down'
    };
    const dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    move(dir);
  });

  let touchX = 0, touchY = 0, touching = false;
  board.addEventListener('touchstart', function (e) {
    const t = e.changedTouches[0];
    touchX = t.clientX;
    touchY = t.clientY;
    touching = true;
  }, { passive: true });

  board.addEventListener('touchend', function (e) {
    if (!touching) return;
    touching = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
    else move(dy > 0 ? 'down' : 'up');
  }, { passive: true });

  undoBtn.addEventListener('click', function () {
    if (!history) return;
    restore(history);
  });

  newBtn.addEventListener('click', newGame);
  ovBtn.addEventListener('click', function () {
    if (over) newGame();
    else overlay.classList.remove('show');
  });

  buildCells();
  newGame();
  document.addEventListener('click', function () { board.focus(); }, { once: true });
})();
