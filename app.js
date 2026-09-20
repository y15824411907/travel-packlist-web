const STORAGE_KEY = "travel-packlist-v1";
const CATEGORIES = [
  "证件与票据",
  "钱包与随身",
  "电子设备",
  "衣物鞋帽",
  "洗护美妆",
  "健康用品",
  "工作用品",
  "活动用品",
  "其他",
];
const BUILTINS = [
  {
    id: "base-general",
    name: "通用旅行",
    icon: "🧳",
    items: [
      ["身份证", "证件与票据"],
      ["车票或机票信息", "证件与票据"],
      ["钱包", "钱包与随身"],
      ["钥匙", "钱包与随身"],
      ["手机", "电子设备"],
      ["手机充电器", "电子设备"],
      ["充电宝", "电子设备"],
      ["上衣", "衣物鞋帽", 2],
      ["裤子", "衣物鞋帽"],
      ["内衣", "衣物鞋帽", 2],
      ["袜子", "衣物鞋帽", 2],
      ["睡衣", "衣物鞋帽"],
      ["牙刷", "洗护美妆"],
      ["牙膏", "洗护美妆"],
      ["洗面奶", "洗护美妆"],
      ["常用药", "健康用品"],
      ["雨伞", "活动用品"],
    ],
  },
  {
    id: "base-short",
    name: "短途旅行",
    icon: "🚆",
    items: [
      ["身份证", "证件与票据"],
      ["车票信息", "证件与票据"],
      ["钱包", "钱包与随身"],
      ["钥匙", "钱包与随身"],
      ["手机", "电子设备"],
      ["手机充电器", "电子设备"],
      ["充电宝", "电子设备"],
      ["替换上衣", "衣物鞋帽"],
      ["内衣", "衣物鞋帽"],
      ["袜子", "衣物鞋帽"],
      ["牙刷", "洗护美妆"],
      ["护肤品", "洗护美妆"],
      ["常用药", "健康用品"],
    ],
  },
  {
    id: "base-business",
    name: "商务出差",
    icon: "💼",
    items: [
      ["身份证", "证件与票据"],
      ["车票或机票信息", "证件与票据"],
      ["钱包", "钱包与随身"],
      ["钥匙", "钱包与随身"],
      ["手机", "电子设备"],
      ["手机充电器", "电子设备"],
      ["充电宝", "电子设备"],
      ["电脑", "电子设备"],
      ["电脑充电器", "电子设备"],
      ["商务上衣", "衣物鞋帽", 2],
      ["裤子", "衣物鞋帽"],
      ["内衣", "衣物鞋帽", 2],
      ["袜子", "衣物鞋帽", 2],
      ["牙刷", "洗护美妆"],
      ["常用药", "健康用品"],
      ["工牌", "工作用品"],
      ["会议材料", "工作用品"],
    ],
  },
];
const SCENES = [
  {
    id: "flight",
    name: "乘机",
    icon: "✈️",
    desc: "随身证件 · 充电宝",
    items: [
      ["登机信息", "证件与票据"],
      ["充电宝", "电子设备"],
      ["耳机", "电子设备"],
      ["颈枕", "活动用品"],
    ],
  },
  {
    id: "international",
    name: "国际旅行",
    icon: "🌍",
    desc: "护照 · 转换插头",
    items: [
      ["护照", "证件与票据"],
      ["签证或入境材料（按目的地核实）", "证件与票据"],
      ["旅行保险信息", "证件与票据"],
      ["外币或银行卡", "钱包与随身"],
      ["转换插头", "电子设备"],
    ],
  },
  {
    id: "beach",
    name: "海边／游泳",
    icon: "🏖️",
    desc: "防晒 · 泳衣",
    items: [
      ["泳衣", "活动用品"],
      ["拖鞋", "衣物鞋帽"],
      ["防晒霜", "洗护美妆"],
      ["防水袋", "活动用品"],
    ],
  },
  {
    id: "hiking",
    name: "徒步／露营",
    icon: "⛺",
    desc: "防护 · 照明",
    items: [
      ["徒步鞋", "衣物鞋帽"],
      ["水壶", "活动用品"],
      ["头灯", "活动用品"],
      ["防晒霜", "洗护美妆"],
      ["创可贴", "健康用品"],
    ],
  },
];

function uid() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function cleanText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}
function readState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      trips: Array.isArray(raw.trips) ? raw.trips : [],
      templates: Array.isArray(raw.templates) ? raw.templates : [],
    };
  } catch {
    return { trips: [], templates: [] };
  }
}
const state = readState();
const ui = {
  view: "home",
  tripId: null,
  templateId: null,
  prefillTemplateId: null,
  tab: "confirm",
  filter: "all",
  modal: null,
  weather: {},
};
let storageWarned = false;
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    if (!storageWarned) {
      storageWarned = true;
      alert("当前浏览器无法保存数据，请检查无痕模式或浏览器存储设置。");
    }
  }
}
function getTrip(id = ui.tripId) {
  return state.trips.find((x) => x.id === id);
}
function getTemplate(id) {
  return (
    BUILTINS.find((x) => x.id === id) ||
    state.templates.find((x) => x.id === id)
  );
}
function templateItems(template) {
  return (template?.items || []).map((x) =>
    Array.isArray(x)
      ? { name: x[0], category: x[1], quantity: x[2] || 1 }
      : { name: x.name, category: x.category, quantity: x.quantity || 1 },
  );
}
function dateLabel(date) {
  if (!date) return "";
  const p = date.split("-");
  return `${Number(p[1])}月${Number(p[2])}日`;
}
function dateRange(trip) {
  return `${dateLabel(trip.startDate)}${trip.endDate ? "—" + dateLabel(trip.endDate) : ""}`;
}
function counts(trip) {
  const items = trip.items.filter((x) => x.selected);
  return {
    total: items.length,
    packed: items.filter((x) => x.packStatus === "packed").length,
    later: items.filter((x) => x.packStatus === "later").length,
  };
}
function tripStatus(trip) {
  const c = counts(trip);
  if (trip.stage !== "packing") return ["待确认", "amber"];
  if (c.total && c.packed === c.total) return ["已完成", ""];
  return ["打包中", "gray"];
}
function uniqueKey(item) {
  return `${cleanText(item.category)}|${cleanText(item.name).toLocaleLowerCase()}`;
}
function mergeItems(lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const item of list) {
      const x = Array.isArray(item)
        ? { name: item[0], category: item[1], quantity: item[2] || 1 }
        : item;
      const key = uniqueKey(x);
      if (!seen.has(key)) {
        seen.add(key);
        out.push({
          id: uid(),
          name: x.name,
          category: x.category,
          quantity: x.quantity || 1,
          selected: true,
          packStatus: "pending",
        });
      }
    }
  }
  return out;
}
function categoryGroups(items) {
  return CATEGORIES.map((category) => ({
    category,
    items: items.filter((x) => x.category === category),
  })).filter((x) => x.items.length);
}
function navigate(view, options = {}) {
  ui.view = view;
  ui.modal = null;
  if (options.tripId) {
    ui.tripId = options.tripId;
    const trip = getTrip();
    ui.tab = trip?.stage === "packing" ? "pack" : "confirm";
    ui.filter = "all";
  }
  if (options.templateId) ui.templateId = options.templateId;
  render();
  window.scrollTo(0, 0);
  if (view === "detail") ensureWeather();
}
function brand() {
  return `<header class="topbar"><div class="brand"><span class="brand-mark" aria-hidden="true">箱</span><span>出行行李清单</span></div><button class="icon-btn" data-action="go-templates">模板管理</button></header>`;
}
function nav() {
  return `<nav class="bottom-nav" aria-label="主导航"><button class="${ui.view === "home" || ui.view === "create" || ui.view === "detail" ? "active" : ""}" data-action="go-home"><span class="nav-icon" aria-hidden="true">⌂</span>行程</button><button class="${ui.view === "templates" || ui.view === "template-editor" ? "active" : ""}" data-action="go-templates"><span class="nav-icon" aria-hidden="true">▤</span>模板</button></nav>`;
}
function render() {
  const app = document.getElementById("app");
  let page = "";
  if (ui.view === "home") page = renderHome();
  else if (ui.view === "create") page = renderCreate();
  else if (ui.view === "detail") page = renderDetail();
  else if (ui.view === "templates") page = renderTemplates();
  else if (ui.view === "template-editor") page = renderTemplateEditor();
  app.innerHTML = brand() + page + nav() + renderModal();
}

function renderHome() {
  const trips = [...state.trips].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );
  return `<main class="page"><div class="eyebrow">PACK FOR THE JOURNEY</div><h1 class="page-title">我的行程</h1><p class="intro">先想好要带什么，装包时再逐项核对。</p><button class="btn primary wide" data-action="new-trip">＋ 新建行程</button><div class="section-head"><h2>行程列表</h2><small>${trips.length} 个行程</small></div>${trips.length ? trips.map(renderTripCard).join("") : `<div class="card empty"><div class="empty-illustration" aria-hidden="true">🧳</div><h2>还没有行程</h2><p>创建一次旅行或出差，清单就从这里开始。</p><button class="btn secondary" data-action="new-trip">创建第一个行程</button></div>`}</main>`;
}
function renderTripCard(trip) {
  const c = counts(trip),
    [label, tone] = tripStatus(trip),
    percent = c.total ? Math.round((c.packed / c.total) * 100) : 0;
  return `<button class="card trip-card" data-action="open-trip" data-id="${trip.id}"><div class="trip-card-top"><div><h3>${escapeHTML(trip.name)}</h3><div class="trip-meta">${escapeHTML(trip.destination)} · ${dateRange(trip)}</div></div><span class="pill ${tone}">${label}</span></div><div class="progress-track"><span style="width:${percent}%"></span></div><div class="card-footer"><span>${c.packed} / ${c.total} 件已装好</span><span>${c.later ? `${c.later} 件临出门再拿` : "查看清单 →"}</span></div></button>`;
}
function renderCreate() {
  const templates = [...BUILTINS, ...state.templates];
  const prefill = ui.prefillTemplateId || "base-general";
  return `<main class="page"><div class="back-row"><button data-action="go-home">← 返回行程</button></div><div class="eyebrow">NEW TRIP</div><h1 class="page-title">新建行程</h1><p class="intro">填好行程，再用模板和场景生成这次的候选清单。</p><form id="create-trip-form"><div class="field"><label for="trip-name">行程名称 *</label><input id="trip-name" name="name" placeholder="例如：国庆去成都" maxlength="40" required /></div><div class="field"><label for="trip-destination">目的地城市 *</label><input id="trip-destination" name="destination" placeholder="例如：成都" maxlength="50" required /></div><div class="field-grid"><div class="field"><label for="trip-start">出发日期 *</label><input id="trip-start" name="startDate" type="date" required /></div><div class="field"><label for="trip-end">返程日期</label><input id="trip-end" name="endDate" type="date" /></div></div><div class="field"><label for="trip-type">出行类型</label><select id="trip-type" name="type"><option value="travel">旅行</option><option value="business">出差</option></select></div><div class="section-head"><h2>基础模板</h2><small>选 1 个</small></div><div class="choice-grid">${templates.map((t) => `<label class="choice"><input type="radio" name="templateId" value="${t.id}" ${t.id === prefill ? "checked" : ""} /><span class="choice-body"><span aria-hidden="true">${t.icon || "📋"}</span><span class="choice-title">${escapeHTML(t.name)}</span><span class="choice-sub">${templateItems(t).length} 件物品</span></span></label>`).join("")}</div><div class="section-head"><h2>补充场景</h2><small>可多选</small></div><div class="choice-grid">${SCENES.map((s) => `<label class="choice"><input type="checkbox" name="scene" value="${s.id}" /><span class="choice-body"><span aria-hidden="true">${s.icon}</span><span class="choice-title">${s.name}</span><span class="choice-sub">${s.desc}</span></span></label>`).join("")}</div><button class="btn primary wide" type="submit">生成本次清单</button></form></main>`;
}

function renderDetail() {
  const trip = getTrip();
  if (!trip) {
    ui.view = "home";
    return renderHome();
  }
  const c = counts(trip);
  return `<main class="page"><div class="back-row"><button data-action="go-home">← 我的行程</button><button data-action="delete-trip">删除行程</button></div><div class="eyebrow">${trip.type === "business" ? "BUSINESS TRIP" : "TRAVEL PLAN"}</div><h1 class="page-title">${escapeHTML(trip.name)}</h1><div class="trip-meta">📍 ${escapeHTML(trip.destination)}　·　${dateRange(trip)}</div>${renderWeather(trip)}<div class="steps" role="tablist" aria-label="清单步骤"><button class="step ${ui.tab === "confirm" ? "active" : ""}" data-action="show-confirm" role="tab" aria-selected="${ui.tab === "confirm"}"><span class="number">1</span>确认清单</button><button class="step ${ui.tab === "pack" ? "active" : ""}" data-action="show-pack" role="tab" aria-selected="${ui.tab === "pack"}" ${trip.stage !== "packing" ? "disabled" : ""}><span class="number">2</span>核对行李</button></div>${ui.tab === "confirm" ? renderConfirm(trip, c) : renderPacking(trip, c)}</main>`;
}
function renderConfirm(trip, c) {
  return `<div class="summary card"><strong>${c.total}</strong><small> 件已选为本次要带</small><p class="notice">取消不需要的物品，也可以改数量或补充遗漏的东西。</p></div><div class="toolbar"><h2>本次清单</h2><button class="btn secondary small" data-action="add-trip-item">＋ 添加物品</button></div>${renderCategories(trip.items, "confirm")}${!trip.items.length ? '<p class="notice">还没有物品，请先添加。</p>' : ""}<button class="btn primary wide" data-action="confirm-list" ${c.total ? "" : "disabled"}>${trip.stage === "packing" ? "保存修改并返回核对" : "确认本次清单，开始核对"}</button>`;
}
function renderPacking(trip, c) {
  const visible = trip.items.filter(
    (x) => x.selected && (ui.filter === "all" || x.packStatus !== "packed"),
  );
  const later = trip.items.filter(
    (x) => x.selected && x.packStatus === "later",
  );
  return `<div class="summary card"><strong>${c.packed} / ${c.total}</strong><small> 件已装好</small><div class="progress-track"><span style="width:${c.total ? Math.round((c.packed / c.total) * 100) : 0}%"></span></div><div class="card-footer"><span>剩余 ${c.total - c.packed} 件</span><span>${c.later} 件临出门再拿</span></div></div>${c.total && c.packed === c.total ? '<div class="success"><strong>这次行李已核对完成 ✓</strong><p>出发前仍可返回查看或修改。</p></div>' : ""}${later.length ? `<div class="later-box"><strong>临出门再拿</strong><br>${later.map((x) => escapeHTML(x.name)).join("、")}</div>` : ""}<div class="toolbar"><h2>装包核对</h2><button class="filter ${ui.filter === "unfinished" ? "active" : ""}" data-action="toggle-filter">${ui.filter === "unfinished" ? "显示全部" : "只看未完成"}</button></div>${renderCategories(visible, "pack")}${!visible.length ? '<p class="notice">当前没有需要显示的物品。</p>' : ""}<div class="split-actions"><button class="btn secondary" data-action="add-trip-item">＋ 补充物品</button><button class="btn ghost" data-action="save-as-template">另存为模板</button></div>`;
}
function renderCategories(items, mode) {
  return categoryGroups(items)
    .map(
      (g) =>
        `<section class="category"><div class="category-head"><h3>${g.category}</h3><span>${g.items.length} 件</span></div>${g.items.map((item) => renderItem(item, mode)).join("")}</section>`,
    )
    .join("");
}
function renderItem(item, mode) {
  if (mode === "template")
    return `<div class="item-row"><div class="item-info"><div class="item-name">${escapeHTML(item.name)}</div><div class="item-meta">${item.quantity} 件</div></div><button class="text-btn" data-action="edit-template-item" data-id="${item.id}">编辑</button><button class="text-btn subtle" data-action="delete-template-item" data-id="${item.id}">删除</button></div>`;
  if (mode === "confirm")
    return `<div class="item-row ${item.selected ? "" : "dim"}"><button class="item-check ${item.selected ? "on" : ""}" data-action="toggle-selected" data-id="${item.id}" aria-label="${item.selected ? "取消" : "选择"}${escapeHTML(item.name)}">${item.selected ? "✓" : ""}</button><div class="item-info"><div class="item-name">${escapeHTML(item.name)}</div><div class="item-meta">${item.quantity} 件${item.selected ? " · 要带" : " · 不带"}</div></div><div class="item-actions"><button class="text-btn" data-action="edit-trip-item" data-id="${item.id}">编辑</button><button class="text-btn subtle" data-action="delete-trip-item" data-id="${item.id}">删除</button></div></div>`;
  return `<div class="item-row ${item.packStatus === "packed" ? "dim" : ""}"><button class="item-check ${item.packStatus === "packed" ? "on" : item.packStatus === "later" ? "later" : ""}" data-action="toggle-packed" data-id="${item.id}" aria-label="${item.packStatus === "packed" ? "取消已装好" : "标记已装好"}：${escapeHTML(item.name)}">${item.packStatus === "packed" ? "✓" : item.packStatus === "later" ? "⏱" : ""}</button><div class="item-info"><div class="item-name">${escapeHTML(item.name)}</div><div class="item-meta">${item.quantity} 件 · ${item.packStatus === "packed" ? "已装好" : item.packStatus === "later" ? "临出门再拿" : "未装好"}</div></div><div class="item-actions"><button class="text-btn" data-action="toggle-later" data-id="${item.id}">${item.packStatus === "later" ? "取消稍后" : "稍后拿"}</button><button class="text-btn subtle" data-action="edit-trip-item" data-id="${item.id}">编辑</button><button class="text-btn subtle" data-action="delete-trip-item" data-id="${item.id}">删除</button></div></div>`;
}

function renderTemplates() {
  const all = [...BUILTINS, ...state.templates];
  return `<main class="page"><div class="eyebrow">PACKING TEMPLATES</div><h1 class="page-title">模板管理</h1><p class="intro">常用物品存成模板，下次出行从这里开始。</p><button class="btn primary wide" data-action="new-template">＋ 创建自定义模板</button><div class="section-head"><h2>内置模板</h2><small>${BUILTINS.length} 个</small></div>${BUILTINS.map((t) => renderTemplateCard(t, false)).join("")}<div class="section-head"><h2>我的模板</h2><small>${state.templates.length} 个</small></div>${state.templates.length ? state.templates.map((t) => renderTemplateCard(t, true)).join("") : `<div class="card empty" style="padding:28px"><p>还没有自定义模板。可新建，也可从行程清单另存。</p></div>`}</main>`;
}
function renderTemplateCard(t, custom) {
  const items = templateItems(t);
  return `<div class="card template-card"><h3>${t.icon || "📋"} ${escapeHTML(t.name)}</h3><p>${items.length} 件物品 · ${new Set(items.map((x) => x.category)).size} 个分类</p><div class="template-actions"><button class="btn secondary small" data-action="use-template" data-id="${t.id}">用于新行程</button><button class="btn ghost small" data-action="${custom ? "edit-template" : "view-template"}" data-id="${t.id}">${custom ? "编辑" : "查看物品"}</button>${custom ? `<button class="btn ghost small" data-action="delete-template" data-id="${t.id}">删除</button>` : ""}</div></div>`;
}
function renderTemplateEditor() {
  const t = state.templates.find((x) => x.id === ui.templateId);
  if (!t) {
    ui.view = "templates";
    return renderTemplates();
  }
  return `<main class="page"><div class="back-row"><button data-action="go-templates">← 模板管理</button></div><div class="eyebrow">MY TEMPLATE</div><h1 class="page-title">编辑模板</h1><form id="rename-template-form"><div class="field"><label for="template-title">模板名称</label><input id="template-title" name="name" maxlength="30" value="${escapeHTML(t.name)}" required /></div><button class="btn secondary small" type="submit">保存名称</button></form><div class="toolbar"><h2>模板物品 · ${t.items.length}</h2><button class="btn primary small" data-action="add-template-item">＋ 添加物品</button></div>${renderCategories(t.items, "template")}${t.items.length ? "" : '<p class="notice">模板还没有物品。添加后即可在新行程中使用。</p>'}</main>`;
}

function renderWeather(trip) {
  const key = weatherKey(trip),
    data = ui.weather[key];
  if (!data || data.status === "loading")
    return `<section class="weather-card"><div class="weather-title">⛅ 目的地天气</div><p class="weather-note">${data?.status === "loading" ? "正在获取天气…" : "打开行程时将自动获取预报。"}</p></section>`;
  if (data.status === "error")
    return `<section class="weather-card"><div class="weather-title">⛅ 目的地天气 <button class="text-btn" data-action="retry-weather">重试</button></div><p class="weather-note">${escapeHTML(data.message)}</p></section>`;
  const days = data.days;
  return `<section class="weather-card"><div class="weather-title"><span>⛅ ${escapeHTML(data.place)}天气</span><button class="text-btn" data-action="retry-weather">刷新</button></div>${days.length ? `<div class="weather-days">${days.map((d) => `<div class="weather-day"><div>${dateLabel(d.date)}</div><div>${weatherIcon(d.code)}</div><strong>${Math.round(d.max)}° / ${Math.round(d.min)}°</strong><div>降水 ${Math.round(d.rain)}%</div></div>`).join("")}</div>` : '<p class="weather-note">行程日期暂无可用天气预报，临近出发时再查看。</p>'}${data.suggestions.length ? `<div class="suggestions">${data.suggestions.map((s) => `<button class="suggestion" data-action="add-weather-item" data-name="${escapeHTML(s.name)}" data-category="${escapeHTML(s.category)}"><strong>＋ ${escapeHTML(s.name)}</strong><small>${escapeHTML(s.reason)}</small></button>`).join("")}</div>` : ""}<p class="weather-note">预报获取于 ${escapeHTML(data.updated)} · 仅供打包参考。${data.partial ? "部分日期暂无预报。" : ""} 数据来源：<a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></p></section>`;
}
function renderModal() {
  if (!ui.modal) return "";
  const m = ui.modal;
  if (m.type === "item") {
    const item = m.item || { name: "", category: "其他", quantity: 1 };
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${m.item ? "编辑物品" : "添加物品"}</h2><button class="modal-close" data-action="close-modal" aria-label="关闭">×</button></div><form id="item-form"><div class="field"><label for="item-name">物品名称</label><input id="item-name" name="name" maxlength="40" value="${escapeHTML(item.name)}" required autofocus /></div><div class="field-grid"><div class="field"><label for="item-category">分类</label><select id="item-category" name="category">${CATEGORIES.map((c) => `<option value="${c}" ${item.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div><div class="field"><label for="item-qty">数量</label><input id="item-qty" name="quantity" type="number" min="1" max="99" value="${Number(item.quantity) || 1}" required /></div></div><div class="modal-actions"><button class="btn ghost" type="button" data-action="close-modal">取消</button><button class="btn primary" type="submit">保存</button></div></form></div></div>`;
  }
  if (m.type === "template-name" || m.type === "save-trip-template") {
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${m.type === "template-name" ? "新建模板" : "另存为模板"}</h2><button class="modal-close" data-action="close-modal" aria-label="关闭">×</button></div><form id="${m.type === "template-name" ? "template-name-form" : "save-trip-template-form"}"><div class="field"><label for="new-template-name">模板名称</label><input id="new-template-name" name="name" maxlength="30" placeholder="例如：周末旅行" required autofocus /></div><div class="modal-actions"><button class="btn ghost" type="button" data-action="close-modal">取消</button><button class="btn primary" type="submit">保存模板</button></div></form></div></div>`;
  }
  if (m.type === "template-view") {
    const t = getTemplate(m.id);
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${escapeHTML(t?.name || "模板")}</h2><button class="modal-close" data-action="close-modal" aria-label="关闭">×</button></div>${categoryGroups(
      templateItems(t),
    )
      .map(
        (g) =>
          `<section class="category"><div class="category-head"><h3>${g.category}</h3></div>${g.items.map((x) => `<div class="item-row"><div class="item-info"><div class="item-name">${escapeHTML(x.name)}</div></div><span class="item-meta">${x.quantity} 件</span></div>`).join("")}</section>`,
      )
      .join(
        "",
      )}<button class="btn primary wide" data-action="use-template" data-id="${t?.id || ""}">用这个模板建行程</button></div></div>`;
  }
  return "";
}

function showModal(modal) {
  ui.modal = modal;
  render();
  setTimeout(
    () => document.querySelector(".modal input[autofocus]")?.focus(),
    0,
  );
}
function weatherKey(trip) {
  return [trip.id, trip.destination, trip.startDate, trip.endDate || ""].join(
    "|",
  );
}
function weatherIcon(code) {
  if ([0, 1].includes(code)) return "☀️";
  if ([2, 3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(
      code,
    )
  )
    return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  return "⛅";
}
async function fetchJSON(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("网络请求失败");
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}
function ensureWeather(force = false) {
  const trip = getTrip();
  if (!trip) return;
  const key = weatherKey(trip);
  if (!force && ui.weather[key]) return;
  ui.weather[key] = { status: "loading" };
  render();
  (async () => {
    try {
      const geo = await fetchJSON(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trip.destination)}&count=1&language=zh&format=json`,
      );
      const place = geo.results?.[0];
      if (!place) throw new Error("未找到该目的地，请检查城市名称。");
      const forecast = await fetchJSON(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`,
      );
      const daily = forecast.daily;
      if (!daily?.time) throw new Error("暂时无法获取天气预报。");
      const days = daily.time
        .map((date, i) => ({
          date,
          code: daily.weather_code?.[i] ?? 0,
          max: daily.temperature_2m_max?.[i] ?? 0,
          min: daily.temperature_2m_min?.[i] ?? 0,
          rain: daily.precipitation_probability_max?.[i] ?? 0,
        }))
        .filter(
          (d) =>
            d.date >= trip.startDate &&
            d.date <= (trip.endDate || trip.startDate),
        );
      const suggestions = [];
      const add = (name, category, reason) => {
        if (
          !trip.items.some(
            (x) => x.selected && uniqueKey(x) === uniqueKey({ name, category }),
          )
        )
          suggestions.push({ name, category, reason });
      };
      if (
        days.some(
          (d) =>
            d.rain >= 50 ||
            [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(d.code),
        )
      )
        add("雨伞", "活动用品", "行程中可能下雨");
      if (days.some((d) => d.min <= 10))
        add("保暖外套", "衣物鞋帽", "行程中气温较低");
      if (days.some((d) => d.max >= 30))
        add("防晒霜", "洗护美妆", "行程中可能较热");
      ui.weather[key] = {
        status: "ready",
        place: place.name,
        days,
        suggestions,
        updated: new Date().toLocaleString("zh-CN", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        partial:
          !!trip.endDate &&
          (days.length === 0 || days.at(-1).date < trip.endDate),
      };
    } catch (error) {
      ui.weather[key] = {
        status: "error",
        message:
          error.name === "AbortError"
            ? "天气请求超时，清单仍可正常使用。"
            : error.message || "天气暂时不可用，清单仍可正常使用。",
      };
    }
    if (ui.view === "detail" && getTrip()?.id === trip.id && !ui.modal)
      render();
  })();
}

document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action,
    id = el.dataset.id,
    trip = getTrip();
  if (action === "close-modal") {
    if (el.classList.contains("modal-backdrop") && event.target !== el) return;
    ui.modal = null;
    render();
    return;
  }
  if (action === "go-home") return navigate("home");
  if (action === "go-templates") return navigate("templates");
  if (action === "new-trip") {
    ui.prefillTemplateId = null;
    return navigate("create");
  }
  if (action === "open-trip") return navigate("detail", { tripId: id });
  if (action === "show-confirm") {
    ui.tab = "confirm";
    return render();
  }
  if (action === "show-pack") {
    if (trip?.stage === "packing") {
      ui.tab = "pack";
      render();
    }
    return;
  }
  if (action === "toggle-filter") {
    ui.filter = ui.filter === "all" ? "unfinished" : "all";
    return render();
  }
  if (action === "confirm-list") {
    if (!trip || !counts(trip).total) return;
    trip.stage = "packing";
    ui.tab = "pack";
    save();
    return render();
  }
  if (action === "toggle-selected") {
    const item = trip?.items.find((x) => x.id === id);
    if (item) {
      item.selected = !item.selected;
      if (!item.selected) item.packStatus = "pending";
      save();
      render();
    }
    return;
  }
  if (action === "toggle-packed") {
    const item = trip?.items.find((x) => x.id === id);
    if (item) {
      item.packStatus = item.packStatus === "packed" ? "pending" : "packed";
      save();
      render();
    }
    return;
  }
  if (action === "toggle-later") {
    const item = trip?.items.find((x) => x.id === id);
    if (item) {
      item.packStatus = item.packStatus === "later" ? "pending" : "later";
      save();
      render();
    }
    return;
  }
  if (action === "add-trip-item")
    return showModal({ type: "item", kind: "trip" });
  if (action === "edit-trip-item") {
    const item = trip?.items.find((x) => x.id === id);
    if (item) showModal({ type: "item", kind: "trip", id, item });
    return;
  }
  if (action === "delete-trip-item") {
    if (!trip) return;
    const item = trip.items.find((x) => x.id === id);
    if (item && confirm(`删除「${item.name}」？`)) {
      trip.items = trip.items.filter((x) => x.id !== id);
      save();
      render();
    }
    return;
  }
  if (action === "delete-trip") {
    if (trip && confirm(`删除行程「${trip.name}」及其清单？`)) {
      state.trips = state.trips.filter((x) => x.id !== trip.id);
      save();
      navigate("home");
    }
    return;
  }
  if (action === "retry-weather") return ensureWeather(true);
  if (action === "add-weather-item") {
    if (!trip) return;
    const name = el.dataset.name,
      category = el.dataset.category,
      existing = trip.items.find(
        (x) => uniqueKey(x) === uniqueKey({ name, category }),
      );
    if (existing) existing.selected = true;
    else
      trip.items.push({
        id: uid(),
        name,
        category,
        quantity: 1,
        selected: true,
        packStatus: "pending",
      });
    const key = weatherKey(trip);
    ui.weather[key].suggestions = ui.weather[key].suggestions.filter(
      (x) => uniqueKey(x) !== uniqueKey({ name, category }),
    );
    save();
    return render();
  }
  if (action === "save-as-template")
    return showModal({ type: "save-trip-template" });
  if (action === "new-template") return showModal({ type: "template-name" });
  if (action === "use-template") {
    ui.prefillTemplateId = id;
    return navigate("create");
  }
  if (action === "view-template")
    return showModal({ type: "template-view", id });
  if (action === "edit-template")
    return navigate("template-editor", { templateId: id });
  if (action === "delete-template") {
    const t = state.templates.find((x) => x.id === id);
    if (t && confirm(`删除模板「${t.name}」？已有行程不受影响。`)) {
      state.templates = state.templates.filter((x) => x.id !== id);
      save();
      render();
    }
    return;
  }
  if (action === "add-template-item")
    return showModal({ type: "item", kind: "template" });
  if (action === "edit-template-item") {
    const t = state.templates.find((x) => x.id === ui.templateId),
      item = t?.items.find((x) => x.id === id);
    if (item) showModal({ type: "item", kind: "template", id, item });
    return;
  }
  if (action === "delete-template-item") {
    const t = state.templates.find((x) => x.id === ui.templateId),
      item = t?.items.find((x) => x.id === id);
    if (item && confirm(`从模板删除「${item.name}」？`)) {
      t.items = t.items.filter((x) => x.id !== id);
      save();
      render();
    }
    return;
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const data = new FormData(form);
  if (form.id === "create-trip-form") {
    const name = cleanText(data.get("name")),
      destination = cleanText(data.get("destination")),
      startDate = String(data.get("startDate") || ""),
      endDate = String(data.get("endDate") || ""),
      templateId = String(data.get("templateId") || "");
    if (!name || !destination || !startDate)
      return alert("请填写行程名称、目的地和出发日期。");
    if (endDate && endDate < startDate)
      return alert("返程日期不能早于出发日期。");
    const template = getTemplate(templateId);
    if (!template) return alert("请选择一个基础模板。");
    const sceneIds = data.getAll("scene").map(String);
    const lists = [
      templateItems(template),
      ...SCENES.filter((x) => sceneIds.includes(x.id)).map((x) => x.items),
    ];
    const trip = {
      id: uid(),
      name,
      destination,
      startDate,
      endDate,
      type: String(data.get("type") || "travel"),
      templateId,
      sceneIds,
      stage: "confirm",
      items: mergeItems(lists),
      createdAt: Date.now(),
    };
    state.trips.push(trip);
    save();
    ui.prefillTemplateId = null;
    return navigate("detail", { tripId: trip.id });
  }
  if (form.id === "item-form") {
    const name = cleanText(data.get("name")),
      category = String(data.get("category") || "其他"),
      quantity = Number(data.get("quantity"));
    if (
      !name ||
      !CATEGORIES.includes(category) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    )
      return alert("请填写有效的物品名称、分类和数量。");
    const m = ui.modal;
    if (m.kind === "trip") {
      const trip = getTrip();
      if (!trip) return;
      const item = m.id ? trip.items.find((x) => x.id === m.id) : null;
      if (item) Object.assign(item, { name, category, quantity });
      else
        trip.items.push({
          id: uid(),
          name,
          category,
          quantity,
          selected: true,
          packStatus: "pending",
        });
    } else {
      const t = state.templates.find((x) => x.id === ui.templateId);
      if (!t) return;
      const item = m.id ? t.items.find((x) => x.id === m.id) : null;
      if (item) Object.assign(item, { name, category, quantity });
      else t.items.push({ id: uid(), name, category, quantity });
    }
    save();
    ui.modal = null;
    return render();
  }
  if (form.id === "template-name-form") {
    const name = cleanText(data.get("name"));
    if (!name) return;
    const t = { id: uid(), name, icon: "📋", items: [] };
    state.templates.push(t);
    save();
    ui.modal = null;
    return navigate("template-editor", { templateId: t.id });
  }
  if (form.id === "save-trip-template-form") {
    const name = cleanText(data.get("name")),
      trip = getTrip();
    if (!name || !trip) return;
    const t = {
      id: uid(),
      name,
      icon: "📋",
      items: trip.items
        .filter((x) => x.selected)
        .map((x) => ({
          id: uid(),
          name: x.name,
          category: x.category,
          quantity: x.quantity,
        })),
    };
    state.templates.push(t);
    save();
    ui.modal = null;
    render();
    alert(`已保存模板「${name}」`);
    return;
  }
  if (form.id === "rename-template-form") {
    const t = state.templates.find((x) => x.id === ui.templateId),
      name = cleanText(data.get("name"));
    if (!t || !name) return;
    t.name = name;
    save();
    return render();
  }
});

render();
