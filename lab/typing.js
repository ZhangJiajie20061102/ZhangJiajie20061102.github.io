/* 打字速度测试：逐字符判定 + 实时 WPM。零依赖。 */
(function () {
  'use strict';

  const LINES = [
    'the quiet hum of a machine that is finally doing what you asked it to do',
    'a good interface disappears, and what is left is only the work itself',
    'we kept the code small on purpose, because small code is easier to trust',
    'the bug was not in the logic but in the assumption behind the logic',
    'measure first, then optimize, otherwise you are just guessing faster',
    'every feature you add is a promise you have to keep supporting later',
    'the best way to learn a system is to break it on purpose and watch',
    'simple rules applied consistently beat clever rules applied sometimes',
    'a test that never fails is usually a test that never checks anything',
    'ship the smallest version that someone can actually use today'
  ];

  const DURATION = 60;

  const textEl = document.getElementById('text');
  const inputEl = document.getElementById('input');
  const stageEl = document.getElementById('stage');
  const startBtn = document.getElementById('startBtn');
  const againBtn = document.getElementById('againBtn');
  const tipEl = document.getElementById('tip');
  const resultEl = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const sTime = document.getElementById('sTime');
  const sWpm = document.getElementById('sWpm');
  const sAcc = document.getElementById('sAcc');
  const bestEl = document.getElementById('best');

  let target = '';
  let started = false;
  let finished = false;
  let startedAt = 0;
  let ticker = null;
  let best = Number(localStorage.getItem('lab.typing.best')) || 0;

  bestEl.textContent = best ? best + ' WPM' : '—';

  function pickText() {
    const pool = LINES.slice();
    const picked = [];
    while (picked.length < 3 && pool.length) {
      picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return picked.join(' ');
  }

  function render() {
    const typed = inputEl.value;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < target.length; i++) {
      const span = document.createElement('span');
      span.textContent = target[i];
      if (i < typed.length) {
        span.className = typed[i] === target[i] ? 'ok' : 'bad';
      } else if (i === typed.length && !finished) {
        span.className = 'cur';
      }
      frag.appendChild(span);
    }
    textEl.textContent = '';
    textEl.appendChild(frag);
  }

  function stats() {
    const elapsed = Math.min((Date.now() - startedAt) / 1000, DURATION);
    const typed = inputEl.value;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++;
    }
    const minutes = Math.max(elapsed, 3) / 60;
    const wpm = started ? Math.round(correct / 5 / minutes) : 0;
    const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    return { elapsed, wpm, acc, correct, typed: typed.length };
  }

  function paintStats() {
    const s = stats();
    sTime.textContent = Math.max(0, Math.ceil(DURATION - s.elapsed));
    sWpm.textContent = s.wpm;
    sAcc.textContent = s.acc + '%';
  }

  function tick() {
    const s = stats();
    paintStats();
    if (s.elapsed >= DURATION) finish();
  }

  function reset() {
    clearInterval(ticker);
    ticker = null;
    target = pickText();
    started = false;
    finished = false;
    startedAt = 0;
    inputEl.value = '';
    inputEl.disabled = false;
    resultEl.classList.remove('show');
    tipEl.textContent = '等待开始';
    sTime.textContent = DURATION;
    sWpm.textContent = '0';
    sAcc.textContent = '100%';
    render();
  }

  function start() {
    reset();
    inputEl.focus();
    tipEl.textContent = '开始输入…';
    stageEl.classList.add('flash');
    setTimeout(() => stageEl.classList.remove('flash'), 400);
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(ticker);
    ticker = null;
    inputEl.blur();
    const s = stats();
    const wpm = s.wpm;
    let extra = '';
    if (wpm > best) {
      best = wpm;
      localStorage.setItem('lab.typing.best', String(best));
      bestEl.textContent = best + ' WPM';
      extra = ' · 新纪录';
    }
    resultText.innerHTML =
      '本局 <b>' + wpm + ' WPM</b> · 准确率 <b>' + s.acc + '%</b>' +
      ' · 正确字符 ' + s.correct + ' / ' + s.typed + extra;
    resultEl.classList.add('show');
    tipEl.textContent = '已结束';
    paintStats();
    render();
  }

  inputEl.addEventListener('input', function () {
    if (finished) return;
    if (!started && inputEl.value.length > 0) {
      started = true;
      startedAt = Date.now();
      ticker = setInterval(tick, 100);
      tipEl.textContent = '计时中…';
    }
    render();
    paintStats();
    if (inputEl.value.length >= target.length) {
      finish();
    }
  });

  stageEl.addEventListener('click', function () {
    if (!finished) inputEl.focus();
  });

  startBtn.addEventListener('click', start);
  againBtn.addEventListener('click', start);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') return;
    if (!finished && document.activeElement !== inputEl && e.key.length === 1) {
      inputEl.focus();
    }
  });

  reset();
})();
