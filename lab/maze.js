/* 迷宫：递归回溯生成 + BFS / A* 对比寻路。零依赖。 */
(function () {
  'use strict';

  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const CANVAS = 1000;
  const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const genBtn = document.getElementById('genBtn');
  const solveBtn = document.getElementById('solveBtn');
  const sVisited = document.getElementById('sVisited');
  const sSteps = document.getElementById('sSteps');
  const bfsCount = document.getElementById('bfsCount');
  const astarCount = document.getElementById('astarCount');
  const savedEl = document.getElementById('saved');
  const sizeBtns = Array.prototype.slice.call(document.querySelectorAll('[data-size]'));

  let n = 21;
  let maze = null;
  let base = null;
  let bfsRes = null;
  let astarRes = null;
  let raf = 0;
  let cell = CANVAS / n;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function generate(size) {
    n = size;
    cell = CANVAS / n;
    const m = Array.from({ length: n }, function () {
      return new Array(n).fill(1);
    });
    const stack = [[1, 1]];
    m[1][1] = 0;
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const r = cur[0], c = cur[1];
      let advanced = false;
      const dirs = shuffle(DIRS.slice());
      for (let i = 0; i < dirs.length; i++) {
        const nr = r + dirs[i][0] * 2;
        const nc = c + dirs[i][1] * 2;
        if (nr > 0 && nr < n - 1 && nc > 0 && nc < n - 1 && m[nr][nc] === 1) {
          m[r + dirs[i][0]][c + dirs[i][1]] = 0;
          m[nr][nc] = 0;
          stack.push([nr, nc]);
          advanced = true;
          break;
        }
      }
      if (!advanced) stack.pop();
    }
    // 随机打通少量内墙，制造回路：回路越多，A* 靠启发式省下的格子越明显
    const holes = Math.round(n * n * 0.05);
    for (let i = 0; i < holes; i++) {
      const r = 1 + Math.floor(Math.random() * (n - 2));
      const c = 1 + Math.floor(Math.random() * (n - 2));
      if (m[r][c] === 1) m[r][c] = 0;
    }
    maze = m;
    bfsRes = null;
    astarRes = null;
    buildBase();
    clearStats();
    render(0, 0, 0);
  }

  function buildBase() {
    base = document.createElement('canvas');
    base.width = CANVAS;
    base.height = CANVAS;
    const b = base.getContext('2d');
    b.fillStyle = '#0d0e10';
    b.fillRect(0, 0, CANVAS, CANVAS);
    b.fillStyle = '#2a2b31';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (maze[r][c] === 1) {
          b.fillRect(Math.floor(c * cell), Math.floor(r * cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
    b.fillStyle = '#3fbf7f';
    b.fillRect(1 * cell + cell * 0.18, 1 * cell + cell * 0.18, cell * 0.64, cell * 0.64);
    b.fillStyle = '#ff8a5c';
    b.fillRect((n - 2) * cell + cell * 0.18, (n - 2) * cell + cell * 0.18, cell * 0.64, cell * 0.64);
  }

  function clearStats() {
    sVisited.textContent = '—';
    sSteps.textContent = '—';
    bfsCount.textContent = '—';
    astarCount.textContent = '—';
    savedEl.textContent = '—';
  }

  function neighbors(r, c) {
    const out = [];
    for (let i = 0; i < DIRS.length; i++) {
      const nr = r + DIRS[i][0];
      const nc = c + DIRS[i][1];
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && maze[nr][nc] === 0) {
        out.push([nr, nc]);
      }
    }
    return out;
  }

  function trace(prev, goalKey) {
    const path = [];
    let k = goalKey;
    while (k !== undefined && k !== null) {
      path.push([Math.floor(k / n), k % n]);
      k = prev.has(k) ? prev.get(k) : null;
    }
    return path.reverse();
  }

  function bfs() {
    const start = [1, 1];
    const goal = [n - 2, n - 2];
    const startKey = start[0] * n + start[1];
    const goalKey = goal[0] * n + goal[1];
    const q = [start];
    const prev = new Map([[startKey, null]]);
    const order = [];
    let head = 0;
    while (head < q.length) {
      const cur = q[head++];
      const key = cur[0] * n + cur[1];
      order.push(key);
      if (key === goalKey) break;
      const nb = neighbors(cur[0], cur[1]);
      for (let i = 0; i < nb.length; i++) {
        const k = nb[i][0] * n + nb[i][1];
        if (!prev.has(k)) {
          prev.set(k, key);
          q.push(nb[i]);
        }
      }
    }
    return { order: order, path: trace(prev, goalKey) };
  }

  function astar() {
    const start = [1, 1];
    const goal = [n - 2, n - 2];
    const goalKey = goal[0] * n + goal[1];
    const h = function (r, c) {
      return Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
    };
    const startKey = start[0] * n + start[1];
    const open = [{ f: h(start[0], start[1]), g: 0, p: start }];
    const gScore = new Map([[startKey, 0]]);
    const prev = new Map([[startKey, null]]);
    const seen = new Set();
    const order = [];

    while (open.length) {
      open.sort(function (a, b) { return a.f - b.f; });
      const node = open.shift();
      const cur = node.p;
      const key = cur[0] * n + cur[1];
      if (seen.has(key)) continue;
      seen.add(key);
      order.push(key);
      if (key === goalKey) break;

      const nb = neighbors(cur[0], cur[1]);
      for (let i = 0; i < nb.length; i++) {
        const nr = nb[i][0];
        const nc = nb[i][1];
        const k = nr * n + nc;
        if (seen.has(k)) continue;
        const tentative = node.g + 1;
        if (!gScore.has(k) || tentative < gScore.get(k)) {
          gScore.set(k, tentative);
          prev.set(k, key);
          open.push({ f: tentative + h(nr, nc), g: tentative, p: [nr, nc] });
        }
      }
    }
    return { order: order, path: trace(prev, goalKey) };
  }

  function render(shownB, shownA, shownPath) {
    ctx.clearRect(0, 0, CANVAS, CANVAS);
    if (base) ctx.drawImage(base, 0, 0);

    if (bfsRes) {
      ctx.fillStyle = 'rgba(78,140,255,.30)';
      for (let i = 0; i < shownB; i++) {
        const k = bfsRes.order[i];
        ctx.fillRect((k % n) * cell, Math.floor(k / n) * cell, cell, cell);
      }
    }
    if (astarRes) {
      ctx.fillStyle = 'rgba(212,175,87,.42)';
      for (let i = 0; i < shownA; i++) {
        const k = astarRes.order[i];
        ctx.fillRect((k % n) * cell, Math.floor(k / n) * cell, cell, cell);
      }
    }

    if (shownPath > 0 && astarRes) {
      const path = astarRes.path;
      ctx.strokeStyle = '#fff6de';
      ctx.lineWidth = Math.max(1.5, cell * 0.18);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < shownPath && i < path.length; i++) {
        const x = path[i][1] * cell + cell / 2;
        const y = path[i][0] * cell + cell / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function solve() {
    if (!maze) return;
    cancelAnimationFrame(raf);
    bfsRes = bfs();
    astarRes = astar();

    bfsCount.textContent = bfsRes.order.length;
    astarCount.textContent = astarRes.order.length;
    const diff = bfsRes.order.length - astarRes.order.length;
    savedEl.textContent = diff > 0 ? '−' + diff + ' 格' : '0 格';
    sVisited.textContent = Math.min(bfsRes.order.length, astarRes.order.length);
    sSteps.textContent = astarRes.path.length ? astarRes.path.length - 1 : '—';

    const total = Math.max(bfsRes.order.length, astarRes.order.length);
    const step = Math.max(1, Math.ceil(total / 70));
    const pathStep = Math.max(1, Math.ceil(astarRes.path.length / 40));
    let fb = 0, fa = 0, fp = 0;

    function frame() {
      if (fb < bfsRes.order.length || fa < astarRes.order.length) {
        fb = Math.min(fb + step, bfsRes.order.length);
        fa = Math.min(fa + step, astarRes.order.length);
        render(fb, fa, 0);
        raf = requestAnimationFrame(frame);
      } else if (fp < astarRes.path.length) {
        fp = Math.min(fp + pathStep, astarRes.path.length);
        render(fb, fa, fp);
        raf = requestAnimationFrame(frame);
      }
    }
    frame();
  }

  genBtn.addEventListener('click', function () {
    cancelAnimationFrame(raf);
    generate(n);
  });

  solveBtn.addEventListener('click', solve);

  sizeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const size = Number(btn.dataset.size);
      sizeBtns.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      cancelAnimationFrame(raf);
      generate(size);
    });
  });

  generate(21);
})();
