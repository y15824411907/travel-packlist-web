const STORAGE_KEY = "travel-packlist-v1";
const CATEGORIES = [
  "证件票据",
  "随身物品",
  "电子设备",
  "衣物鞋帽",
  "洗护",
  "健康用品",
  "徒步/活动装备",
  "其他",
];
const LEGACY_CATEGORIES = {
  "证件与票据": "证件票据",
  "钱包与随身": "随身物品",
  "洗护美妆": "洗护",
  "工作用品": "其他",
  "活动用品": "徒步/活动装备",
};
const categoryOf = (name) => LEGACY_CATEGORIES[name] || (CATEGORIES.includes(name) ? name : "其他");
const BUILTINS = [
  {
    id: "base-general",
    name: "通用旅行",
    icon: "🧳",
    items: [
      ["身份证", "证件票据"],
      ["车票或机票信息", "证件票据"],
      ["钱包", "随身物品"],
      ["钥匙", "随身物品"],
      ["手机", "电子设备"],
      ["手机充电器", "电子设备"],
      ["充电宝", "电子设备"],
      ["上衣", "衣物鞋帽", 2],
      ["裤子", "衣物鞋帽"],
      ["内衣", "衣物鞋帽", 2],
      ["袜子", "衣物鞋帽", 2],
      ["睡衣", "衣物鞋帽"],
      ["牙刷", "洗护"],
      ["牙膏", "洗护"],
      ["洗面奶", "洗护"],
      ["常用药", "健康用品"],
      ["雨伞", "徒步/活动装备"],
    ],
  },
  {
    id: "base-short",
    name: "短途旅行",
    icon: "🚆",
    items: [
      ["身份证", "证件票据"],
      ["车票信息", "证件票据"],
      ["钱包", "随身物品"],
      ["钥匙", "随身物品"],
      ["手机", "电子设备"],
      ["手机充电器", "电子设备"],
      ["充电宝", "电子设备"],
      ["替换上衣", "衣物鞋帽"],
      ["内衣", "衣物鞋帽"],
      ["袜子", "衣物鞋帽"],
      ["牙刷", "洗护"],
      ["护肤品", "洗护"],
      ["常用药", "健康用品"],
    ],
  },
  {
    id: "base-business",
    name: "商务出差",
    icon: "💼",
    items: [
      ["身份证", "证件票据"],
      ["车票或机票信息", "证件票据"],
      ["钱包", "随身物品"],
      ["钥匙", "随身物品"],
      ["手机", "电子设备"],
      ["手机充电器", "电子设备"],
      ["充电宝", "电子设备"],
      ["电脑", "电子设备"],
      ["电脑充电器", "电子设备"],
      ["商务上衣", "衣物鞋帽", 2],
      ["裤子", "衣物鞋帽"],
      ["内衣", "衣物鞋帽", 2],
      ["袜子", "衣物鞋帽", 2],
      ["牙刷", "洗护"],
      ["常用药", "健康用品"],
      ["工牌", "其他"],
      ["会议材料", "其他"],
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
      ["登机信息", "证件票据"],
      ["充电宝", "电子设备"],
      ["耳机", "电子设备"],
      ["颈枕", "徒步/活动装备"],
    ],
  },
  {
    id: "international",
    name: "国际旅行",
    icon: "🌍",
    desc: "护照 · 转换插头",
    items: [
      ["护照", "证件票据"],
      ["签证或入境材料（按目的地核实）", "证件票据"],
      ["旅行保险信息", "证件票据"],
      ["外币或银行卡", "随身物品"],
      ["转换插头", "电子设备"],
    ],
  },
  {
    id: "beach",
    name: "海边／游泳",
    icon: "🏖️",
    desc: "防晒 · 泳衣",
    items: [
      ["泳衣", "徒步/活动装备"],
      ["拖鞋", "衣物鞋帽"],
      ["防晒霜", "洗护"],
      ["防水袋", "徒步/活动装备"],
    ],
  },
  {
    id: "hiking",
    name: "徒步",
    icon: "⛺",
    desc: "防护 · 照明",
    items: [
      ["徒步鞋", "衣物鞋帽"],
      ["水壶", "徒步/活动装备"],
      ["登山杖", "徒步/活动装备"],
      ["头灯", "徒步/活动装备"],
      ["雨衣", "徒步/活动装备"],
      ["保暖外套", "衣物鞋帽"],
      ["徒步袜", "衣物鞋帽", 4],
      ["防晒霜", "洗护"],
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
      trips: Array.isArray(raw.trips) ? raw.trips.map((trip) => ({ ...trip, items: (trip.items || []).map((item) => ({ ...item, category: categoryOf(item.category) })) })) : [],
      templates: Array.isArray(raw.templates) ? raw.templates.map((template) => ({ ...template, items: (template.items || []).map((item) => ({ ...item, category: categoryOf(item.category) })) })) : [],
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
  weatherExpanded: false,
  aiAvailable: false,
  method: "template",
  createDraft: null,
  generating: false,
  aiError: "",
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
      ? { name: x[0], category: categoryOf(x[1]), quantity: x[2] || 1 }
      : { name: x.name, category: categoryOf(x.category), quantity: x.quantity || 1 },
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
          category: categoryOf(x.category),
          quantity: x.quantity || 1,
          selected: x.selected !== false,
          packStatus: "pending",
          reason: x.reason || "",
          source: x.source || "template",
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
  if (view === "detail") ensureWeather(getTrip());
  if (view === "home") ensureWeather(nextTrip());
}
function brand() {
  return `<header class="topbar"><button class="brand" data-action="go-home" aria-label="回到行程首页"><img src="./favicon.svg" alt=""/><span>行前准备</span></button><button class="round-menu" data-action="go-templates" aria-label="模板管理">···</button></header>`;
}
function nav() {
  const home = ["home", "create", "detail"].includes(ui.view);
  return `<nav class="bottom-nav" aria-label="主导航"><button class="${home ? "active" : ""}" data-action="go-home"><span class="nav-icon">▤</span>行程</button><button class="${!home ? "active" : ""}" data-action="go-templates"><span class="nav-icon">▦</span>模板</button></nav>`;
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
function nextTrip() {
  const today = new Date().toLocaleDateString("sv-SE");
  const sorted = [...state.trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return sorted.find((trip) => (trip.endDate || trip.startDate) >= today) || sorted.at(-1);
}
function heroClass(trip) {
  return trip && /雨崩|德钦/.test(`${trip.name} ${trip.destination}`) ? "yubeng" : "plain";
}
function renderHome() {
  const trip = nextTrip();
  const all = [...state.trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
  return `<main class="page home"><div class="welcome"><h1>下一次出发，<br>从容一点。</h1><p>清单记住细节，你专心期待旅程。</p></div>${trip ? `<button class="hero-card ${heroClass(trip)}" data-action="open-trip" data-id="${trip.id}"><span class="hero-over">YOUR NEXT TRIP · ${dateRange(trip)}</span><strong>${escapeHTML(trip.name)}</strong><small>${escapeHTML(trip.destination)} · ${dateRange(trip)}</small><span class="hero-meter">${counts(trip).packed} / ${counts(trip).total} 已装好　继续核对 →</span></button>${renderHomeWeather(trip)}` : `<div class="hero-card yubeng empty-hero"><span class="hero-over">READY BEFORE YOU GO</span><strong>把旅途交给期待，<br>把行李交给清单。</strong><small>示例灵感 · 云南雨崩徒步</small><button class="hero-meter" data-action="new-trip">创建第一趟行程 →</button></div>`}<div class="section-head"><h2>${trip ? "我的行程" : "常用起点"}</h2><button class="text-btn" data-action="go-templates">管理模板 →</button></div>${trip ? all.map(renderTripCard).join("") : `<div class="template-mini"><button data-action="use-template" data-id="base-general"><strong>通用旅行</strong><small>从常备物品开始</small></button><button data-action="new-hiking-trip"><strong>徒步旅行</strong><small>补充户外装备</small></button></div>`}<button class="btn primary wide create-cta" data-action="new-trip">＋ 新建行程</button></main>`;
}
function renderHomeWeather(trip) {
  const weather = ui.weather[weatherKey(trip)];
  if (!weather) return `<button class="home-weather" data-action="open-trip" data-id="${trip.id}"><span>目的地天气</span><strong>正在获取预报…</strong></button>`;
  if (weather.status === "error") return `<button class="home-weather" data-action="open-trip" data-id="${trip.id}"><span>目的地天气</span><strong>暂未获取到预报，点此查看</strong></button>`;
  const days = weather.days || [];
  if (!days.length) return `<button class="home-weather" data-action="open-trip" data-id="${trip.id}"><span>目的地天气 · ${escapeHTML(weather.place)}</span><strong>出行日期暂无预报</strong><small>临近出发再查看 →</small></button>`;
  const low = Math.round(Math.min(...days.map((d) => d.min))), high = Math.round(Math.max(...days.map((d) => d.max)));
  const rain = Math.max(...days.map((d) => d.rain));
  return `<button class="home-weather" data-action="open-trip" data-id="${trip.id}"><span>目的地天气 · ${escapeHTML(weather.place)} <em>查看详情 →</em></span><strong>${low}—${high}°</strong><small>降水概率最高 ${rain}%${weather.suggestions?.length ? ` · ${escapeHTML(weather.suggestions.map((x) => x.name).join("、"))}可备` : ""}</small></button>`;
}
function renderTripCard(trip) {
  const c = counts(trip);
  const [label] = tripStatus(trip);
  return `<button class="trip-list-card" data-action="open-trip" data-id="${trip.id}"><span class="trip-list-date">${dateLabel(trip.startDate)}</span><span class="trip-list-main"><strong>${escapeHTML(trip.name)}</strong><small>${escapeHTML(trip.destination)} · ${dateRange(trip)}</small></span><span class="trip-list-state">${label}<br>${c.packed}/${c.total}</span></button>`;
}
function currentDraft() {
  return ui.createDraft || { name: "", destination: "", startDate: "", endDate: "", type: "travel", templateId: ui.prefillTemplateId || "base-general", scenes: [], notes: "", useWeather: true };
}
function captureDraft() {
  const form = document.getElementById("create-trip-form");
  if (!form) return;
  const d = new FormData(form);
  ui.createDraft = { name: String(d.get("name") || ""), destination: String(d.get("destination") || ""), startDate: String(d.get("startDate") || ""), endDate: String(d.get("endDate") || ""), type: String(d.get("type") || "travel"), templateId: String(d.get("templateId") || currentDraft().templateId), scenes: ui.method === "template" ? d.getAll("scene").map(String) : currentDraft().scenes, notes: String(d.get("notes") ?? currentDraft().notes), useWeather: ui.method === "ai" ? d.has("useWeather") : currentDraft().useWeather };
}
function renderCreate() {
  const d = currentDraft();
  const templates = [...BUILTINS, ...state.templates];
  const ai = ui.method === "ai" && ui.aiAvailable;
  return `<main class="page create"><div class="back-row"><button data-action="go-home">←</button><span>新建行程</span></div><h1 class="page-title">准备去哪里？</h1><p class="intro">填好行程，选择清单生成方式。</p><form id="create-trip-form"><div class="form-fields"><div class="field"><label for="trip-name">给行程起个名字 *</label><input id="trip-name" name="name" maxlength="40" placeholder="例如：云南雨崩徒步" value="${escapeHTML(d.name)}" required></div><div class="field"><label for="trip-destination">目的地 *</label><input id="trip-destination" name="destination" maxlength="60" placeholder="例如：德钦 · 雨崩" value="${escapeHTML(d.destination)}" required></div><div class="field-grid"><div class="field"><label for="trip-start">出发日期 *</label><input id="trip-start" type="date" name="startDate" value="${escapeHTML(d.startDate)}" required></div><div class="field"><label for="trip-end">返程日期</label><input id="trip-end" type="date" name="endDate" value="${escapeHTML(d.endDate)}"></div></div><input type="hidden" name="type" value="${escapeHTML(d.type)}"></div><h2 class="form-section-title">怎么生成这次的清单？</h2><div class="method-options ${ui.aiAvailable ? "" : "one"}"><button type="button" data-action="choose-method" data-method="template" class="method ${!ai ? "active" : ""}"><strong>✓ 从模板开始</strong><small>自己选场景，逐项确认</small></button>${ui.aiAvailable ? `<button type="button" data-action="choose-method" data-method="ai" class="method ${ai ? "active" : ""}"><strong>AI 自动生成 ↗</strong><small>按行程生成候选清单</small></button>` : ""}</div>${!ui.aiAvailable ? `<p class="privacy-note">AI 自动生成尚未配置，当前可从模板开始。</p>` : ""}${ai ? `<div class="ai-fields"><h2 class="form-section-title">补充说明 <small>选填</small></h2><textarea name="notes" maxlength="600" rows="4" placeholder="例如：白天徒步，住雨崩村，尽量轻装">${escapeHTML(d.notes)}</textarea><label class="switch-line"><span>参考目的地天气</span><input type="checkbox" name="useWeather" ${d.useWeather ? "checked" : ""}></label><p class="privacy-note">生成时会发送目的地、日期及你填写的说明。结果只是建议，请逐项核对。</p></div>` : `<div class="template-fields"><div class="choice-heading"><strong>基础模板</strong><small>选 1 个</small></div><div class="choice-grid">${templates.map((t) => `<label class="choice"><input type="radio" name="templateId" value="${t.id}" ${t.id === d.templateId ? "checked" : ""}><span>${escapeHTML(t.name)}</span></label>`).join("")}</div><div class="choice-heading"><strong>补充场景</strong><small>可多选</small></div><div class="choice-grid scene-grid">${SCENES.map((s) => `<label class="choice"><input type="checkbox" name="scene" value="${s.id}" ${d.scenes.includes(s.id) ? "checked" : ""}><span><strong>${escapeHTML(s.name)}</strong><small>${escapeHTML(s.desc)}</small></span></label>`).join("")}</div></div>`}${ui.aiError ? `<p class="form-error" role="alert">${escapeHTML(ui.aiError)} <button type="button" data-action="choose-method" data-method="template">从模板开始</button></p>` : ""}<button class="btn primary wide create-submit" type="submit" ${ui.generating ? "disabled" : ""}>${ui.generating ? "正在生成候选清单…" : ai ? "AI 生成候选清单 →" : "从模板生成清单 →"}</button></form></main>`;
}
function renderDetail() {
  const trip = getTrip();
  if (!trip) { ui.view = "home"; return renderHome(); }
  const c = counts(trip);
  return `<main class="page detail"><div class="back-row"><button data-action="go-home">←</button><button data-action="edit-trip">编辑行程</button></div><div class="detail-hero ${heroClass(trip)}"><span>STEP ${ui.tab === "confirm" ? "01" : "02"} / 02</span><h1>${ui.tab === "confirm" ? "先选好，<br>这次要带什么。" : "一件件装好，<br>出门更安心。"}</h1><small>${escapeHTML(trip.name)} · ${dateRange(trip)}</small></div><div class="steps" role="tablist" aria-label="清单步骤"><button class="step ${ui.tab === "confirm" ? "active" : ""}" data-action="show-confirm" role="tab" aria-selected="${ui.tab === "confirm"}"><b>1</b>确认要带</button><span></span><button class="step ${ui.tab === "pack" ? "active" : ""}" data-action="show-pack" role="tab" aria-selected="${ui.tab === "pack"}" ${trip.stage !== "packing" ? "disabled" : ""}><b>2</b>核对装包</button></div>${renderWeather(trip)}${ui.tab === "confirm" ? renderConfirm(trip, c) : renderPacking(trip, c)}<button class="delete-link" data-action="delete-trip">删除这趟行程</button></main>`;
}
function renderConfirm(trip, c) {
  return `<div class="list-heading"><span>目前选了 ${c.total} 件，点一下可以取消。</span><button data-action="add-trip-item">＋ 添加</button></div>${renderCategories(trip.items, "confirm")}${!trip.items.length ? '<p class="notice">清单还是空的，可以先添加物品。</p>' : ""}${trip.source === "ai" && ui.aiAvailable ? `<button class="text-btn regenerate" data-action="regenerate-ai">↻ 重新生成 AI 建议</button>` : ""}<button class="btn primary wide detail-submit" data-action="confirm-list" ${c.total ? "" : "disabled"}>${trip.stage === "packing" ? `保存 ${c.total} 件并返回装包 →` : `确认 ${c.total} 件，开始装包 →`}</button>`;
}
function renderPacking(trip, c) {
  const items = trip.items.filter((x) => x.selected && (ui.filter === "all" || (ui.filter === "unfinished" ? x.packStatus !== "packed" : x.packStatus === "later")));
  const later = trip.items.filter((x) => x.selected && x.packStatus === "later");
  const pct = c.total ? Math.round(c.packed / c.total * 100) : 0;
  return `<div class="pack-progress"><strong>${c.packed} / ${c.total}</strong><span>件已装好</span><div class="progress-track"><i style="width:${pct}%"></i></div></div>${c.total > 0 && c.packed === c.total ? `<div class="success">这趟行李都核对好了 ✓</div>` : ""}<div class="filters"><button class="${ui.filter === "unfinished" ? "active" : ""}" data-action="set-filter" data-filter="unfinished">还没装 ${c.total - c.packed}</button><button class="${ui.filter === "all" ? "active" : ""}" data-action="set-filter" data-filter="all">全部 ${c.total}</button><button class="${ui.filter === "later" ? "active" : ""}" data-action="set-filter" data-filter="later">出门再拿 ${c.later}</button></div>${renderCategories(items, "pack")}${!items.length ? '<p class="notice">当前没有需要显示的物品。</p>' : ""}${later.length && ui.filter !== "later" ? `<button class="later-box" data-action="set-filter" data-filter="later"><strong>留到出门前再拿</strong><small>${later.map((x) => escapeHTML(x.name)).join("、")}</small><span>去看看 →</span></button>` : ""}<div class="split-actions"><button class="btn secondary" data-action="add-trip-item">＋ 想起了别的要带</button><button class="btn ghost" data-action="save-as-template">另存为模板</button></div>`;
}
function renderCategories(items, mode) {
  return categoryGroups(items).map((g) => `<section class="category"><div class="category-head"><h3>${g.category}</h3><span>${mode === "pack" ? `${g.items.filter((x) => x.packStatus === "packed").length} / ` : ""}${g.items.length} 件</span></div>${g.items.map((item) => renderItem(item, mode)).join("")}</section>`).join("");
}
function renderItem(item, mode) {
  if (mode === "template") return `<div class="item-row"><div class="item-info"><div class="item-name">${escapeHTML(item.name)}</div><div class="item-meta">${item.quantity} 件</div></div><button class="text-btn" data-action="edit-template-item" data-id="${item.id}">编辑</button><button class="text-btn subtle" data-action="delete-template-item" data-id="${item.id}">删除</button></div>`;
  if (mode === "confirm") return `<div class="item-row ${item.selected ? "" : "dim"}"><button class="item-check ${item.selected ? "on" : ""}" data-action="toggle-selected" data-id="${item.id}" aria-label="${item.selected ? "取消" : "选择"}${escapeHTML(item.name)}">${item.selected ? "✓" : ""}</button><div class="item-info"><div class="item-name">${escapeHTML(item.name)}${item.quantity > 1 ? ` <small>× ${item.quantity}</small>` : ""}</div>${item.reason ? `<div class="item-reason">${escapeHTML(item.reason)}</div>` : ""}</div><div class="item-actions"><button class="text-btn" data-action="edit-trip-item" data-id="${item.id}">编辑</button><button class="text-btn subtle" data-action="delete-trip-item" data-id="${item.id}">删除</button></div></div>`;
  return `<div class="item-row ${item.packStatus === "packed" ? "dim" : ""}"><button class="item-check ${item.packStatus === "packed" ? "on" : item.packStatus === "later" ? "later" : ""}" data-action="toggle-packed" data-id="${item.id}" aria-label="${item.packStatus === "packed" ? "取消已装好" : "标记已装好"}：${escapeHTML(item.name)}">${item.packStatus === "packed" ? "✓" : item.packStatus === "later" ? "⏱" : ""}</button><div class="item-info"><div class="item-name">${escapeHTML(item.name)}${item.quantity > 1 ? ` <small>× ${item.quantity}</small>` : ""}</div><div class="item-meta">${item.packStatus === "packed" ? "已装好" : item.packStatus === "later" ? "出门再拿" : "还没装"}</div></div><div class="item-actions"><button class="text-btn" data-action="toggle-later" data-id="${item.id}">${item.packStatus === "later" ? "取消稍后" : "出门拿"}</button><button class="text-btn subtle" data-action="edit-trip-item" data-id="${item.id}">编辑</button></div></div>`;
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
  const data = ui.weather[weatherKey(trip)];
  if (!data || data.status === "loading") return `<section class="weather-card"><div class="weather-title">目的地天气</div><p>正在查询这趟行程的预报…</p></section>`;
  if (data.status === "error") return `<section class="weather-card"><div class="weather-title">目的地天气 <button data-action="retry-weather">重试 →</button></div><p>${escapeHTML(data.message)}</p></section>`;
  const days = data.days || [];
  const low = days.length ? Math.round(Math.min(...days.map((d) => d.min))) : null;
  const high = days.length ? Math.round(Math.max(...days.map((d) => d.max))) : null;
  const suggestions = (data.suggestions || []).filter((s) => !trip.items.some((x) => x.selected && uniqueKey(x) === uniqueKey(s)));
  return `<section class="weather-card"><button class="weather-summary" data-action="toggle-weather"><span>目的地天气 · ${escapeHTML(data.place)} <em>${ui.weatherExpanded ? "收起" : "查看详情"} →</em></span><strong>${days.length ? `${low}—${high}°` : "暂无预报"}</strong><small>${days.length ? `出行期间最高降水概率 ${Math.max(...days.map((d) => d.rain))}%` : "临近出发再查看"}${suggestions.length ? ` · 可备${escapeHTML(suggestions.map((s) => s.name).join("、"))}` : ""}</small></button>${ui.weatherExpanded ? `<div class="weather-extra">${days.length ? `<div class="weather-days">${days.map((d) => `<div><span>${dateLabel(d.date)}</span><span>${weatherIcon(d.code)}</span><strong>${Math.round(d.max)}° / ${Math.round(d.min)}°</strong><small>降水 ${Math.round(d.rain)}%</small></div>`).join("")}</div>` : `<p class="weather-note">该行程日期暂无可用天气预报。</p>`}${suggestions.length && ui.tab === "confirm" ? `<div class="suggestions">${suggestions.map((s) => `<button data-action="add-weather-item" data-name="${escapeHTML(s.name)}" data-category="${escapeHTML(s.category)}"><strong>＋ ${escapeHTML(s.name)}</strong><small>${escapeHTML(s.reason)}</small></button>`).join("")}</div>` : ""}<p class="weather-note">${data.partial ? "部分日期尚无预报。" : ""}预报地点：${escapeHTML(data.place)} · 更新：${escapeHTML(new Date(data.updated).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }))} · 来源：<a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></p><button class="text-btn" data-action="retry-weather">刷新预报</button></div>` : ""}</section>`;
}
function renderModal() {
  if (!ui.modal) return "";
  const m = ui.modal;
  if (m.type === "edit-trip") {
    const trip = getTrip();
    if (!trip) return "";
    return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">编辑行程</h2><button class="modal-close" data-action="close-modal" aria-label="关闭">×</button></div><form id="edit-trip-form"><div class="field"><label for="edit-trip-name">行程名称</label><input id="edit-trip-name" name="name" maxlength="40" value="${escapeHTML(trip.name)}" required></div><div class="field"><label for="edit-trip-destination">目的地</label><input id="edit-trip-destination" name="destination" maxlength="60" value="${escapeHTML(trip.destination)}" required></div><div class="field-grid"><div class="field"><label for="edit-trip-start">出发日期</label><input id="edit-trip-start" name="startDate" type="date" value="${escapeHTML(trip.startDate)}" required></div><div class="field"><label for="edit-trip-end">返程日期</label><input id="edit-trip-end" name="endDate" type="date" value="${escapeHTML(trip.endDate || "")}"></div></div><div class="modal-actions"><button class="btn ghost" type="button" data-action="close-modal">取消</button><button class="btn primary" type="submit">保存行程</button></div></form></div></div>`;
  }
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
  return [trip.id, trip.destination, trip.startDate, trip.endDate || ""].join("|");
}
function weatherIcon(code) {
  if ([0, 1].includes(code)) return "☀️";
  if ([2, 3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "🌧️";
  return "⛅";
}
async function fetchJSON(url, options = {}) {
  const { timeoutMs = 12000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "网络请求失败，请稍后重试。");
    }
    return await response.json();
  } finally { clearTimeout(timer); }
}
async function directWeather(trip) {
  const terms = [...new Set(trip.destination.split(/[·•,/，、\s]+/).filter((x) => x.length >= 2))].reverse();
  let place;
  for (const term of terms.length ? terms : [trip.destination]) {
    const geo = await fetchJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=5&language=zh&format=json`);
    place = geo.results?.find((x) => x.name === term) || geo.results?.[0];
    if (place) break;
  }
  if (!place) throw new Error("未找到目的地天气，请试试填写附近城市。");
  const forecast = await fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=16`);
  const daily = forecast.daily;
  if (!daily?.time) throw new Error("预报暂时不可用。");
  const end = trip.endDate || trip.startDate;
  const days = daily.time.map((date, i) => ({ date, code: daily.weather_code?.[i] ?? 0, max: daily.temperature_2m_max?.[i] ?? 0, min: daily.temperature_2m_min?.[i] ?? 0, rain: daily.precipitation_probability_max?.[i] ?? 0 })).filter((d) => d.date >= trip.startDate && d.date <= end);
  const suggestions = [];
  const hiking = /雨崩|徒步|登山|露营/.test(`${trip.name} ${trip.destination}`);
  if (days.some((d) => d.rain >= 50 || [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(d.code))) suggestions.push({ name: hiking ? "雨衣" : "折叠伞", category: hiking ? "徒步/活动装备" : "随身物品", reason: "出行期间可能有雨" });
  if (days.some((d) => d.min <= 10)) suggestions.push({ name: "保暖外套", category: "衣物鞋帽", reason: "出行期间气温较低" });
  if (days.some((d) => d.max >= 30)) suggestions.push({ name: "防晒霜", category: "洗护", reason: "出行期间天气较热" });
  return { place: [place.name, place.admin1].filter(Boolean).join(" · "), days, suggestions, updated: new Date().toISOString(), partial: !days.length || days[0].date > trip.startDate || days.at(-1).date < end };
}
async function ensureWeather(trip = getTrip(), force = false) {
  if (!trip) return;
  const key = weatherKey(trip);
  if (!force && ui.weather[key]) return;
  ui.weather[key] = { status: "loading" };
  render();
  try {
    const params = new URLSearchParams({ destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate || trip.startDate });
    let data;
    try { data = await fetchJSON(`/api/weather?${params}`); }
    catch { data = await directWeather(trip); }
    ui.weather[key] = { ...data, status: "ready" };
  } catch (error) {
    ui.weather[key] = { status: "error", message: error.name === "AbortError" ? "天气请求超时，清单仍可正常使用。" : error.message || "天气暂时不可用，清单仍可正常使用。" };
  }
  if ((ui.view === "detail" && ui.tripId === trip.id) || (ui.view === "home" && nextTrip()?.id === trip.id)) render();
}
async function checkCapabilities() {
  try {
    const data = await fetchJSON("/api/health");
    ui.aiAvailable = data.aiAvailable === true;
    if (ui.view === "create") { captureDraft(); render(); }
  } catch { ui.aiAvailable = false; }
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
    ui.createDraft = null;
    ui.method = "template";
    ui.aiError = "";
    return navigate("create");
  }
  if (action === "new-hiking-trip") {
    ui.prefillTemplateId = null;
    ui.createDraft = { name: "", destination: "", startDate: "", endDate: "", type: "travel", templateId: "base-general", scenes: ["hiking"], notes: "", useWeather: true };
    ui.method = "template";
    return navigate("create");
  }
  if (action === "open-trip") return navigate("detail", { tripId: id });
  if (action === "choose-method") {
    captureDraft();
    ui.method = el.dataset.method === "ai" && ui.aiAvailable ? "ai" : "template";
    ui.aiError = "";
    return render();
  }
  if (action === "edit-trip") return showModal({ type: "edit-trip" });
  if (action === "toggle-weather") {
    ui.weatherExpanded = !ui.weatherExpanded;
    return render();
  }
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
  if (action === "set-filter") {
    ui.filter = ["all", "unfinished", "later"].includes(el.dataset.filter) ? el.dataset.filter : "all";
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
  if (action === "retry-weather") return ensureWeather(trip, true);
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
        source: "weather",
      });
    save();
    return render();
  }
  if (action === "regenerate-ai") {
    if (!trip || !ui.aiAvailable || !confirm("重新生成会替换当前候选清单和装包记录，继续吗？")) return;
    ui.generating = true;
    render();
    fetchJSON("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, notes: trip.aiNotes || "", useWeather: trip.useWeather !== false }), timeoutMs: 35000 })
      .then((result) => { trip.items = mergeItems([result.items.map((x) => ({ ...x, source: "ai" }))]); trip.stage = "confirm"; ui.tab = "confirm"; save(); })
      .catch((error) => alert(error.message || "AI 暂时无法生成，请稍后重试。"))
      .finally(() => { ui.generating = false; render(); });
    return;
  }
  if (action === "save-as-template")
    return showModal({ type: "save-trip-template" });
  if (action === "new-template") return showModal({ type: "template-name" });
  if (action === "use-template") {
    ui.prefillTemplateId = id;
    ui.createDraft = null;
    ui.method = "template";
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

document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const data = new FormData(form);
  if (form.id === "create-trip-form") {
    if (ui.generating) return;
    captureDraft();
    const name = cleanText(data.get("name")),
      destination = cleanText(data.get("destination")),
      startDate = String(data.get("startDate") || ""),
      endDate = String(data.get("endDate") || ""),
      templateId = String(data.get("templateId") || "");
    if (!name || !destination || !startDate)
      return alert("请填写行程名称、目的地和出发日期。");
    if (endDate && endDate < startDate)
      return alert("返程日期不能早于出发日期。");
    let items;
    const method = ui.method === "ai" && ui.aiAvailable ? "ai" : "template";
    const sceneIds = data.getAll("scene").map(String);
    if (method === "ai") {
      ui.generating = true;
      ui.aiError = "";
      render();
      try {
        const result = await fetchJSON("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, destination, startDate, endDate, notes: String(data.get("notes") || ""), useWeather: data.has("useWeather") }), timeoutMs: 35000 });
        items = mergeItems([result.items.map((x) => ({ ...x, source: "ai" }))]);
      } catch (error) {
        ui.aiError = error.message || "AI 暂时无法生成，请稍后重试。";
        ui.generating = false;
        return render();
      }
      ui.generating = false;
    } else {
      const template = getTemplate(templateId);
      if (!template) return alert("请选择一个基础模板。");
      items = mergeItems([
        templateItems(template),
        ...SCENES.filter((x) => sceneIds.includes(x.id)).map((x) => x.items),
      ]);
    }
    const trip = {
      id: uid(),
      name,
      destination,
      startDate,
      endDate,
      type: String(data.get("type") || "travel"),
      templateId: method === "template" ? templateId : null,
      sceneIds,
      source: method,
      aiNotes: method === "ai" ? String(data.get("notes") || "") : "",
      useWeather: data.has("useWeather"),
      stage: "confirm",
      items,
      createdAt: Date.now(),
    };
    state.trips.push(trip);
    save();
    ui.prefillTemplateId = null;
    ui.createDraft = null;
    return navigate("detail", { tripId: trip.id });
  }
  if (form.id === "edit-trip-form") {
    const trip = getTrip();
    if (!trip) return;
    const name = cleanText(data.get("name")), destination = cleanText(data.get("destination"));
    const startDate = String(data.get("startDate") || ""), endDate = String(data.get("endDate") || "");
    if (!name || !destination || !startDate || (endDate && endDate < startDate)) return alert("请填写有效的行程信息，返程日期不能早于出发日期。");
    Object.assign(trip, { name, destination, startDate, endDate });
    save();
    ui.modal = null;
    render();
    ensureWeather(trip, true);
    return;
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
checkCapabilities();
ensureWeather(nextTrip());
