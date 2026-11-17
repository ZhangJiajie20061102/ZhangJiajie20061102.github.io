/* 考研决策台 · 数据层
 * 所有数字均来自教育部 / 中国研究生招生信息网公开文件，见 meta.sources。
 * 结构说明：
 *   lines[年份][门类id] = [A区总分, A区单科(满分100), A区单科(满分>100),
 *                          B区总分, B区单科(满分100), B区单科(满分>100)]
 */
window.KY = (function () {
  var rows = [
    { id: 'philosophy',  label: '哲学',                group: '学术学位', kind: 'academic' },
    { id: 'economics',   label: '经济学',              group: '学术学位', kind: 'academic' },
    { id: 'law',         label: '法学',                group: '学术学位', kind: 'academic' },
    { id: 'edu_sport',   label: '教育学 · 体育学 / 体育', group: '教育学',   kind: 'mixed' },
    { id: 'edu_normal',  label: '教育学 · 教育 / 国际中文教育', group: '教育学', kind: 'mixed' },
    { id: 'edu_other',   label: '教育学 · 其他学科专业', group: '教育学',   kind: 'mixed' },
    { id: 'literature',  label: '文学',                group: '学术学位', kind: 'academic' },
    { id: 'history',     label: '历史学',              group: '学术学位', kind: 'academic' },
    { id: 'science',     label: '理学',                group: '学术学位', kind: 'academic' },
    { id: 'eng_care',    label: '工学 · 照顾专业',      group: '工学',     kind: 'academic' },
    { id: 'eng_other',   label: '工学 · 其他学科专业',   group: '工学',     kind: 'academic' },
    { id: 'agri',        label: '农学',                group: '学术学位', kind: 'academic' },
    { id: 'medicine',    label: '医学',                group: '学术学位', kind: 'academic' },
    { id: 'military',    label: '军事学',              group: '学术学位', kind: 'academic' },
    { id: 'mba',         label: '管理学 · 工商管理 1251', group: '管理学',  kind: 'professional' },
    { id: 'mpa',         label: '管理学 · 公共管理 1252', group: '管理学',  kind: 'professional' },
    { id: 'mpacc',       label: '管理学 · 会计 / 图书情报 / 审计', group: '管理学', kind: 'professional' },
    { id: 'mta',         label: '管理学 · 旅游管理 1254', group: '管理学', kind: 'professional' },
    { id: 'mem',         label: '管理学 · 工程管理 1256', group: '管理学', kind: 'professional' },
    { id: 'mgmt_other',  label: '管理学 · 其他学科专业', group: '管理学',  kind: 'academic' },
    { id: 'art',         label: '艺术学',              group: '学术学位', kind: 'academic' },
    { id: 'interdisc',   label: '交叉学科',            group: '学术学位', kind: 'academic' }
  ];

  var lines = {
    2026: {
      philosophy: [326, 41, 62, 316, 38, 57],
      economics:  [324, 40, 60, 314, 37, 56],
      law:        [321, 40, 60, 311, 37, 56],
      edu_sport:  [310, 38, 114, 300, 35, 105],
      edu_normal: [347, 48, 72, 337, 45, 68],
      edu_other:  [347, 48, 144, 337, 45, 135],
      literature: [354, 48, 72, 344, 45, 68],
      history:    [341, 45, 135, 331, 42, 126],
      science:    [275, 35, 53, 265, 32, 48],
      eng_care:   [251, 33, 50, 241, 30, 45],
      eng_other:  [264, 35, 53, 254, 32, 48],
      agri:       [240, 33, 50, 230, 30, 45],
      medicine:   [294, 36, 108, 284, 33, 99],
      military:   [260, 34, 51, 250, 31, 47],
      mba:        [146, 35, 70, 136, 30, 60],
      mpa:        [168, 39, 78, 158, 34, 68],
      mpacc:      [199, 51, 102, 189, 46, 92],
      mta:        [151, 35, 70, 141, 30, 60],
      mem:        [166, 39, 78, 156, 34, 68],
      mgmt_other: [332, 41, 62, 322, 38, 57],
      art:        [354, 38, 57, 344, 35, 53],
      interdisc:  [266, 35, 53, 256, 32, 48]
    },
    2025: {
      philosophy: [321, 39, 59, 311, 36, 54],
      economics:  [323, 40, 60, 313, 37, 56],
      law:        [323, 40, 60, 313, 37, 56],
      edu_sport:  [304, 36, 108, 294, 33, 99],
      edu_normal: [341, 45, 68, 331, 42, 63],
      edu_other:  [341, 45, 135, 331, 42, 126],
      literature: [351, 47, 71, 341, 44, 66],
      history:    [336, 43, 129, 326, 40, 120],
      science:    [274, 34, 51, 264, 31, 47],
      eng_care:   [251, 33, 50, 241, 30, 45],
      eng_other:  [260, 34, 51, 250, 31, 47],
      agri:       [245, 33, 50, 235, 30, 45],
      medicine:   [293, 36, 108, 283, 33, 99],
      military:   [260, 34, 51, 250, 31, 47],
      mba:        [151, 35, 70, 141, 30, 60],
      mpa:        [164, 38, 76, 154, 33, 66],
      mpacc:      [194, 48, 96, 184, 43, 86],
      mta:        [151, 35, 70, 141, 30, 60],
      mem:        [162, 38, 76, 152, 33, 66],
      mgmt_other: [333, 41, 62, 323, 38, 57],
      art:        [351, 37, 56, 341, 34, 51],
      interdisc:  [266, 34, 51, 256, 31, 47]
    }
  };

  /* 两年口径不一致的地方，必须写出来，否则图表会误导 */
  var caveats = {
    mba:  '2025 年工商管理与旅游管理合并划线（均 151 分），2026 年拆分为 146 / 151。',
    mta:  '2025 年工商管理与旅游管理合并划线（均 151 分），2026 年拆分为 146 / 151。',
    mpacc:'2025 年会计与审计合并为 194 分，图书情报单列 191 分；2026 年三者合并为 199 分。',
    edu_normal: '2025 年"教育、国际中文教育"与"其他学科专业"总分相同，仅专业课单科线不同。'
  };

  /* 2027 考研（2026 年 12 月考试）关键节点 */
  var timeline = [
    { date: '2026-09-24', label: '招生管理规定发布', note: '教育部印发《2027 年全国硕士研究生招生工作管理规定》', state: 'done' },
    { date: '2026-09-26', label: '招生宣传咨询',     note: '研招网在线咨询，招生单位答疑', state: 'done' },
    { date: '2026-09-28', label: '填写考生信息',     note: '含学信网 APP 采集报名照片，持续到报名结束', state: 'done' },
    { date: '2026-10-09', label: '预报名开始',       note: '10 月 9 日 — 10 月 12 日', state: 'done' },
    { date: '2026-10-15', label: '正式报名',         note: '10 月 15 日 — 10 月 24 日，每日 9:00—22:00', state: 'done' },
    { date: '2026-10-24', label: '报名截止',         note: '逾期不得补办、不得修改', state: 'done' },
    { date: '2026-11-05', label: '网上确认',         note: '具体时间由各省级教育招生考试机构确定并公布', state: 'now' },
    { date: '2026-12-09', label: '准考证下载',       note: '考前 10 天左右开放，建议打印多份', state: 'todo' },
    { date: '2026-12-19', label: '初试第一天',       note: '上午 思想政治理论 / 管理类综合能力；下午 外国语', state: 'todo', key: true },
    { date: '2026-12-20', label: '初试第二天',       note: '上午 业务课一 / 专业基础综合；下午 业务课二', state: 'todo', key: true },
    { date: '2027-02-20', label: '初试成绩公布',     note: '一般 2 月中下旬陆续开放查询（往年口径）', state: 'todo', est: true },
    { date: '2027-03-15', label: '国家线公布',       note: '一般 3 月中旬，教育部划定复试基本要求', state: 'todo', est: true },
    { date: '2027-03-27', label: '调剂意向采集',     note: '参考 2026 年 3 月 27 日开通，2027 年以官方公告为准', state: 'todo', est: true },
    { date: '2027-04-08', label: '调剂服务系统',     note: '参考 2026 年 4 月 8 日开通，2027 年以官方公告为准', state: 'todo', est: true }
  ];

  var sources = [
    { label: '教育部《2027 年全国硕士研究生招生工作管理规定》', url: 'https://www.moe.gov.cn/srcsite/A15/moe_778/s3261/202609/t20260923_1451734.html' },
    { label: '研招网：2027 年初试时间 2026 年 12 月 19—20 日', url: 'https://yz.chsi.com.cn/kyzx/jybzc/202609/20260924/2293971512.html' },
    { label: '研招网：2026 年国家线（教育部）', url: 'https://yz.chsi.com.cn/kyzx/kp/202602/20260228/2293449093.html' },
    { label: '教育部：2025 年国家线 PDF', url: 'https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/s5987/202502/W020250224570852404019.pdf' },
    { label: '教育部：2026 年报名人数 343 万', url: 'https://www.moe.gov.cn/jyb_xwfb/gzdt_gzdt/moe_1485/202511/t20251124_1421370.html' }
  ];

  return {
    meta: {
      cycle: 2027,
      examStart: '2026-12-19T08:30:00+08:00',
      examEnd: '2026-12-20T17:00:00+08:00',
      applicants2026: 343,
      updated: '2026-11-17'
    },
    rows: rows,
    lines: lines,
    caveats: caveats,
    timeline: timeline,
    sources: sources
  };
})();
