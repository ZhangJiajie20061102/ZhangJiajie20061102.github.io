/* 考研决策台 · 逻辑层
 * 不依赖任何库：图表用 SVG 手绘，数据只存 localStorage。
 */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var KY = window.KY;

  /* ---------- 通用 ---------- */
  function fmt(n, d) {
    if (!isFinite(n)) return '—';
    var p = Math.pow(10, d == null ? 1 : d);
    return String(Math.round(n * p) / p);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* 隐私模式下降级为不持久 */ }
    return null;
  }

  /* ---------- 页签 ---------- */
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () {
      $$('.tab').forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
      $$('.panel').forEach(function (p) { p.classList.toggle('on', p.id === t.dataset.tab); });
    });
  });

  /* ---------- 倒计时 ---------- */
  function tick() {
    var start = new Date(KY.meta.examStart).getTime();
    var end = new Date(KY.meta.examEnd).getTime();
    var now = Date.now();
    var numEl = $('#cdNum'), textEl = $('#cdText');
    if (now < start) {
      var days = Math.ceil((start - now) / 86400000);
      numEl.innerHTML = days + '<small>天</small>';
      textEl.textContent = '距 2027 考研初试';
    } else if (now <= end) {
      numEl.innerHTML = '进行中';
      textEl.textContent = '初试正在进行，稳住节奏';
    } else {
      numEl.innerHTML = '已结束';
      textEl.textContent = '2027 初试已结束，注意查分与复试安排';
    }
  }
  tick();
  setInterval(tick, 60000);

  /* ---------- 时间轴 ---------- */
  (function renderTimeline() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var html = KY.timeline.map(function (ev) {
      var d = new Date(ev.date + 'T00:00:00+08:00');
      var diff = Math.round((d - today) / 86400000);
      var cls = ev.state || '';
      // 以真实日期覆盖手工标记的"现在"，避免数据过期后还写着"当前"
      if (diff < 0) cls = 'done';
      else if (diff <= 21 && !ev.key) cls = 'now';
      if (ev.key) cls += ' key';
      var tag = '';
      if (ev.est) tag = '<span class="badge-est">预计</span>';
      else if (cls.indexOf('now') > -1) tag = '<span class="badge-now">当前</span>';
      return '<li class="' + cls.trim() + '">' +
        '<span class="tl-date">' + ev.date.slice(5).replace('-', '.') + '</span>' +
        '<span class="tl-label">' + esc(ev.label) + tag + '</span>' +
        '<div class="tl-note">' + esc(ev.note) + '</div>' +
      '</li>';
    }).join('');
    $('#tlList').innerHTML = html;
  })();

  /* ---------- 国家线 ---------- */
  var lineState = { year: 2026, zone: 'a', score: null, filter: '' };

  function pick(id, year, zone) {
    var arr = KY.lines[year] && KY.lines[year][id];
    if (!arr) return null;
    return zone === 'a' ? arr.slice(0, 3) : arr.slice(3, 6);
  }

  function renderLines() {
    var y = lineState.year;
    var other = y === 2026 ? 2025 : 2026;
    var zone = lineState.zone;
    var q = lineState.filter.trim();
    var score = lineState.score;

    $('#lineHead').innerHTML =
      '<tr>' +
        '<th>学科门类 / 专业学位</th>' +
        '<th>总分</th>' +
        '<th>单科<br>满分 100</th>' +
        '<th>单科<br>满分 &gt;100</th>' +
        '<th>较 ' + other + '</th>' +
        (score != null ? '<th>我的差值</th>' : '') +
      '</tr>';

    var body = KY.rows.filter(function (r) {
      if (!q) return true;
      return (r.label + r.group).toLowerCase().indexOf(q.toLowerCase()) > -1;
    }).map(function (r) {
      var cur = pick(r.id, y, zone);
      if (!cur) return '';
      var prev = pick(r.id, other, zone);
      var d = prev ? cur[0] - prev[0] : null;
      var dTxt = d == null ? '—'
        : (d > 0 ? '<span class="delta up">+' + d + '</span>'
        : d < 0 ? '<span class="delta down">' + d + '</span>'
        : '<span class="delta flat">0</span>');
      var cav = KY.caveats[r.id] ? '<span class="cav" title="' + esc(KY.caveats[r.id]) + '">ⓘ</span>' : '';
      var mine = '';
      if (score != null) {
        var gap = score - cur[0];
        mine = '<td class="num ' + (gap >= 0 ? 'down' : 'up') + '">' +
          (gap >= 0 ? '+' : '') + gap + '</td>';
      }
      return '<tr>' +
        '<td>' + esc(r.label) + cav + '</td>' +
        '<td class="num" style="color:var(--gold);font-weight:600">' + cur[0] + '</td>' +
        '<td class="num">' + cur[1] + '</td>' +
        '<td class="num">' + cur[2] + '</td>' +
        '<td>' + dTxt + '</td>' +
        mine +
      '</tr>';
    }).join('');

    $('#lineBody').innerHTML = body || '<tr><td colspan="6" class="empty">没有匹配的门类</td></tr>';

    var cavIds = Object.keys(KY.caveats).filter(function (id) {
      return KY.rows.some(function (r) { return r.id === id; });
    });
    $('#caveatNote').innerHTML =
      '<b>口径提示</b>：2025 与 2026 年的部分专业学位合并/拆分方式不同，跨年比较时注意：<br>' +
      cavIds.map(function (id) {
        var row = KY.rows.filter(function (r) { return r.id === id; })[0];
        return '· ' + esc(row.label) + '：' + esc(KY.caveats[id]);
      }).join('<br>');
  }

  $('#yearSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    lineState.year = Number(b.dataset.year);
    $$('#yearSeg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    renderLines();
  });
  $('#zoneSeg').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    lineState.zone = b.dataset.zone;
    $$('#zoneSeg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    renderLines();
  });
  $('#myScore').addEventListener('input', function (e) {
    var v = e.target.value === '' ? null : Number(e.target.value);
    lineState.score = (v != null && isFinite(v)) ? v : null;
    renderLines();
  });
  $('#lineFilter').addEventListener('input', function (e) {
    lineState.filter = e.target.value;
    renderLines();
  });
  renderLines();

  /* ---------- 统计 ---------- */
  function parseScores(text) {
    var m = String(text).match(/\d+(?:\.\d+)?/g) || [];
    return m.map(Number).filter(function (n) { return n >= 100 && n <= 500; });
  }

  function quantile(sorted, p) {
    if (!sorted.length) return NaN;
    var idx = (sorted.length - 1) * p;
    var lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  function describe(raw) {
    var s = raw.slice().sort(function (a, b) { return a - b; });
    var n = s.length;
    var sum = s.reduce(function (a, b) { return a + b; }, 0);
    var mean = n ? sum / n : NaN;
    var sd = 0;
    if (n > 1) {
      var ss = s.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0);
      sd = Math.sqrt(ss / (n - 1));
    }
    return {
      sorted: s, n: n, sum: sum, mean: mean, sd: sd,
      min: s[0], max: s[n - 1],
      median: quantile(s, 0.5),
      q1: quantile(s, 0.25),
      q3: quantile(s, 0.75),
      p10: quantile(s, 0.1),
      p90: quantile(s, 0.9)
    };
  }

  function tierOf(z) {
    if (z == null) return { key: 'unknown', cls: 'tier-reach', label: '数据不足' };
    if (z >= 1.5) return { key: 'safe', cls: 'tier-safe', label: '保底' };
    if (z >= 0.8) return { key: 'fit', cls: 'tier-fit', label: '稳妥' };
    if (z >= 0) return { key: 'edge', cls: 'tier-reach', label: '擦线' };
    return { key: 'risk', cls: 'tier-risk', label: '冲刺' };
  }

  /* ---------- 箱线图 ---------- */
  function drawChart(st, avail) {
    var W = Math.max(300, Math.min(660, Math.round(avail || 660)));
    var H = 150, L = 26, R = 26;
    var lo = st.min - (st.max - st.min || 20) * 0.12;
    var hi = st.max + (st.max - st.min || 20) * 0.12;
    var x = function (v) { return L + (v - lo) / (hi - lo) * (W - L - R); };

    var axisY = 96, boxY = 58, boxH = 30, capY = 66;
    var parts = [];
    parts.push('<line class="ax" x1="' + L + '" y1="' + axisY + '" x2="' + (W - R) + '" y2="' + axisY + '"/>');
    // 须线
    parts.push('<line class="whisk" x1="' + x(st.min) + '" y1="' + capY + '" x2="' + x(st.max) + '" y2="' + capY + '"/>');
    parts.push('<line class="whisk" x1="' + x(st.min) + '" y1="' + (capY - 7) + '" x2="' + x(st.min) + '" y2="' + (capY + 7) + '"/>');
    parts.push('<line class="whisk" x1="' + x(st.max) + '" y1="' + (capY - 7) + '" x2="' + x(st.max) + '" y2="' + (capY + 7) + '"/>');
    // 四分位箱
    parts.push('<rect class="iqr" x="' + x(st.q1) + '" y="' + boxY + '" width="' + Math.max(1, x(st.q3) - x(st.q1)) + '" height="' + boxH + '" rx="2"/>');
    // 中位数
    parts.push('<line class="med" x1="' + x(st.median) + '" y1="' + boxY + '" x2="' + x(st.median) + '" y2="' + (boxY + boxH) + '"/>');
    // 样本点：全部画在基线上，越密说明分数越集中
    st.sorted.forEach(function (v) {
      parts.push('<circle class="dot" cx="' + fmt(x(v), 1) + '" cy="' + (axisY + 12) + '" r="1.7"/>');
    });
    // 你的分数
    if (st.you != null) {
      var mx = x(st.you), my = boxY - 16;
      parts.push('<line class="tick" x1="' + mx + '" y1="' + (my + 6) + '" x2="' + mx + '" y2="' + axisY + '"/>');
      parts.push('<path class="you" d="M' + mx + ' ' + (my + 7) + ' l6 -8 l-12 0 z"/>');
      parts.push('<text x="' + mx + '" y="' + (my - 4) + '" text-anchor="middle" fill="#d4af57" style="font-size:11px">你 ' + fmt(st.you, 0) + '</text>');
    }
    // 刻度
    [[st.min, '最低'], [st.median, '中位'], [st.max, '最高']].forEach(function (p) {
      parts.push('<line class="tick" x1="' + x(p[0]) + '" y1="' + axisY + '" x2="' + x(p[0]) + '" y2="' + (axisY + 5) + '"/>');
      parts.push('<text x="' + x(p[0]) + '" y="' + (axisY + 24) + '" text-anchor="middle">' + fmt(p[0], 0) + '</text>');
      parts.push('<text x="' + x(p[0]) + '" y="' + (axisY + 37) + '" text-anchor="middle" style="opacity:.7">' + p[1] + '</text>');
    });

    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="录取分数分布箱线图">' +
      parts.join('') + '</svg>';
  }

  /* ---------- 分析 ---------- */
  var lastResult = null;

  function analyze() {
    var raw = parseScores($('#distInput').value);
    var box = $('#distResult');
    if (!raw.length) {
      box.innerHTML = '<div class="empty">没读到有效分数。请粘贴 100—500 之间的数字，空格或换行分隔都可以。</div>';
      lastResult = null;
      return;
    }
    var st = describe(raw);
    var score = $('#distScore').value === '' ? null : Number($('#distScore').value);
    var quota = $('#distQuota').value === '' ? null : Number($('#distQuota').value);
    var name = $('#targetName').value.trim();

    var above = null, pct = null, z = null, rank = null;
    if (score != null && isFinite(score)) {
      var less = st.sorted.filter(function (v) { return v < score; }).length;
      var more = st.sorted.filter(function (v) { return v > score; }).length;
      above = more;
      pct = (less / st.n) * 100;
      rank = more + 1;
      if (st.sd > 0) z = (score - st.mean) / st.sd;
    }

    var tier = tierOf(z);
    var verdictCls, mark, title, sub;
    if (z == null) {
      verdictCls = 'v-empty'; mark = '?';
      title = '还没填分数';
      sub = '在上面的「我的分数」填一个数，就会算出分位和安全边际。';
    } else if (z >= 1.5) {
      verdictCls = 'v-very-stable'; mark = '▮';
      title = '保底区间';
      sub = '比样本均值高 ' + fmt(z, 2) + ' 个标准差，样本里只有 ' + above + ' 人高于你。';
    } else if (z >= 0.8) {
      verdictCls = 'v-stable'; mark = '▮';
      title = '稳妥区间';
      sub = '高于均值 ' + fmt(z, 2) + ' 个标准差，属于录取区间靠前的位置。';
    } else if (z >= 0) {
      verdictCls = 'v-edge'; mark = '▯';
      title = '擦线区间';
      sub = '略高于均值，上方还有 ' + above + ' 人，复试与调剂要同步准备。';
    } else if (z >= -0.8) {
      verdictCls = 'v-risky'; mark = '▯';
      title = '偏险';
      sub = '低于样本均值 ' + fmt(Math.abs(z), 2) + ' 个标准差，上方 ' + above + ' 人。';
    } else {
      verdictCls = 'v-high'; mark = '✕';
      title = '高风险';
      sub = '低于均值 ' + fmt(Math.abs(z), 2) + ' 个标准差，建议要么换目标，要么把分数再提 ' +
            fmt(st.median - score + 5, 0) + ' 分以上。';
    }

    var quotaLine = '';
    if (quota && rank != null) {
      var ok = rank <= quota;
      quotaLine = '<div class="stat"><div class="stat-k">按名额估算名次</div>' +
        '<div class="stat-v" style="color:' + (ok ? 'var(--ok)' : 'var(--bad)') + '">' + rank + '/' + quota + '</div></div>';
    }

    st.you = (score != null && isFinite(score)) ? score : null;

    box.innerHTML =
      '<div class="verdict ' + verdictCls + '" style="margin-bottom:16px">' +
        '<div class="v-mark">' + mark + '</div>' +
        '<div><div class="v-title">' + title + '</div><div class="v-sub">' + sub + '</div></div>' +
      '</div>' +

      '<div class="stats" style="margin-bottom:16px">' +
        '<div class="stat"><div class="stat-k">样本数</div><div class="stat-v">' + st.n + '<small>人</small></div></div>' +
        '<div class="stat"><div class="stat-k">均值</div><div class="stat-v">' + fmt(st.mean, 1) + '</div></div>' +
        '<div class="stat"><div class="stat-k">中位数</div><div class="stat-v">' + fmt(st.median, 1) + '</div></div>' +
        '<div class="stat"><div class="stat-k">标准差</div><div class="stat-v">' + fmt(st.sd, 1) + '</div></div>' +
        '<div class="stat"><div class="stat-k">最高 / 最低</div><div class="stat-v" style="font-size:15px">' + fmt(st.max, 0) + ' / ' + fmt(st.min, 0) + '</div></div>' +
        (pct != null ? '<div class="stat"><div class="stat-k">你的分位</div><div class="stat-v">' + fmt(pct, 1) + '<small>%</small></div></div>' : '') +
        quotaLine +
      '</div>' +

      '<div class="card" id="chartWrap" style="padding:14px 16px 6px">' +
        '<div class="sec-hint" style="margin:0 0 2px">分布箱线图 · 连线为最低—最高，箱体为中间 50% 的人，白线是中位数</div>' +
      '</div>' +

      '<p class="note" style="margin-top:14px">' +
        '在 ' + st.n + ' 个样本里，你的分数 <b>' + (score != null ? fmt(score, 0) : '—') + '</b> ' +
        '高于 <b>' + (pct != null ? fmt(pct, 1) + '%' : '—') + '</b> 的人' +
        (above != null ? '，上方还剩 <b>' + above + '</b> 人' : '') + '。' +
        '四分位区间是 ' + fmt(st.q1, 0) + '—' + fmt(st.q3, 0) + ' 分。' +
        (z != null ? ' z = ' + fmt(z, 2) + '。' : '') +
      '</p>';

    // 容器插入后再量宽度，窄屏时才不会把图挤成一条
    var wrap = $('#chartWrap');
    if (wrap) wrap.insertAdjacentHTML('beforeend', drawChart(st, wrap.clientWidth - 34));

    lastResult = {
      name: name || '未命名目标',
      score: score, quota: quota,
      n: st.n, mean: st.mean, sd: st.sd, median: st.median,
      pct: pct, above: above, z: z, tier: tier.key, tierLabel: tier.label,
      at: new Date().toISOString()
    };
  }

  $('#btnAnalyze').addEventListener('click', analyze);
  ['distScore', 'distQuota', 'targetName'].forEach(function (id) {
    $('#' + id).addEventListener('input', function () { if (lastResult) analyze(); });
  });
  $('#distInput').addEventListener('input', function () { if (lastResult) analyze(); });

  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (lastResult) analyze(); }, 180);
  });

  $('#btnSample').addEventListener('click', function () {
    // 演示用样本：模拟某专业 40 人拟录取名单，分数带一点真实感的重叠
    var base = [402, 398, 396, 393, 391, 390, 388, 386, 385, 384,
                383, 381, 380, 379, 377, 376, 375, 373, 372, 371,
                370, 368, 367, 366, 365, 363, 362, 360, 359, 358,
                356, 355, 353, 352, 350, 348, 346, 344, 341, 337];
    $('#distInput').value = base.join(' ');
    $('#targetName').value = '示例 · 某专业拟录取 40 人';
    $('#distScore').value = 376;
    $('#distQuota').value = 30;
    lastResult = null;
    analyze();
  });

  $('#btnClearDist').addEventListener('click', function () {
    $('#distInput').value = '';
    $('#distScore').value = '';
    $('#distQuota').value = '';
    $('#distResult').innerHTML = '';
    lastResult = null;
  });

  /* ---------- 目标池 ---------- */
  var GOAL_KEY = 'ky_goals_v1';
  var goals = store(GOAL_KEY) || [];

  function renderGoals() {
    var list = $('#goalList');
    if (!goals.length) {
      list.innerHTML = '<div class="empty">还没有目标。去「分数分布」粘一份名单，点「存为目标」。</div>';
    } else {
      var order = { safe: 0, fit: 1, edge: 2, risk: 3, unknown: 4 };
      var sorted = goals.map(function (g, i) { return { g: g, i: i }; }).sort(function (a, b) {
        var d = order[a.g.tier] - order[b.g.tier];
        return d !== 0 ? d : (b.g.z || -9) - (a.g.z || -9);
      });
      list.innerHTML = sorted.map(function (item) {
        var g = item.g, t = tierOf(g.z);
        return '<div class="goal-row">' +
          '<div class="goal-name">' + esc(g.name) +
            '<small>' + g.n + ' 个样本 · 中位 ' + fmt(g.median, 0) + ' · 均值 ' + fmt(g.mean, 1) + '</small>' +
          '</div>' +
          '<span class="tag-tier ' + t.cls + '">' + t.label + '</span>' +
          '<span class="goal-z hide-sm">分位 ' + (g.pct != null ? fmt(g.pct, 1) + '%' : '—') + '</span>' +
          '<span class="goal-z">z ' + (g.z != null ? fmt(g.z, 2) : '—') + '</span>' +
          '<button class="btn sm ghost" data-del="' + item.i + '" style="color:var(--faint)">删</button>' +
        '</div>';
      }).join('');
      $$('#goalList button[data-del]').forEach(function (b) {
        b.addEventListener('click', function () {
          goals.splice(Number(b.dataset.del), 1);
          store(GOAL_KEY, goals);
          renderGoals();
        });
      });
    }
    $('#goalCount').textContent = goals.length ? ('共 ' + goals.length + ' 个目标') : '';
  }

  $('#btnSaveGoal').addEventListener('click', function () {
    if (!lastResult) {
      alert('先在「我的分数」填一个数并分析，才有可保存的结果。');
      return;
    }
    goals.push(lastResult);
    store(GOAL_KEY, goals);
    renderGoals();
    var btn = $('#btnSaveGoal');
    btn.textContent = '已保存 ✓';
    setTimeout(function () { btn.textContent = '存为目标'; }, 1400);
  });

  $('#btnClearGoals').addEventListener('click', function () {
    if (!goals.length) return;
    if (!confirm('清空目标池？此操作不可撤销。')) return;
    goals = [];
    store(GOAL_KEY, goals);
    renderGoals();
  });

  $('#btnExport').addEventListener('click', function () {
    if (!goals.length) { alert('目标池是空的。'); return; }
    var blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), goals: goals }, null, 2)],
      { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kaoyan-goals.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  renderGoals();

  /* ---------- 页脚 ---------- */
  $('#footMeta').innerHTML =
    '数据更新于 ' + KY.meta.updated + ' · 2026 年报名人数 ' + KY.meta.applicants2026 + ' 万 · ' +
    '国家线为 A / B 区总分与单科要求，来源见下';
  $('#footSrc').innerHTML = '官方来源：' + KY.sources.map(function (s) {
    return '<a href="' + s.url + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>';
  }).join(' · ');
})();
