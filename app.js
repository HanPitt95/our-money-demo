(function () {
  "use strict";

  // ══ Config ══════════════════════════════════════════════════════════════
  var ADULT_ISA_ALLOWANCE = 20000, LISA_ALLOWANCE = 4000, JUNIOR_ISA_ALLOWANCE = 9000;

  var GROUPS = {
    property: { side: "asset", label: "Property", one: "property", icon: "home", cat: "property", valueLabel: "Estimated value", providerLabel: "Location" },
    isa:      { side: "asset", label: "ISAs", one: "ISA", icon: "wallet", cat: "investments", valueLabel: "Current value", providerLabel: "Provider" },
    pension:  { side: "asset", label: "Pensions", one: "pension", icon: "landmark", cat: "pensions", valueLabel: "Current value", providerLabel: "Provider" },
    general:  { side: "asset", label: "General investing", one: "investment", icon: "chart", cat: "investments", valueLabel: "Current value", providerLabel: "Provider" },
    cash:     { side: "asset", label: "Cash & savings", one: "account", icon: "pound", cat: "cash", valueLabel: "Balance", providerLabel: "Bank" },
    other:    { side: "asset", label: "Other assets", one: "asset", icon: "box", cat: "other", valueLabel: "Estimated value", providerLabel: "Notes" },
    mortgage: { side: "liab", label: "Mortgage", one: "mortgage", icon: "home", valueLabel: "Amount left to pay", providerLabel: "Lender" },
    loan:     { side: "liab", label: "Loans", one: "loan", icon: "receipt", valueLabel: "Amount left to pay", providerLabel: "Lender" },
    credit:   { side: "liab", label: "Credit cards", one: "credit card", icon: "card", valueLabel: "Balance owed", providerLabel: "Card provider" }
  };
  var WCATS = [{ key: "property", label: "Property", c: "--asset-property" }, { key: "pensions", label: "Pensions", c: "--asset-pensions" }, { key: "investments", label: "ISAs & investments", c: "--asset-investments" }, { key: "cash", label: "Cash & savings", c: "--asset-cash" }, { key: "other", label: "Other", c: "--asset-other" }];
  var ISA_TYPES = { ss: "Stocks & shares ISA", cash: "Cash ISA", lisa: "Lifetime ISA", jisa: "Junior ISA" };

  // Spending categories
  var CATS = [
    ["groceries", "Groceries", "cart"], ["eating", "Eating out", "cup"], ["transport", "Transport", "car"],
    ["bills", "Bills & utilities", "receipt"], ["housing", "Housing", "home"], ["shopping", "Shopping", "bag"],
    ["children", "Children", "smile"], ["health", "Health & wellbeing", "heart"], ["entertainment", "Entertainment", "ticket"],
    ["travel", "Travel & holidays", "plane"], ["personal", "Personal care", "sparkle"], ["gifts", "Gifts & giving", "gift"],
    ["pets", "Pets", "paw"], ["fees", "Fees & charges", "pound"], ["general", "General", "box"],
    ["income", "Income", "arrowdown"], ["transfers", "Transfers between accounts", "swap"]
  ];
  var CAT = {}; CATS.forEach(function (c) { CAT[c[0]] = { key: c[0], label: c[1], icon: c[2] }; });
  var SPEND_CATS = CATS.filter(function (c) { return c[0] !== "income" && c[0] !== "transfers"; }).map(function (c) { return c[0]; });
  var POT_ICONS = ["cart", "cup", "car", "home", "receipt", "bag", "smile", "heart", "ticket", "plane", "gift", "paw", "shield", "sparkle", "wallet"];

  var KEYWORDS = [
    ["transfers", /\b(transfer|tfr|to pot|from pot|pot transfer|savings pot|standing order to|payment received|payment thank you|thank you for your payment|amex|american express|barclaycard|mbna|capital one|credit card|vanguard|moneybox|trading 212|nutmeg|premium bonds|ns&i|chip)\b/],
    ["groceries", /\b(tesco|sainsbury|asda|aldi|lidl|waitrose|ocado|morrisons|co-?op|iceland|m&s food|whole foods|farmfoods|budgens|spar|abel & cole|riverford|milk ?& ?more|getir|gopuff)\b/],
    ["eating", /\b(deliveroo|uber ?eats|just ?eat|pret|costa|starbucks|caffe nero|nero|greggs|nando'?s|pizza|restaurant|cafe|café|coffee|bakery|pub|tavern|kitchen|burger|wagamama|dishoom|leon|itsu|wasabi|mcdonald'?s|kfc|subway|five guys|honest burger|pizza express|franco manca)\b/],
    ["transport", /\b(tfl|transport for london|trainline|national rail|southern|thameslink|southeastern|gwr|lner|avanti|uber|bolt|addison lee|shell|bp|esso|texaco|petrol|parking|ringgo|paybyphone|dvla|zipcar|lime|pod point|ev charg|dart charge|ulez|congestion)\b/],
    ["bills", /\b(british gas|octopus|edf|e\.?on|ovo|scottish power|thames water|southern water|council tax|lb bromley|bromley|bt|bt group|virgin media|sky|ee|vodafone|o2|three|giffgaff|tv licen[cs]e|insurance|admiral|direct line|hastings|churchill|broadband|hyperoptic|community fibre|water|energy|electric|gas)\b/],
    ["housing", /\b(mortgage|rent|letting|lettings|estate agent|service charge|ground rent)\b/],
    ["shopping", /\b(amazon|amzn|argos|john lewis|ikea|ebay|etsy|zara|h&m|uniqlo|asos|primark|tk ?maxx|currys|apple store|screwfix|b&q|wickes|homebase|dunelm|matalan|marks|m&s|next|vinted)\b/],
    ["children", /\b(nursery|childcare|childminder|mothercare|jojo|smyths|toys|baby|kids|school|little ones|gymboree)\b/],
    ["health", /\b(boots|superdrug|pharmacy|chemist|dentist|dental|optician|specsavers|gym|puregym|nuffield|david lloyd|physio|bupa|vitality|nhs|yoga|pilates|better leisure)\b/],
    ["entertainment", /\b(netflix|spotify|disney|now tv|apple\.com|itunes|google play|youtube|audible|kindle|cinema|odeon|vue|everyman|picturehouse|ticketmaster|eventbrite|steam|playstation|xbox|prime video)\b/],
    ["travel", /\b(ryanair|easyjet|british airways|jet2|wizz|airbnb|booking\.com|expedia|hotel|premier inn|travelodge|eurostar|trip\.com|hostel|holiday|ferry|trenitalia|italo)\b/],
    ["personal", /\b(hair|barber|salon|nails|beauty|spa|lush|sephora|aesop)\b/],
    ["gifts", /\b(charity|donation|justgiving|gofundme|moonpig|funky pigeon|oxfam|red cross|interflora|gift)\b/],
    ["pets", /\b(pets at home|vet|vets|petplan|tails\.com|butternut|zooplus|pet|dog|groomer|groomers)\b/],
    ["fees", /\b(fee|fees|overdraft|interest charged|late payment|non-sterling|foreign transaction)\b/]
  ];
  var BANK_CAT = {
    groceries: "groceries", "eating out": "eating", eating_out: "eating", transport: "transport", bills: "bills",
    "bills and services": "bills", bills_and_services: "bills", entertainment: "entertainment", shopping: "shopping",
    holidays: "travel", travel: "travel", general: "general", expenses: "general", family: "children",
    "personal care": "personal", personal_care: "personal", charity: "gifts", gifts: "gifts", finances: "fees",
    savings: "transfers", transfers: "transfers", transfer: "transfers", income: "income", salary: "income",
    cash: "general", pets: "pets", home: "housing", housing: "housing", lifestyle: "general", healthcare: "health",
    health: "health", "health and beauty": "health", fitness: "health"
  };

  // ══ State ═══════════════════════════════════════════════════════════════
  var S = {
    page: "home", month: null,
    items: {}, accounts: {}, txdocs: {}, pots: {}, goals: {}, todos: {}, costs: {}, budgets: {}, model: null, wgSel: null,
    household: { household: "Our household", p1: "Hannah", p2: "Louis" },
    history: { points: {} }, rules: {}, billsIgnore: [],
    loaded: false, mode: "connecting", canWrite: true,
    wealthTab: "overview", wealthFilter: "all", famTab: "overview",
    txq: { q: "", month: "", who: "all", cat: "all", acc: "all" }
  };
  var STORE = { items: "items", accounts: "accounts", tx: "txdocs", pots: "pots", goals: "goals", todos: "todos", costs: "costs" };
  var db = null, myId = null, txCache = null;

  // ══ Helpers ═════════════════════════════════════════════════════════════
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function gbp(n, dp) { var v = Number(n) || 0; return "£" + Math.abs(v).toLocaleString("en-GB", { minimumFractionDigits: dp || 0, maximumFractionDigits: dp || 0 }); }
  function gbp2(n) { return gbp(n, 2); }
  function signed(n, dp) { return (n >= 0 ? "+" : "−") + gbp(n, dp); }
  function parseMoney(s) {
    if (s == null) return null;
    var t = String(s).trim(), neg = false;
    if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1); }
    if (/\bDR$/i.test(t)) { neg = true; t = t.replace(/\s*DR$/i, ""); }
    t = t.replace(/\s*CR$/i, "").replace(/[£$€,\s]/g, "");
    if (t === "" || t === "-") return null;
    var v = Number(t); if (!isFinite(v)) return NaN;
    v = Math.round(v * 100) / 100; return neg ? -Math.abs(v) : v;
  }
  function icon(name, cls) { return '<svg class="ico' + (cls ? " " + cls : "") + '"><use href="#i-' + name + '"/></svg>'; }
  function sumV(arr) { return arr.reduce(function (s, i) { return s + (Number(i.value) || 0); }, 0); }
  function monthKey(d) { d = d || new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
  function monthLabel(key, fmt) { var p = key.split("-"); var d = new Date(+p[0], +p[1] - 1, 1); return d.toLocaleDateString("en-GB", fmt === "long" ? { month: "long", year: "numeric" } : fmt === "year" ? { month: "short", year: "numeric" } : { month: "short" }); }
  function addMonths(key, n) { var p = key.split("-"); var d = new Date(+p[0], +p[1] - 1 + n, 1); return monthKey(d); }
  function shortDate(iso) { var d = new Date(iso); return isNaN(d) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
  function txDate(d) {
    var today = new Date(), dt = new Date(d + "T12:00:00");
    var diff = Math.round((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())) / 864e5);
    if (diff === 0) return "Today"; if (diff === 1) return "Yesterday";
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function taxYear(d) { d = d || new Date(); var y = d.getFullYear(), from = d >= new Date(y, 3, 6) ? y : y - 1; return { label: from + "/" + String((from + 1) % 100).padStart(2, "0"), start: new Date(from, 3, 6) }; }
  function ownerName(o) { return o === "p1" ? S.household.p1 : o === "p2" ? S.household.p2 : "Joint"; }
  function newId(p) { return (p || "x") + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function vals(o) { return Object.keys(o).map(function (k) { return o[k]; }); }
  function bar(pct, cls) { pct = Math.max(0, Math.min(100, pct || 0)); return '<div class="bar"><span class="' + (cls || "") + '" style="width:' + pct + '%"></span></div>'; }
  function hash(str) { var h = 5381; for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function ordinal(n) { if (!n) return ""; var s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function dateOnlyFmt(d) { return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }); }

  // ══ Transactions: derive ═══════════════════════════════════════════════
  function cleanDesc(s) {
    return String(s || "")
      .replace(/\b\d{2}-\d{2}-\d{2}\b/g, " ")              // sort codes
      .replace(/\b\d{4}[\s*]*\d{4}[\s*]*\d{4}[\s*]*\d{4}\b/g, " ") // card numbers
      .replace(/[*xX]{4,}\d*/g, " ")
      .replace(/\b\d{5,}\b/g, " ")                          // long refs / account numbers
      .replace(/\s{2,}/g, " ").trim().slice(0, 60);
  }
  function merchantKey(m) {
    var k = String(m || "").toLowerCase()
      .replace(/[^a-z&' ]+/g, " ")
      .replace(/\b(card payment|payment to|payment from|direct debit|dd|so|bgc|bp|fpi|fpo|pos|cpt|contactless|visa|debit|purchase|ref|gbp|london|gb|uk|www|com|co|ltd|limited|plc|on|at|to|from)\b/g, " ")
      .replace(/\s+/g, " ").trim().split(" ").slice(0, 3).join(" ");
    return k || String(m || "").toLowerCase().trim().slice(0, 30) || "unknown";
  }
  function guessCat(desc, amount, bankCat) {
    if (bankCat) { var b = BANK_CAT[String(bankCat).toLowerCase().trim()]; if (b) { if (b === "income" && amount < 0) b = "general"; return b; } }
    var d = " " + String(desc || "").toLowerCase() + " ";
    for (var i = 0; i < KEYWORDS.length; i++) if (KEYWORDS[i][1].test(d)) return KEYWORDS[i][0];
    if (amount > 0) return "income";
    return "general";
  }
  function effCat(t) { return t.o || S.rules[t.k] || t.c || "general"; }
  function allTx() {
    if (txCache) return txCache;
    var out = [];
    vals(S.txdocs).forEach(function (doc) {
      var acc = S.accounts[doc.acc]; if (!acc || !Array.isArray(doc.list)) return;
      doc.list.forEach(function (t, idx) {
        out.push({ d: t.d, a: t.a, m: t.m, k: t.k, c: t.c, o: t.o, h: t.h, idx: idx, doc: doc.id, acc: doc.acc, accName: acc.name, owner: acc.owner || "joint", cat: effCat(t) });
      });
    });
    out.sort(function (x, y) { return x.d < y.d ? 1 : x.d > y.d ? -1 : 0; });
    txCache = out; return out;
  }
  function dirtyTx() { txCache = null; }
  function txMonths() {
    var set = {}; allTx().forEach(function (t) { set[t.d.slice(0, 7)] = 1; });
    return Object.keys(set).sort();
  }
  function stats(txs) {
    var inc = 0, byCat = {};
    txs.forEach(function (t) {
      if (t.cat === "transfers") return;
      if (t.cat === "income") { inc += t.a; return; }
      byCat[t.cat] = (byCat[t.cat] || 0) - t.a;
    });
    var out = 0; Object.keys(byCat).forEach(function (k) { out += byCat[k]; });
    return { inc: inc, out: out, net: inc - out, byCat: byCat };
  }
  function inMonth(txs, m) { return txs.filter(function (t) { return t.d.slice(0, 7) === m; }); }
  function currentMonth() {
    var ms = txMonths();
    if (S.month && (ms.indexOf(S.month) >= 0 || S.month === monthKey())) return S.month;
    if (ms.indexOf(monthKey()) >= 0) return monthKey();
    return ms.length ? ms[ms.length - 1] : monthKey();
  }
  function monthSelect(sel) {
    var ms = txMonths(); if (ms.indexOf(monthKey()) < 0) ms.push(monthKey());
    ms = ms.slice().sort().reverse();
    return '<select class="btn btn-neutral" data-month aria-label="Month">' + ms.map(function (m) { return '<option value="' + m + '"' + (m === sel ? " selected" : "") + ">" + esc(monthLabel(m, "long")) + "</option>"; }).join("") + "</select>";
  }
  function upcomingBills() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var cutoff = addMonths(monthKey(), -4);
    var groups = {};
    allTx().forEach(function (t) {
      if (t.a >= 0 || t.cat === "transfers" || t.d.slice(0, 7) < cutoff) return;
      (groups[t.k] = groups[t.k] || []).push(t);
    });
    var list = [];
    Object.keys(groups).forEach(function (k) {
      if (S.billsIgnore.indexOf(k) >= 0) return;
      var g = groups[k], months = {};
      g.forEach(function (t) { months[t.d.slice(0, 7)] = (months[t.d.slice(0, 7)] || 0) + 1; });
      var mk = Object.keys(months); if (mk.length < 2) return;
      if (g.length / mk.length > 1.5) return;
      var amts = g.map(function (t) { return -t.a; }).sort(function (a, b) { return a - b; }), med = amts[Math.floor(amts.length / 2)];
      if (!g.every(function (t) { return Math.abs(-t.a - med) <= Math.max(2, med * 0.2); })) return;
      var days = g.map(function (t) { return +t.d.slice(8, 10); }).sort(function (a, b) { return a - b; }), day = days[Math.floor(days.length / 2)];
      var last = g[0].d; // allTx sorted desc
      var nm = addMonths(last.slice(0, 7), 1).split("-");
      var next = new Date(+nm[0], +nm[1] - 1, Math.min(day, new Date(+nm[0], +nm[1], 0).getDate()));
      var diff = Math.round((next - today) / 864e5);
      if (diff < -3 || diff > 35) return;
      list.push({ key: k, name: g[0].m, amount: med, date: next, days: diff, cat: g[0].cat });
    });
    return list.sort(function (a, b) { return a.date - b.date; });
  }

  // ══ Chrome ═════════════════════════════════════════════════════════════
  var root = el("root");
  function pageHead(title, sub, actions) {
    return '<div class="page-head"><div><h1>' + title + '</h1>' + (sub ? '<p class="sub muted">' + sub + "</p>" : "") + '</div><div class="head-actions">' + (actions || "") +
      '<button class="icon-btn mobile-only" data-action="settings" aria-label="Household settings">' + icon("sliders") + "</button></div></div>";
  }
  function renderChrome() {
    document.querySelectorAll("[data-page]").forEach(function (b) { if (b.getAttribute("data-page") === S.page) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    var n = el("notice");
    if (S.mode === "local") { n.hidden = false; n.innerHTML = "<strong>Not saving.</strong> Shared storage isn't available in this view, so anything you add disappears when you close it. Open the published link to save and share figures."; }
    else if (!S.canWrite && S.mode === "shared") { n.hidden = false; n.textContent = "Changes couldn't be saved. Sign out and back in, then try again."; }
    else n.hidden = true;
  }
  function render() {
    renderChrome();
    if (!S.loaded) return;
    var fn = { home: pageHome, transactions: pageTx, family: pageFamily, strategy: pageStrategy, wealth: pageWealth }[S.page] || pageHome;
    var y = window.scrollY;
    root.innerHTML = fn();
    window.scrollTo(0, y);
  }
  function go(page) { S.page = page; render(); window.scrollTo(0, 0); var h = root.querySelector("h1"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }

  // ══ Shared row renderers ════════════════════════════════════════════════
  function txRow(t, showOwner) {
    var c = CAT[t.cat] || CAT.general, pos = t.a > 0;
    return '<button type="button" class="tx-row" data-tx="' + esc(t.doc) + "|" + t.idx + '"' + (S.canWrite ? "" : " disabled") + ">" +
      '<div class="icon-tile sm' + (pos ? " ok" : "") + '">' + icon(c.icon) + "</div>" +
      '<div class="main"><p>' + esc(t.m || "Unknown") + '</p><p class="sm muted">' + esc(c.label) + ", " + esc(txDate(t.d)) +
      (showOwner ? '<span class="owner-chip">' + esc(t.accName) + "</span>" : "") + "</p></div>" +
      '<span class="amt ' + (pos ? "pos" : "") + '">' + (pos ? "+" : "−") + gbp2(t.a) + "</span></button>";
  }
  function emptyImport(msg) {
    return '<div class="card"><h2 class="mb-md">Bring in your transactions</h2><p class="muted mb-lg">' + (msg || "Download a CSV statement from each of your banking apps or websites and import it here. Most UK banks offer this under statements or exports.") + "</p>" +
      (S.canWrite ? '<button class="btn btn-primary" data-action="import">' + icon("upload") + "Import a CSV</button>" : "") + "</div>";
  }

  // ══ Page: Home ═════════════════════════════════════════════════════════
  function pageHome() {
    var txs = allTx(), m = currentMonth(), hl = txs.length ? health(m, txs) : null;
    var sub = esc(dateOnlyFmt(new Date())) + (hl && hl.checks.length >= 2 ? " · " + esc(healthLabel(hl.score)) : "");
    var head = pageHead(esc(S.household.household), sub,
      (txs.length ? monthSelect(m) : "") + (S.canWrite ? '<button class="btn btn-neutral" data-action="addtx">' + icon("plus") + 'Add transaction</button><button class="btn btn-primary" data-action="import">' + icon("upload") + "Import</button>" : ""));
    var html = head;
    if (!txs.length) {
      return html + '<div class="stack">' + emptyImport() + '<div class="grid g2">' + wealthGrowthCard() + goalsCard() + "</div>" + todosCard() + costsCard() + "</div>";
    }
    var st = stats(inMonth(txs, m)), prev = stats(inMonth(txs, addMonths(m, -1)));
    var change = prev.inc || prev.out ? st.net - prev.net : null;
    var hero = '<div class="hero"><div class="row-between mb-md"><button type="button" class="hero-title" data-page="strategy">Net cashflow, ' + esc(monthLabel(m, "long")) + " " + icon("chev") + "</button>" +
      (change != null ? '<span class="badge">' + (change >= 0 ? "↑ " : "↓ ") + gbp(change) + " vs " + esc(monthLabel(addMonths(m, -1))) + "</span>" : "") + "</div>" +
      '<p class="big num">' + signed(st.net) + '</p><p class="sm mt-xs">Money in ' + gbp(st.inc) + ", money out " + gbp(st.out) + "</p>" + heroSpark(txs, m) + healthBlock(m, txs) + "</div>";
    html += '<div class="grid g3" style="margin-bottom:24px">' + hero + cashflowCard(txs, m) + wealthGrowthCard() + "</div>";
    html += '<div class="grid g3" style="margin-bottom:24px"><div class="span2">' + budgetCard(txs, m) + "</div>" + goalsCard() + "</div>";
    html += '<div style="margin-bottom:24px">' + todosCard() + "</div>";
    html += '<div style="margin-bottom:24px">' + costsCard() + "</div>";
    var recent = inMonth(txs, m).slice(0, 7);
    html += '<div class="grid g2"><div class="card"><div class="sec-head"><h2>Recent transactions</h2><button class="btn btn-subtle" data-go-tx="">All ' + icon("chev") + "</button></div>" +
      (recent.length ? '<div class="rows">' + recent.map(function (t) { return txRow(t, true); }).join("") + "</div>" : '<p class="muted">Nothing in ' + esc(monthLabel(m, "long")) + " yet.</p>") + "</div>" + billsCard() + "</div>";
    return html;
  }

  function smoothPath(pts) {
    if (pts.length < 2) return "";
    var d = "M " + pts[0][0] + " " + pts[0][1];
    for (var i = 1; i < pts.length; i++) { var p0 = pts[i - 1], p1 = pts[i], cx = ((p0[0] + p1[0]) / 2).toFixed(1); d += " C " + cx + " " + p0[1] + ", " + cx + " " + p1[1] + ", " + p1[0] + " " + p1[1]; }
    return d;
  }
  function heroSpark(txs, m) {
    var ms = txMonths().filter(function (k) { return k <= m; }).slice(-9); if (ms.length < 2) return "";
    var d = ms.map(function (k) { return stats(inMonth(txs, k)); });
    var max = Math.max.apply(null, d.map(function (s) { return Math.max(s.inc, s.out); })) || 1;
    function line(key) { return d.map(function (s, i) { return [Math.round(i / (d.length - 1) * 240), Math.round(25 - Math.max(0, s[key]) / max * 21)]; }); }
    return '<svg viewBox="0 0 240 28" class="spark" preserveAspectRatio="none" role="img" aria-label="Money in and out over the last ' + ms.length + ' months"><path d="' + smoothPath(line("inc")) + '" fill="none" stroke="rgba(255,255,255,0.95)" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + smoothPath(line("out")) + '" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>' +
      '<p class="sm spark-key"><i></i>In <i class="out"></i>Out, last ' + ms.length + " months</p>";
  }

  function cashflowCard(txs, sel) {
    var ms = txMonths(), last = ms[ms.length - 1]; if (sel > last) last = sel;
    var months = []; for (var i = 8; i >= 0; i--) { var k = addMonths(last, -i); if (k >= ms[0]) months.push(k); }
    var data = months.map(function (k) { var s = stats(inMonth(txs, k)); return { m: k, inc: s.inc, out: s.out }; });
    var cur = data.filter(function (d) { return d.m === sel; })[0] || { inc: 0, out: 0 };
    var VW = 420, VH = 250, PL = 40, PR = 8, PT = 12, PB = 26, pw = VW - PL - PR, ph = VH - PT - PB, base = PT + ph;
    var maxRaw = Math.max(1, Math.max.apply(null, data.map(function (d) { return Math.max(d.inc, d.out); })));
    var step = Math.pow(10, Math.floor(Math.log10(maxRaw))), nice = [1, 2, 2.5, 5, 10].map(function (x) { return x * step; }).filter(function (x) { return x * 4 >= maxRaw; })[0] || step * 10;
    var maxV = nice * 4, slot = pw / Math.max(1, data.length), bw = Math.min(14, slot / 3), gap = 3;
    function y(v) { return base - (Math.max(0, v) / maxV) * ph; }
    function cx(i) { return PL + slot * (i + 0.5); }
    var svg = '<svg viewBox="0 0 ' + VW + " " + VH + '" role="img" aria-label="Money in and out by month">';
    for (var g = 0; g <= 4; g++) { var v = nice * g; svg += '<line x1="' + PL + '" x2="' + (VW - PR) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--border-primary)"/><text x="' + (PL - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="var(--text-tertiary)">£' + (v >= 1000 ? (v / 1000) + "k" : v) + "</text>"; }
    data.forEach(function (d, i) {
      svg += '<g opacity="' + (d.m === sel ? 1 : 0.45) + '"><rect x="' + (cx(i) - bw - gap / 2) + '" y="' + y(d.inc) + '" width="' + bw + '" height="' + (base - y(d.inc)) + '" rx="3" fill="var(--chart-in)"/>' +
        '<rect x="' + (cx(i) + gap / 2) + '" y="' + y(d.out) + '" width="' + bw + '" height="' + (base - y(d.out)) + '" rx="3" fill="var(--chart-out)"/></g>';
    });
    var pts = data.map(function (d, i) { return [+cx(i).toFixed(1), +Math.max(PT, Math.min(base, base - ((d.inc - d.out) / maxV) * ph)).toFixed(1)]; });
    if (pts.length > 1) svg += '<path d="' + smoothPath(pts) + '" fill="none" stroke="var(--text-primary)" stroke-width="1.25"/>';
    pts.forEach(function (p, i) { svg += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (data[i].m === sel ? 4 : 2.5) + '" fill="var(--surface-bg)" stroke="var(--text-primary)" stroke-width="1.25"/>'; });
    data.forEach(function (d, i) {
      svg += '<text x="' + cx(i) + '" y="' + (base + 18) + '" text-anchor="middle" font-size="11" font-weight="' + (d.m === sel ? 700 : 400) + '" fill="' + (d.m === sel ? "var(--text-primary)" : "var(--text-secondary)") + '">' + esc(monthLabel(d.m).slice(0, 3)) + "</text>";
      svg += '<rect class="hit" data-pick-month="' + d.m + '" x="' + (PL + slot * i) + '" y="' + PT + '" width="' + slot + '" height="' + (ph + PB) + '" fill="transparent"><title>' + esc(monthLabel(d.m, "long")) + ": in " + gbp(d.inc) + ", out " + gbp(d.out) + "</title></rect>";
    });
    svg += "</svg>";
    return '<div class="card chart"><div class="mb-md"><h2>Cashflow</h2><p class="sm muted mt-xs">Money in vs money out. Tap a month to see it.</p></div>' +
      '<div class="grid g2 mb-md" style="gap:10px"><div class="tile row-between"><div><p class="sm muted">Money in</p><p class="num" style="font-size:17px;font-weight:600">' + gbp(cur.inc) + '</p></div><div class="icon-tile sm" style="color:var(--chart-in)">' + icon("arrowdown") + "</div></div>" +
      '<div class="tile row-between"><div><p class="sm muted">Money out</p><p class="num" style="font-size:17px;font-weight:600">' + gbp(cur.out) + '</p></div><div class="icon-tile sm" style="color:var(--chart-out)">' + icon("arrowup") + "</div></div></div>" +
      '<div class="legend"><span><i style="background:var(--chart-in)"></i>In</span><span><i style="background:var(--chart-out)"></i>Out</span><span><i style="background:var(--text-primary);height:2px;width:14px"></i>Net</span></div>' + svg + "</div>";
  }

  // ── Wealth growth tile ───────────────────────────────────────────────────
  var ACLASSES = [["property", "Property", "--asset-property"], ["pensions", "Pensions", "--asset-pensions"], ["investments", "Investments", "--asset-investments"], ["cash", "Cash", "--asset-cash"], ["other", "Other", "--asset-other"], ["debt", "Debt paid off", "--asset-debt"]];
  function classTotals(items) {
    var c = { property: 0, pensions: 0, investments: 0, cash: 0, other: 0 }, debt = 0;
    items.forEach(function (i) { var G = GROUPS[i.group]; if (!G) return; if (G.side === "liab") debt += Number(i.value) || 0; else c[G.cat] += Number(i.value) || 0; });
    return { c: c, debt: debt };
  }
  function growthRows() {
    var pts = S.history.points || {}, keys = Object.keys(pts).filter(function (k) { return pts[k].c; }).sort(), rows = [];
    for (var i = 1; i < keys.length; i++) {
      var a = pts[keys[i - 1]], b = pts[keys[i]], v = {}, tot = 0;
      ["property", "pensions", "investments", "cash", "other"].forEach(function (k) { v[k] = (b.c[k] || 0) - (a.c[k] || 0); tot += v[k]; });
      v.debt = (a.l || 0) - (b.l || 0); tot += v.debt;
      rows.push({ m: keys[i], v: v, total: tot });
    }
    return rows.slice(-9);
  }
  function wealthGrowthCard() {
    var items = vals(S.items), ct = classTotals(items), assets = 0;
    Object.keys(ct.c).forEach(function (k) { assets += ct.c[k]; });
    var net = assets - ct.debt, rows = growthRows(), last = rows[rows.length - 1];
    var sel = rows.filter(function (r) { return r.m === S.wgSel; })[0] || last;
    var html = '<div class="card chart"><div class="row-between mb-md" style="align-items:flex-start;flex-wrap:wrap"><div><h2>Wealth</h2><p class="sm muted mt-xs">Net worth added by asset class each month</p></div>' +
      (sel ? '<div style="text-align:right"><p class="sm muted">' + esc(monthLabel(sel.m)) + " change</p><p class=\"num " + (sel.total >= 0 ? "pos" : "neg") + '" style="font-weight:600;font-size:16px">' + signed(sel.total) + "</p></div>" : "") + "</div>";
    if (!items.length) {
      return html + '<p class="muted mb-lg">Add what you own and owe on the Wealth page, then update it each month to see what\'s growing.</p><button class="btn btn-neutral" data-page="wealth">' + icon("chart") + "Go to Wealth</button></div>";
    }
    var prevNet = last ? net - last.total : null, pct = last && prevNet ? last.total / Math.abs(prevNet) * 100 : null;
    html += '<div class="grid g2 mb-md" style="gap:10px"><div class="tile"><p class="sm muted">Total net worth</p><p class="num" style="font-size:17px;font-weight:600">' + (net < 0 ? "−" : "") + gbp(net) + "</p></div>" +
      '<div class="tile row-between"><div><p class="sm muted">' + (last ? (last.m === monthKey() ? "This month" : esc(monthLabel(last.m))) : "This month") + '</p><p class="num" style="font-size:17px;font-weight:600">' + (last ? signed(last.total) : "—") + "</p></div>" +
      (pct != null ? '<span class="badge ' + (pct >= 0 ? "success" : "danger") + '">' + (pct >= 0 ? "↑ " : "↓ ") + Math.abs(pct).toFixed(1) + "%</span>" : "") + "</div></div>";
    if (!rows.length) {
      var comp = ACLASSES.slice(0, 5).filter(function (a) { return ct.c[a[0]] > 0; });
      return html + '<p class="sm muted mb-md">Where your assets are today. Update your figures on the Wealth page each month and this shows what grew.</p>' +
        '<div class="comp-bar" role="img" aria-label="Assets by class">' + comp.map(function (a) { return '<span style="width:' + (ct.c[a[0]] / assets * 100) + "%;background:var(" + a[2] + ')" title="' + a[1] + ": " + gbp(ct.c[a[0]]) + '"></span>'; }).join("") + "</div>" +
        '<div class="legend mt-md">' + comp.map(function (a) { return '<span><i style="background:var(' + a[2] + ')"></i>' + a[1] + " " + Math.round(ct.c[a[0]] / assets * 100) + "%</span>"; }).join("") + "</div></div>";
    }
    var used = ACLASSES.filter(function (a) { return rows.some(function (r) { return Math.abs(r.v[a[0]]) >= 1; }); });
    var maxPos = 1, maxNeg = 0;
    rows.forEach(function (r) { var p = 0, n = 0; used.forEach(function (a) { var x = r.v[a[0]]; if (x > 0) p += x; else n -= x; }); maxPos = Math.max(maxPos, p); maxNeg = Math.max(maxNeg, n); });
    var VW = 420, VH = 250, PL = 44, PR = 8, PT = 12, PB = 26, pw = VW - PL - PR, ph = VH - PT - PB, range = maxPos + maxNeg;
    var y0 = PT + ph * (maxPos / range), slot = pw / rows.length, bw = Math.min(30, slot * 0.55);
    function hgt(v) { return Math.abs(v) / range * ph; }
    function kf(v) { v = Math.abs(v); return v >= 1000 ? "£" + (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k" : "£" + Math.round(v); }
    var svg = '<svg viewBox="0 0 ' + VW + " " + VH + '" role="img" aria-label="Monthly change in net worth by asset class">' +
      '<line x1="' + PL + '" x2="' + (VW - PR) + '" y1="' + PT + '" y2="' + PT + '" stroke="var(--border-primary)"/><text x="' + (PL - 6) + '" y="' + (PT + 4) + '" text-anchor="end" font-size="11" fill="var(--text-tertiary)">' + kf(maxPos) + "</text>" +
      '<line x1="' + PL + '" x2="' + (VW - PR) + '" y1="' + y0 + '" y2="' + y0 + '" stroke="var(--text-tertiary)"/><text x="' + (PL - 6) + '" y="' + (y0 + 4) + '" text-anchor="end" font-size="11" fill="var(--text-tertiary)">£0</text>' +
      (maxNeg > 0 ? '<line x1="' + PL + '" x2="' + (VW - PR) + '" y1="' + (PT + ph) + '" y2="' + (PT + ph) + '" stroke="var(--border-primary)"/><text x="' + (PL - 6) + '" y="' + (PT + ph + 4) + '" text-anchor="end" font-size="11" fill="var(--text-tertiary)">−' + kf(maxNeg) + "</text>" : "");
    rows.forEach(function (r, i) {
      var cx = PL + slot * (i + 0.5), up = y0, down = y0, on = sel && r.m === sel.m;
      svg += '<g opacity="' + (on ? 1 : 0.5) + '">';
      used.forEach(function (a) {
        var v = r.v[a[0]]; if (Math.abs(v) < 1) return; var h = hgt(v);
        var yy = v > 0 ? (up -= h) : down; if (v < 0) down += h;
        svg += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(h - 1.5, 0.5).toFixed(1) + '" rx="2" fill="var(' + a[2] + ')"><title>' + esc(monthLabel(r.m, "long")) + ", " + a[1] + ": " + signed(v) + "</title></rect>";
      });
      svg += "</g>";
      svg += '<text x="' + cx + '" y="' + (VH - 6) + '" text-anchor="middle" font-size="11" font-weight="' + (on ? 700 : 400) + '" fill="' + (on ? "var(--text-primary)" : "var(--text-secondary)") + '">' + esc(monthLabel(r.m).slice(0, 3)) + "</text>";
      svg += '<rect class="hit" data-wg="' + r.m + '" x="' + (PL + slot * i) + '" y="' + PT + '" width="' + slot + '" height="' + (ph + PB) + '" fill="transparent"></rect>';
    });
    svg += "</svg>";
    var breakdown = sel ? '<div class="wg-break">' + used.filter(function (a) { return Math.abs(sel.v[a[0]]) >= 1; }).map(function (a) { return '<span><i style="background:var(' + a[2] + ')"></i>' + a[1] + " <b class=\"num\">" + signed(sel.v[a[0]]) + "</b></span>"; }).join("") + "</div>" : "";
    return html + '<div class="legend">' + used.map(function (a) { return '<span><i style="background:var(' + a[2] + ')"></i>' + a[1] + "</span>"; }).join("") + "</div>" + svg + breakdown + "</div>";
  }

  // ── Budgets by category ─────────────────────────────────────────────────
  function catAverages(txs, m) {
    var have = txMonths(), ms = [m, addMonths(m, -1), addMonths(m, -2)].filter(function (k) { return have.indexOf(k) >= 0; }), avg = {};
    ms.forEach(function (k) { var s = stats(inMonth(txs, k)); Object.keys(s.byCat).forEach(function (c) { avg[c] = (avg[c] || 0) + s.byCat[c] / ms.length; }); });
    return avg;
  }
  function budgetKeys() { return Object.keys(S.budgets).filter(function (k) { return S.budgets[k] > 0 && CAT[k]; }).sort(function (a, b) { return S.budgets[b] - S.budgets[a]; }); }
  function budgetCard(txs, m) {
    var st = stats(inMonth(txs, m)), keys = budgetKeys(), body;
    if (keys.length) {
      body = '<div class="stack" style="gap:16px">' + keys.map(function (k) {
        var spent = Math.max(0, st.byCat[k] || 0), b = S.budgets[k], pct = spent / b * 100, over = spent > b, near = !over && pct >= 85;
        return '<div class="row-between" style="gap:12px"><div class="icon-tile sm' + (over ? " danger" : "") + '">' + icon(CAT[k].icon) + '</div><div style="flex:1;min-width:0"><div class="row-between mb-xs"><span>' + esc(CAT[k].label) + '</span><span class="row-between" style="gap:8px"><span class="sm muted num">' + gbp(spent) + " / " + gbp(b) + "</span>" +
          (over ? '<span class="badge danger">Over</span>' : near ? '<span class="badge warning">Near limit</span>' : "") + "</span></div>" + bar(pct, over ? "over" : "") + "</div></div>";
      }).join("") + "</div>";
      var loose = Object.keys(st.byCat).filter(function (k) { return keys.indexOf(k) < 0 && st.byCat[k] > 0; }).reduce(function (s, k) { return s + st.byCat[k]; }, 0);
      if (loose > 0) body += '<p class="sm muted mt-lg">' + gbp(loose) + " spent in categories without a budget.</p>";
    } else if (txs.length) {
      var top = Object.keys(st.byCat).filter(function (k) { return st.byCat[k] > 0; }).sort(function (a, b) { return st.byCat[b] - st.byCat[a]; }).slice(0, 6), max = top.length ? st.byCat[top[0]] : 1;
      body = '<p class="muted mb-lg">Set a monthly budget for the categories that matter. Here\'s where the money went this month:</p><div class="stack" style="gap:14px">' + top.map(function (k) {
        return '<div class="row-between" style="gap:12px"><div class="icon-tile sm">' + icon(CAT[k].icon) + '</div><div style="flex:1;min-width:0"><div class="row-between mb-xs"><span>' + esc(CAT[k].label) + '</span><span class="sm muted num">' + gbp(st.byCat[k]) + "</span></div>" + bar(st.byCat[k] / max * 100) + "</div></div>";
      }).join("") + "</div>";
    } else body = '<p class="muted">Import some statements, then set a monthly budget for each kind of spending.</p>';
    return '<div class="card"><div class="sec-head"><h2>Budget by category</h2>' + (S.canWrite ? '<button class="btn btn-subtle" data-action="budgets">' + (keys.length ? "Edit budgets" : "Set budgets") + " " + icon("chev") + "</button>" : "") + "</div>" + body + "</div>";
  }
  function openBudgets() {
    var avg = catAverages(allTx(), currentMonth());
    openForm({
      title: "Monthly budgets",
      fields: [{ type: "html", html: '<p class="sm muted">Set a monthly limit for the categories you want to keep an eye on. Leave the rest blank. The typical figure is your average over the last three months.</p>' }].concat(
        SPEND_CATS.map(function (c) { return { name: "b_" + c, label: CAT[c].label + (avg[c] > 0 ? " (usually about " + gbp(avg[c]) + ")" : ""), type: "money", value: S.budgets[c] || "" }; })),
      onSave: function () {
        var map = {};
        for (var i = 0; i < SPEND_CATS.length; i++) {
          var c = SPEND_CATS[i], v = parseMoney(gv("b_" + c));
          if (v == null || v === 0) continue;
          if (isNaN(v) || v < 0) { gErr("b_" + c, "Enter an amount, or leave it blank."); return false; }
          map[c] = v;
        }
        S.budgets = map; saveMeta("budgets", { map: map });
      }
    });
  }

  // ── Upcoming costs & purchases ──────────────────────────────────────────
  function costsCard() {
    var cur = monthKey(), costs = vals(S.costs).sort(function (a, b) { var x = a.when || "9999-99", y = b.when || "9999-99"; return x < y ? -1 : x > y ? 1 : ((a.createdAt || "") < (b.createdAt || "") ? -1 : 1); });
    var total = costs.reduce(function (s, c) { return s + (c.amount || 0); }, 0);
    var soon = costs.filter(function (c) { return c.when && c.when <= addMonths(cur, 2); }).reduce(function (s, c) { return s + (c.amount || 0); }, 0);
    var form = S.canWrite ? '<form class="cost-form" data-cost-form><div class="field" style="flex:1 1 200px"><label for="costLabel">What\'s the cost?</label><input id="costLabel" placeholder="e.g. New washing machine" autocomplete="off"></div>' +
      '<div class="field" style="width:130px"><label for="costAmount">Estimate</label><div class="money"><input id="costAmount" inputmode="decimal" autocomplete="off" placeholder="0"></div></div>' +
      '<div class="field" style="width:170px"><label for="costWhen">When</label><input id="costWhen" type="month" min="' + cur + '"></div>' +
      '<button class="btn btn-primary" type="submit">' + icon("plus") + 'Add</button></form><p class="err" id="costErr" hidden></p>' : "";
    var list = costs.length ? '<div class="rows mb-lg">' + costs.map(function (c) {
      var badge = !c.when ? '<span class="badge default">Date to be confirmed</span>' : c.when < cur ? '<span class="badge warning">Was due ' + esc(monthLabel(c.when)) + "</span>" : '<span class="badge brand">' + esc(monthLabel(c.when, c.when.slice(0, 4) === cur.slice(0, 4) ? "" : "year")) + "</span>";
      return '<div class="tx-row" style="cursor:default"><div class="main" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span>' + esc(c.label) + "</span>" + badge + '</div><span class="amt">' + gbp(c.amount) + "</span>" +
        (S.canWrite ? '<button class="icon-btn" data-cost-todo="' + esc(c.id) + '" aria-label="Add to to-do">' + icon("listplus") + '</button><button class="icon-btn" data-cost-del="' + esc(c.id) + '" aria-label="Remove ' + esc(c.label) + '">' + icon("x") + "</button>" : "") + "</div>";
    }).join("") + "</div>" : '<p class="muted mb-lg">Nothing planned yet. Add car services, birthdays, school trips, a new boiler: anything you can see coming.</p>';
    return '<div class="card"><div class="sec-head" style="align-items:flex-start"><div><h2>Upcoming costs and purchases</h2><p class="sm muted mt-xs">Plan ahead: add costs to forecast what\'s coming</p></div>' + (costs.length ? '<span class="badge brand">' + costs.length + " planned</span>" : "") + "</div>" + form + list +
      '<div class="tile row-between"><div class="row-between" style="gap:10px;justify-content:flex-start"><span class="brand">' + icon("up") + '</span><div><p class="muted">Estimated upcoming spend</p>' + (soon && soon !== total ? '<p class="sm faint">' + gbp(soon) + " of it in the next three months</p>" : "") + '</div></div><span class="big">' + gbp(total) + "</span></div></div>";
  }

  // ── Manual transaction ──────────────────────────────────────────────────
  function openAddTx() {
    var accs = vals(S.accounts), hasCash = accs.some(function (a) { return a.name.toLowerCase() === "cash"; });
    var opts = accs.map(function (a) { return [a.id, a.name + " (" + ownerName(a.owner) + ")"]; }); if (!hasCash) opts.push(["__cash", "Cash (creates a joint cash account)"]);
    var today = new Date(), iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    openForm({
      title: "Add a transaction",
      fields: [
        { name: "desc", label: "Description", placeholder: "e.g. Window cleaner" },
        { name: "amount", label: "Amount", type: "money" },
        { name: "dir", label: "Type", type: "select", value: "out", options: [["out", "Money out"], ["in", "Money in"]] },
        { name: "date", label: "Date", type: "date", value: iso },
        { name: "cat", label: "Category", type: "select", value: "general", options: CATS.map(function (c) { return [c[0], c[1]]; }) },
        { name: "acc", label: "Account", type: "select", value: opts[0][0], options: opts }
      ],
      onSave: function () {
        var desc = gv("desc").trim(), amt = parseMoney(gv("amount")), d = gv("date");
        if (!desc) { gErr("desc", "Add a short description."); return false; }
        if (amt == null || isNaN(amt) || amt <= 0) { gErr("amount", "Enter an amount, like 24.50."); return false; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d || "")) { gErr("date", "Pick a date."); return false; }
        var accId = gv("acc");
        if (accId === "__cash") { accId = newId("a"); saveDoc("accounts", accId, { name: "Cash", bank: "", owner: "joint", kind: "current", balance: null, createdAt: new Date().toISOString() }); }
        var m = cleanDesc(desc) || desc.slice(0, 60), tx = { d: d, a: gv("dir") === "out" ? -Math.abs(amt) : Math.abs(amt), m: m, k: merchantKey(m), c: gv("cat"), h: hash("manual" + newId()) };
        var id = accId + "_" + d.slice(0, 7), ex = S.txdocs[id], list = ex && Array.isArray(ex.list) ? ex.list.slice() : [];
        list.push(tx); list.sort(function (x, y) { return x.d < y.d ? 1 : -1; });
        saveDoc("tx", id, { acc: accId, month: d.slice(0, 7), list: list }); S.month = d.slice(0, 7);
      }
    });
  }

  // ══ Page: Strategy ═════════════════════════════════════════════════════
  var SLIDERS = {
    inv: [["initial", "Starting amount", 0, 500000, 1000, "£"], ["monthly", "Monthly contribution", 0, 5000, 50, "£"], ["rate", "Expected yearly return", 0, 12, 0.5, "%"], ["years", "Time horizon", 1, 40, 1, "yrs"]],
    prop: [["value", "Current value", 10000, 2000000, 5000, "£"], ["rate", "Yearly growth", 0, 10, 0.25, "%"], ["years", "Time horizon", 1, 40, 1, "yrs"]]
  };
  var PROJ = [];
  function initModel() {
    if (S.model) return;
    var items = vals(S.items), inv = sumV(items.filter(function (i) { return i.group === "isa" || i.group === "general" || i.group === "pension"; }));
    var pm = items.filter(function (i) { return i.group === "pension"; }).reduce(function (s, i) { return s + (Number(i.pmonthly) || 0); }, 0);
    var prop = sumV(items.filter(function (i) { return i.group === "property"; }));
    S.model = { tab: S.model0tab || "inv", inv: { initial: inv > 0 ? Math.round(inv) : 20000, monthly: pm > 0 ? Math.round(pm) : 500, rate: 5, years: 20 }, prop: { value: prop > 0 ? Math.round(prop) : 350000, rate: 3, years: 20 }, from: { inv: inv > 0, pm: pm > 0, prop: prop > 0 } };
  }
  function fmtK(v) { return v >= 1e6 ? "£" + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + "m" : v >= 1000 ? "£" + (v / 1000).toFixed(v >= 100000 ? 0 : 1) + "k" : "£" + Math.round(v); }
  function projChart(pts, color, contrib) {
    PROJ = pts;
    var VW = 640, VH = 240, PL = 52, PR = 14, PT = 12, PB = 30, pw = VW - PL - PR, ph = VH - PT - PB, base = PT + ph;
    var maxV = Math.max.apply(null, pts.map(function (p) { return p.v; })) || 1, pow = Math.pow(10, Math.floor(Math.log10(maxV))), top = Math.ceil(maxV / pow) * pow;
    var span = Math.max(1, pts[pts.length - 1].y);
    function x(yr) { return PL + yr / span * pw; }
    function y(v) { return base - v / top * ph; }
    var line = pts.map(function (p, i) { return (i ? "L " : "M ") + x(p.y).toFixed(1) + " " + y(p.v).toFixed(1); }).join(" ");
    var svg = '<svg viewBox="0 0 ' + VW + " " + VH + '" role="img" aria-label="Projected value over ' + span + ' years"><defs><linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + color + '" stop-opacity="0.25"/><stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>';
    for (var g = 0; g <= 4; g++) { var gv2 = top / 4 * g; svg += '<line x1="' + PL + '" x2="' + (VW - PR) + '" y1="' + y(gv2) + '" y2="' + y(gv2) + '" stroke="var(--border-primary)"/><text x="' + (PL - 8) + '" y="' + (y(gv2) + 4) + '" text-anchor="end" font-size="11" fill="var(--text-tertiary)">' + fmtK(gv2) + "</text>"; }
    svg += '<path d="' + line + " L " + x(span).toFixed(1) + " " + base + " L " + x(0).toFixed(1) + " " + base + ' Z" fill="url(#projGrad)"/><path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>';
    if (contrib) svg += '<path d="' + pts.map(function (p, i) { return (i ? "L " : "M ") + x(p.y).toFixed(1) + " " + y(p.c).toFixed(1); }).join(" ") + '" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-dasharray="4 4"/>';
    var every = Math.ceil(pts.length / 8);
    pts.forEach(function (p, i) { if (i % every === 0 || i === pts.length - 1) svg += '<text x="' + x(p.y) + '" y="' + (base + 20) + '" text-anchor="middle" font-size="11" fill="var(--text-secondary)">Yr ' + p.y + "</text>"; });
    var lp = pts[pts.length - 1];
    svg += '<line id="projLine" x1="' + x(lp.y) + '" x2="' + x(lp.y) + '" y1="' + PT + '" y2="' + base + '" stroke="var(--text-tertiary)" stroke-dasharray="3 3" opacity="0"/><circle id="projDot" cx="' + x(lp.y) + '" cy="' + y(lp.v) + '" r="4.5" fill="var(--surface-bg)" stroke="' + color + '" stroke-width="2"/>';
    var band = pw / pts.length;
    pts.forEach(function (p, i) { svg += '<rect data-proj="' + i + '" data-x="' + x(p.y).toFixed(1) + '" data-y="' + y(p.v).toFixed(1) + '" x="' + (x(p.y) - band / 2).toFixed(1) + '" y="' + PT + '" width="' + band.toFixed(1) + '" height="' + ph + '" fill="transparent"/>'; });
    return '<p class="proj-read"><span class="sm muted" id="projYr">Year ' + lp.y + '</span> <span id="projVal" class="num">' + gbp(lp.v) + "</span>" + (contrib ? ' <span class="sm faint" id="projCon">(' + gbp(lp.c) + " put in)</span>" : "") + "</p>" + svg + "</svg>" +
      (contrib ? '<div class="legend mt-xs"><span><i style="background:' + color + '"></i>Projected value</span><span><i style="background:var(--text-tertiary);height:2px;width:14px"></i>Money put in</span></div>' : "");
  }
  function modelOut() {
    var mm = S.model;
    if (mm.tab === "inv") {
      var p = mm.inv, pts = [{ y: 0, v: p.initial, c: p.initial }], bal = p.initial, con = p.initial, mr = p.rate / 100 / 12;
      for (var yr = 1; yr <= p.years; yr++) { for (var k = 0; k < 12; k++) { bal = bal * (1 + mr) + p.monthly; con += p.monthly; } pts.push({ y: yr, v: Math.round(bal), c: Math.round(con) }); }
      return '<div class="grid g3 mb-md" style="gap:10px"><div class="tile"><p class="sm muted">Projected value</p><p class="brand" style="font-size:20px;font-weight:600">' + fmtK(bal) + '</p></div><div class="tile"><p class="sm muted">You put in</p><p style="font-size:20px;font-weight:600">' + fmtK(con) + '</p></div><div class="tile"><p class="sm muted">Growth</p><p class="pos" style="font-size:20px;font-weight:600">' + fmtK(Math.max(0, bal - con)) + "</p></div></div>" + projChart(pts, "var(--brand-primary)", true);
    }
    var q = mm.prop, v = q.value, pts2 = [{ y: 0, v: v }];
    for (var y2 = 1; y2 <= q.years; y2++) { v = v * (1 + q.rate / 100); pts2.push({ y: y2, v: Math.round(v) }); }
    return '<div class="grid g2 mb-md" style="gap:10px"><div class="tile"><p class="sm muted">Projected value</p><p class="brand" style="font-size:20px;font-weight:600">' + fmtK(v) + '</p></div><div class="tile"><p class="sm muted">Total growth</p><p class="pos" style="font-size:20px;font-weight:600">' + fmtK(v - q.value) + "</p></div></div>" + projChart(pts2, "var(--asset-property)", false);
  }
  function sliderHtml(g, s) {
    var v = S.model[g][s[0]], max = Math.max(s[3], s[5] === "£" ? Math.ceil(v * 2 / s[4]) * s[4] : s[3]), id = "sl-" + g + "-" + s[0];
    return '<div class="slider"><div class="row-between mb-xs"><label for="' + id + '">' + s[1] + '</label><span class="sl-num">' + (s[5] === "£" ? '<span class="muted">£</span>' : "") +
      '<input type="number" data-sl="' + g + "." + s[0] + '" min="' + s[2] + '" max="' + max + '" step="' + s[4] + '" value="' + v + '" aria-label="' + s[1] + '">' + (s[5] !== "£" ? '<span class="muted">' + s[5] + "</span>" : "") + "</span></div>" +
      '<input type="range" id="' + id + '" data-sl="' + g + "." + s[0] + '" min="' + s[2] + '" max="' + max + '" step="' + s[4] + '" value="' + v + '"></div>';
  }
  function insightTile(title, detail, good, key) {
    return '<div class="insight"><div class="icon-tile" style="color:' + (good ? "var(--success-text)" : "var(--warning-text)") + '">' + icon(good ? "checkcircle" : "alert") + '</div><div style="flex:1;min-width:0"><p style="font-weight:600">' + esc(title) + '</p><p class="sm muted mt-xs">' + esc(detail) + "</p></div>" +
      (key && S.canWrite ? (function () { var c = health(currentMonth(), allTx()).checks.filter(function (x) { return x.key === key; })[0], added = c && c.step && stepAdded(c.step.title); return '<button class="icon-btn" data-step-todo="' + key + '" aria-label="' + (added ? "Added to to-do" : "Add to to-do") + '"' + (added ? " disabled" : "") + ">" + icon(added ? "check" : "listplus") + "</button>"; })() : "") + "</div>";
  }
  function pageStrategy() {
    var txs = allTx(), m = currentMonth(), hl = health(m, txs), ok = hl.checks.length >= 2;
    initModel();
    var badge = ok ? '<span class="badge ' + (hl.score >= 60 ? "success" : hl.score >= 40 ? "warning" : "danger") + '">' + esc(healthLabel(hl.score)) + ", " + hl.score + "/100</span>" : "";
    var html = '<button class="btn btn-subtle back" data-page="home">' + icon("arrowleft") + "Back to dashboard</button>" + pageHead("Financial strategy", "Insights and forward modelling for " + esc(S.household.household), badge);
    var good = hl.checks.filter(function (c) { return c.score >= 75 && c.good; }), bad = hl.checks.filter(function (c) { return c.score < 75 && c.step; }).sort(function (a, b) { return a.score - b.score; });
    if (ok) {
      html += '<div class="grid g2" style="margin-bottom:24px"><div class="card"><div class="sec-head"><h2>What\'s going well</h2><span class="badge success">' + good.length + (good.length === 1 ? " win" : " wins") + '</span></div><div class="stack" style="gap:12px">' +
        (good.length ? good.map(function (c) { return insightTile(c.label, c.good, true); }).join("") : '<p class="muted">Nothing is in the green yet. The steps alongside are the best place to start.</p>') + "</div></div>" +
        '<div class="card"><div class="sec-head"><h2>What to improve</h2><span class="badge warning">' + bad.length + (bad.length === 1 ? " action" : " actions") + '</span></div><div class="stack" style="gap:12px">' +
        (bad.length ? bad.map(function (c) { return insightTile(c.step.title, c.step.detail, false, c.key); }).join("") : '<p class="muted">Every check is on track.</p>') + "</div></div></div>" +
        '<p class="sm faint" style="margin:-12px 0 24px">Based on UK rules of thumb, not personal financial advice. <button class="link" data-action="health">See how each check works</button></p>' + chatCard();
    } else {
      html += '<div class="card" style="margin-bottom:24px"><h2 class="mb-md">Insights</h2><p class="muted">Import a few months of statements and fill in the Wealth page, and personalised insights appear here: what\'s going well and what to improve.</p></div>' + chatCard();
    }
    var mm = S.model, from = mm.tab === "inv" ? (mm.from.inv ? "Starting amount is your ISAs, investments and pensions" + (mm.from.pm ? ", and monthly contribution is what goes into your pensions" : "") + "." : "") : (mm.from.prop ? "Starting value is your property on the Wealth page." : "");
    html += '<div class="card"><div><h2>Modelling</h2><p class="sm muted mt-xs">Adjust the assumptions to project future outcomes</p></div>' +
      '<div class="tabs" role="tablist" style="margin:16px 0 20px"><button type="button" role="tab" data-stab="inv" aria-selected="' + (mm.tab === "inv") + '">Investment growth</button><button type="button" role="tab" data-stab="prop" aria-selected="' + (mm.tab === "prop") + '">Property value</button></div>' +
      '<div class="model-grid"><div class="stack" style="gap:22px">' + SLIDERS[mm.tab].map(function (s) { return sliderHtml(mm.tab, s); }).join("") +
      (from ? '<p class="sm muted">' + from + "</p>" : "") + '<div><button class="btn btn-neutral" data-action="model-reset">Reset to my figures</button></div></div><div id="modelOut">' + modelOut() + "</div></div>" +
      '<p class="sm faint mt-lg">This assumes the same return every year. Real returns rise and fall, and these figures aren\'t adjusted for inflation, fees or tax, so treat them as a rough guide.</p></div>';
    return html;
  }

  function goalsCard() {
    var goals = vals(S.goals).sort(function (a, b) { return (a.createdAt || "") < (b.createdAt || "") ? -1 : 1; });
    return '<div class="card"><div class="sec-head"><h2>Savings goals</h2>' + (S.canWrite ? '<button class="icon-btn" data-action="goal" aria-label="Add savings goal">' + icon("plus") + "</button>" : "") + "</div>" +
      (goals.length ? '<div class="stack" style="gap:18px">' + goals.map(function (g) {
        var pct = g.target ? Math.min(100, g.saved / g.target * 100) : 0;
        return '<button type="button" class="item-row" style="padding:6px;align-items:flex-start" data-goal="' + esc(g.id) + '"' + (S.canWrite ? "" : " disabled") + '><div class="icon-tile sm">' + icon(g.icon || "target") + '</div><div style="flex:1;min-width:0"><div class="row-between mb-xs"><span>' + esc(g.name) + '</span><span class="sm brand" style="font-weight:600">' + Math.round(pct) + "%</span></div>" + bar(pct) +
          '<div class="row-between mt-xs"><span class="sm muted num">' + gbp(g.saved) + '</span><span class="sm faint num">of ' + gbp(g.target) + (g.by ? " by " + esc(monthLabel(g.by, "year")) : "") + "</span></div></div></button>";
      }).join("") + "</div>" : '<p class="muted">Holidays, a new car, a rainy-day fund. Add a goal and keep track together.</p>' + (S.canWrite ? '<button class="btn btn-neutral mt-md" data-action="goal">' + icon("plus") + "Add a goal</button>" : "")) + "</div>";
  }

  function todosCard() {
    var todos = vals(S.todos).sort(function (a, b) { return (a.done - b.done) || ((a.createdAt || "") < (b.createdAt || "") ? -1 : 1); });
    var left = todos.filter(function (t) { return !t.done; }).length;
    return '<div class="card"><div class="sec-head"><h2>To-do</h2>' + (todos.length ? '<span class="badge ' + (left ? "warning" : "success") + '">' + (left ? left + " to do" : "All done") + "</span>" : "") + "</div>" +
      (S.canWrite ? '<form class="add-row" data-todo-form><input id="todoInput" placeholder="Add a to-do…" aria-label="New to-do" autocomplete="off"><button class="btn btn-primary" type="submit">' + icon("plus") + "Add</button></form>" : "") +
      (todos.length ? todos.map(function (t) {
        return '<div class="todo' + (t.done ? " done" : "") + '"><label><input type="checkbox" data-todo-toggle="' + esc(t.id) + '"' + (t.done ? " checked" : "") + (S.canWrite ? "" : " disabled") + '><span class="txt">' + esc(t.label) + "</span></label>" +
          '<select data-todo-who="' + esc(t.id) + '" aria-label="Who\'s doing it"' + (S.canWrite ? "" : " disabled") + '><option value="">Anyone</option><option value="p1"' + (t.who === "p1" ? " selected" : "") + ">" + esc(S.household.p1) + '</option><option value="p2"' + (t.who === "p2" ? " selected" : "") + ">" + esc(S.household.p2) + "</option></select>" +
          (S.canWrite ? '<button class="icon-btn" data-todo-del="' + esc(t.id) + '" aria-label="Remove">' + icon("x") + "</button>" : "") + "</div>";
      }).join("") : '<p class="muted">Nothing on the list. Add something, or add an upcoming bill.</p>') + "</div>";
  }

  function billsCard() {
    var bills = upcomingBills().slice(0, 6);
    return '<div class="card"><div class="sec-head"><h2>Upcoming bills</h2>' + (bills.length ? '<span class="badge warning">' + bills.length + " due soon</span>" : "") + "</div>" +
      (bills.length ? '<div class="rows">' + bills.map(function (b) {
        var when = b.days < 0 ? "Usually by now" : b.days === 0 ? "Today" : b.days === 1 ? "Tomorrow" : "In " + b.days + " days";
        return '<div class="tx-row" style="cursor:default"><div class="icon-tile sm">' + icon("receipt") + '</div><div class="main"><p>' + esc(b.name) + '</p><p class="sm muted">Around ' + esc(b.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })) + ", " + when.toLowerCase() + "</p></div>" +
          '<span class="amt">' + gbp(b.amount, 2) + "</span>" + (S.canWrite ? '<button class="icon-btn" data-bill-todo="' + esc(b.key) + '" aria-label="Add to to-do">' + icon("listplus") + '</button><button class="icon-btn" data-bill-ignore="' + esc(b.key) + '" aria-label="Not a bill, hide it">' + icon("x") + "</button>" : "") + "</div>";
      }).join("") + '</div><p class="sm faint mt-md">Spotted from payments that repeat each month at a similar amount.</p>'
        : '<p class="muted">Regular payments show up here once you\'ve imported two or more months of statements.</p>') + "</div>";
  }

  // ══ Financial health ═══════════════════════════════════════════════════
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  function health(m, txs) {
    var have = txMonths(), months = [m, addMonths(m, -1), addMonths(m, -2)].filter(function (k) { return have.indexOf(k) >= 0; }), n = months.length || 1;
    var inc = 0, out = 0, byCat = {};
    months.forEach(function (k) { var s = stats(inMonth(txs, k)); inc += s.inc; out += s.out; Object.keys(s.byCat).forEach(function (c) { byCat[c] = (byCat[c] || 0) + s.byCat[c]; }); });
    inc /= n; out /= n; Object.keys(byCat).forEach(function (c) { byCat[c] /= n; });
    var essentials = ["housing", "bills", "groceries", "transport", "children", "health"].reduce(function (s, c) { return s + Math.max(0, byCat[c] || 0); }, 0);
    var items = vals(S.items), checks = [];

    if (inc > 0) {
      var r = (inc - out) / inc * 100, need = Math.max(0, inc * 0.2 - (inc - out));
      checks.push({ key: "save", w: 20, good: "You kept " + Math.round(r) + "% of income" + (months.length > 1 ? " over the last " + months.length + " months" : " this month") + ", above the 20% guide.", label: "Saving from income", value: (r < 0 ? "−" + Math.abs(Math.round(r)) : Math.round(r)) + "% of income kept", target: "20% or more", score: r >= 20 ? 100 : clamp(r / 20 * 70),
        source: "The 50/30/20 budgeting rule: half on needs, 30% on wants, 20% saved or used to clear debt.",
        step: r < 20 ? { icon: "wallet", title: "Keep 20% of what comes in", detail: "That's about " + gbp(inc * 0.2) + " a month, " + gbp(need) + " more than your recent average." } : null });
    }
    var wCash = sumV(items.filter(function (i) { return i.group === "cash"; })), cash = null, cashFrom = "";
    if (wCash > 0) { cash = wCash; cashFrom = "cash and savings on your balance sheet"; }
    else { var ab = accTotals(vals(S.accounts)).cash; if (ab != null) { cash = Math.max(0, ab); cashFrom = "your latest account balances"; } }
    if (essentials > 0 && cash != null) {
      var e = cash / essentials, gap = Math.max(0, essentials * 3 - cash);
      checks.push({ key: "buffer", w: 20, good: "Your savings cover about " + (Math.round(e * 10) / 10) + " months of essential spending.", label: "Emergency savings", value: (Math.round(e * 10) / 10) + " months of essentials", target: "3 to 6 months of essential spending", score: e < 3 ? e / 3 * 75 : 75 + Math.min(e - 3, 3) / 3 * 25,
        source: "MoneyHelper, the government-backed guidance service, suggests at least three months of essential outgoings. Essentials here are housing, bills, groceries, transport, children and health (" + gbp(essentials) + " a month). Savings figure: " + cashFrom + ".",
        step: e < 3 ? { icon: "shield", title: "Build a three-month safety net", detail: "About " + gbp(gap) + " more would cover three months of essentials." } : null });
    }
    var housing = Math.max(0, byCat.housing || 0);
    if (inc > 0 && housing > 0) {
      var h = housing / inc * 100;
      checks.push({ key: "housing", w: 10, good: "Housing is " + Math.round(h) + "% of take-home pay, within the 30% guide.", label: "Housing costs", value: Math.round(h) + "% of take-home pay", target: "Under 30% of take-home pay", score: h <= 30 ? 100 : clamp(70 - (h - 30) / 20 * 70),
        source: "A widely used affordability rule of thumb.",
        step: h > 30 ? { icon: "home", title: "Review your housing costs", detail: "Housing takes " + Math.round(h) + "% of take-home pay. When your mortgage deal ends, compare rates rather than rolling onto the lender's standard rate." } : null });
    }
    var unsec = sumV(items.filter(function (i) { return i.group === "loan" || i.group === "credit"; }));
    if (!items.some(function (i) { return i.group === "credit"; })) { var ct = accTotals(vals(S.accounts)).cards; if (ct) unsec += ct; }
    if (inc > 0 && (items.length || unsec > 0)) {
      var u = unsec / (inc * 12) * 100;
      checks.push({ key: "debt", w: 10, good: unsec <= 0 ? "No loans or card debt on your balance sheet." : "Loans and cards total " + gbp(unsec) + ", a manageable " + Math.round(u) + "% of a year's income.", label: "Loans and card debt", value: gbp(unsec) + ", " + Math.round(u) + "% of a year's income", target: "Under 10% of a year's take-home pay", score: u <= 10 ? 100 - u * 2.5 : clamp(75 - (u - 10) / 30 * 75),
        source: "A general rule of thumb for debt other than a mortgage. Paying off the highest-interest debt first saves the most.",
        step: u > 10 ? { icon: "card", title: "Clear the priciest debt first", detail: "You owe " + gbp(unsec) + " on loans and cards. Target the highest interest rate first while paying the minimum on the rest." } : null });
    }
    // Low credit use: balance sheet cards with limits, else imported card accounts with limits
    var cardSrc = items.filter(function (i) { return i.group === "credit" && i.limit; }).map(function (i) { return { bal: Number(i.value) || 0, lim: i.limit }; });
    if (!cardSrc.length) cardSrc = vals(S.accounts).filter(function (a) { return a.kind === "credit" && a.limit; }).map(function (a) { return { bal: Math.abs(a.balance || 0), lim: a.limit }; });
    if (cardSrc.length) {
      var lim = cardSrc.reduce(function (s, c) { return s + c.lim; }, 0), bal = cardSrc.reduce(function (s, c) { return s + c.bal; }, 0), ut = lim ? bal / lim * 100 : 0;
      checks.push({ key: "util", w: 10, good: "You're using just " + Math.round(ut) + "% of your card limits.", label: "Low credit use", value: Math.round(ut) + "% of " + gbp(lim) + " in limits used", target: "Under 30% of your limits, ideally paid off in full each month", score: ut <= 30 ? 100 : clamp(70 - (ut - 30) / 60 * 70),
        source: "Credit reference agencies suggest keeping balances below about 30% of your limits, as higher use can lower your credit score. Clearing the balance in full each month also avoids interest.",
        step: ut > 30 ? { icon: "card", title: "Bring card balances below 30%", detail: "Paying off about " + gbp(bal - lim * 0.3) + " would get you there." } : null });
    }

    // ISAs: is spare cash beyond the safety net sheltered from tax?
    var people = ["p1", "p2"];
    if (items.length) {
      var isaItems = items.filter(function (i) { return i.group === "isa" && i.isaType !== "jisa"; });
      var used = isaItems.reduce(function (s, i) { return s + contribThisYear(i); }, 0), allowance = ADULT_ISA_ALLOWANCE * people.length, left = Math.max(0, allowance - used);
      var taxable = sumV(items.filter(function (i) { return i.group === "cash" || i.group === "general"; }));
      var buffer = essentials > 0 ? essentials * 6 : 0, spare = Math.max(0, taxable - buffer), movable = Math.min(spare, left);
      var iScore = movable <= 0 ? 100 : clamp(70 - movable / spare * 30);
      var noIsa = people.filter(function (p) { return !isaItems.some(function (i) { return i.owner === p; }); });
      checks.push({ key: "isa", w: 10, good: spare <= 0 ? "Your savings are your safety net for now, so there's nothing idle to shelter yet." : "Your spare savings are sheltered in ISAs, or this year's allowances are used.", label: "Using your ISA allowances", value: gbp(used) + " of " + gbp(allowance) + " paid in this tax year" + (spare > 0 ? ", with " + gbp(spare) + " saved outside ISAs beyond a six-month safety net" : ""),
        target: "Savings beyond your safety net held in ISAs, where interest and growth are tax-free", score: iScore,
        source: "Each adult can pay up to " + gbp(ADULT_ISA_ALLOWANCE) + " a year into ISAs, and unused allowance doesn't carry over after 5 April. Your emergency fund can sit in a Cash ISA too. Savings interest outside ISAs is only tax-free up to your Personal Savings Allowance.",
        step: movable > 0 ? { icon: "wallet", title: "Move spare savings into ISAs", detail: "About " + gbp(movable) + " held outside ISAs could go in before 5 April, where interest and growth are tax-free." + (noIsa.length ? " " + noIsa.map(ownerName).join(" and ") + " doesn't have one recorded yet." : "") } : null });
    }

    // Pensions: does each of you have one, and is enough going in?
    if (items.length) {
      var pens = items.filter(function (i) { return i.group === "pension"; }), per = [], missing = [], unknown = [];
      people.forEach(function (p) {
        var mine = pens.filter(function (i) { return i.owner === p; });
        if (!mine.length) { per.push(0); missing.push(ownerName(p)); return; }
        var monthly = mine.reduce(function (s, i) { return s + (Number(i.pmonthly) || 0); }, 0);
        var pInc = 0; months.forEach(function (k) { pInc += stats(inMonth(txs, k).filter(function (t) { return t.owner === p; })).inc; }); pInc /= n;
        if (!monthly || pInc <= 0) { per.push(70); if (!monthly) unknown.push(ownerName(p)); return; }
        var rate = monthly / pInc * 100; per.push(rate >= 12 ? 100 : clamp(rate / 12 * 70));
      });
      var pScore = per.reduce(function (s, v) { return s + v; }, 0) / per.length;
      var pStep = null;
      if (missing.length) pStep = { icon: "landmark", title: missing.length > 1 ? "Add both of your pensions" : "Add " + missing[0] + "'s pension", detail: "If you're not sure what exists, the government's free Pension Tracing Service can help find old workplace pensions." };
      else if (unknown.length) pStep = { icon: "landmark", title: "Add monthly pension contributions", detail: "Add what goes in each month for " + unknown.join(" and ") + " on the Wealth page. It's on your payslip or in your pension app." };
      else if (pScore < 75) pStep = { icon: "landmark", title: "Check pension contributions", detail: "Paying in a little more, especially if your employer matches it, is one of the most tax-efficient ways to save." };
      var totalPen = pens.reduce(function (s, i) { return s + (Number(i.pmonthly) || 0); }, 0);
      checks.push({ key: "pension", w: 15, good: "You both have pensions" + (per.every(function (v) { return v >= 100; }) ? ", with around 12% or more of pay going in" : "") + ".", label: "Pensions", value: (pens.length ? gbp(sumV(pens)) + " saved" + (totalPen ? ", " + gbp(totalPen) + " a month going in" : "") : "None recorded") + (missing.length ? ". None recorded for " + missing.join(" and ") : ""),
        target: "A pension each, with around 12% or more of pay going in (yours plus your employer's)", score: pScore,
        source: "Workplace pensions need at least 8% of qualifying earnings by law, and many guides suggest 12% to 15% to keep your lifestyle in retirement. This compares contributions with take-home pay seen in your statements, so it's approximate. Contributions also get tax relief, and employer matching is extra money.",
        step: pStep });
    }
    var bKeys = budgetKeys(), mst = stats(inMonth(txs, m));
    if (bKeys.length && mst.out > 0) {
      var overs = bKeys.map(function (k) { return { k: k, over: (mst.byCat[k] || 0) - S.budgets[k] }; }).filter(function (x) { return x.over > 0; }).sort(function (a, b) { return b.over - a.over; });
      checks.push({ key: "budgets", w: 10, label: "Sticking to budgets", value: (bKeys.length - overs.length) + " of " + bKeys.length + " budgets within limit", target: "Every category within its budget", score: overs.length ? (bKeys.length - overs.length) / bKeys.length * 70 : 100,
        source: "Your own monthly budgets, for " + monthLabel(m, "long") + ".",
        good: "All " + bKeys.length + " budgets are within their limits this month.",
        step: overs.length ? { icon: CAT[overs[0].k].icon, title: "Rebalance " + CAT[overs[0].k].label.toLowerCase(), detail: "It's " + gbp(overs[0].over) + " over budget this month. Trim spending there, or set a budget that reflects what it really costs." } : null });
    }
    var wsum = checks.reduce(function (s, c) { return s + c.w; }, 0);
    var score = wsum ? Math.round(checks.reduce(function (s, c) { return s + c.score * c.w; }, 0) / wsum) : null;
    return { score: score, checks: checks, months: months.length };
  }
  function healthLabel(sc) { return sc >= 80 ? "Looking strong" : sc >= 60 ? "Mostly on track" : sc >= 40 ? "A few pressure points" : "Needs some attention"; }
  function healthColour(sc) { return sc >= 70 ? "var(--success)" : sc >= 45 ? "var(--warning)" : "var(--danger)"; }
  function gaugeSvg(score, size) {
    var CX = 70, CY = 70, R = 54, START = 135, SWEEP = 270;
    function polar(a) { var r = (a - 90) * Math.PI / 180; return { x: CX + R * Math.cos(r), y: CY + R * Math.sin(r) }; }
    function arc(a1, a2) { var s = polar(a2), e = polar(a1), large = a2 - a1 > 180 ? 1 : 0; return "M " + s.x.toFixed(2) + " " + s.y.toFixed(2) + " A " + R + " " + R + " 0 " + large + " 0 " + e.x.toFixed(2) + " " + e.y.toFixed(2); }
    var end = START + SWEEP * Math.max(0.001, score / 100), knob = polar(end), col = healthColour(score);
    return '<div class="gauge" style="width:' + size + "px;height:" + size + 'px" role="img" aria-label="Financial health ' + score + ' out of 100"><svg viewBox="0 0 140 140">' +
      '<path d="' + arc(START, START + SWEEP) + '" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="' + arc(START, end) + '" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round"/>' +
      '<circle cx="' + knob.x.toFixed(2) + '" cy="' + knob.y.toFixed(2) + '" r="7" fill="#fff" stroke="' + col + '" stroke-width="3"/></svg>' +
      '<div class="g-lbl"><span class="g-num">' + score + '</span><span class="sm">/ 100</span></div></div>';
  }
  function stepAdded(title) { return vals(S.todos).some(function (t) { return t.label === title; }); }
  function healthBlock(m, txs) {
    var hl = health(m, txs);
    if (hl.checks.length < 2) {
      return '<div class="ring-wrap"><div><p style="font-weight:600">Financial health</p><p class="sm mt-xs">Add a few months of statements and your balance sheet on the Wealth page, and a health score appears here, checked against UK rules of thumb.</p></div></div>';
    }
    var steps = hl.checks.filter(function (c) { return c.step; }).sort(function (a, b) { return a.score - b.score; }).slice(0, 3);
    return '<div class="ring-wrap">' + gaugeSvg(hl.score, 120) + '<div><p class="sm">' + icon("sparkle") + ' Financial health</p><p style="font-weight:600;font-size:17px" class="mt-xs">' + healthLabel(hl.score) + '</p><p class="sm mt-xs">' + hl.checks.length + " checks, " + (hl.months > 1 ? "averaged over " + hl.months + " months" : "from one month so far") + '.</p><button class="link hero-link mt-xs" data-action="health">How it\'s worked out</button></div></div>' +
      (steps.length ? '<p class="sm" style="margin:16px 0 10px">Ways to improve it</p><ul class="steps">' + steps.map(function (c) {
        var added = stepAdded(c.step.title);
        return '<li><div class="step-ico">' + icon(c.step.icon) + '</div><div style="flex:1;min-width:0"><p style="font-weight:500">' + esc(c.step.title) + '</p><p class="sm">' + esc(c.step.detail) + "</p></div>" +
          (S.canWrite ? '<button class="icon-btn hero-btn" data-step-todo="' + esc(c.key) + '" aria-label="' + (added ? "Added to to-do" : "Add to to-do") + '"' + (added ? " disabled" : "") + ">" + icon(added ? "check" : "plus") + "</button>" : "") + "</li>";
      }).join("") + "</ul>" : '<p class="sm" style="margin-top:14px">Every check is on track.</p>');
  }
  function openHealth() {
    var m = currentMonth(), hl = health(m, allTx());
    openForm({
      title: "How your financial health is worked out",
      fields: [{ type: "html", html: '<p class="sm muted">Each check compares your figures with a widely used UK rule of thumb and scores it out of 100. The overall score is a weighted average of the checks that have enough data, and it updates as you import statements and change figures.</p>' +
        hl.checks.map(function (c) {
          var sc = Math.round(c.score), cls = sc >= 70 ? "success" : sc >= 45 ? "warning" : "danger";
          return '<div class="tile"><div class="row-between mb-xs"><h3>' + esc(c.label) + '</h3><span class="badge ' + cls + '">' + sc + '</span></div><p class="sm">' + esc(c.value) + '</p><p class="sm muted">Aim for: ' + esc(c.target) + '</p><div class="mt-md">' + bar(sc, sc >= 70 ? "ok" : sc >= 45 ? "warn" : "over") + '</div><p class="sm faint mt-md">' + esc(c.source) + "</p></div>";
        }).join("") +
        '<p class="sm muted">These are general guides, not personal financial advice. They can\'t see anything you haven\'t added, like savings or pensions held elsewhere, bonuses, or what you\'re saving towards.</p>' }],
      saveLabel: "Done", onSave: function () {}
    });
  }

  // ══ Page: Transactions ═════════════════════════════════════════════════
  function pageTx() {
    var txs = allTx(), q = S.txq;
    var head = pageHead("Transactions", "Everything you've imported, newest first", S.canWrite ? '<button class="btn btn-primary" data-action="import">' + icon("upload") + "Import</button>" : "");
    if (!txs.length) return head + emptyImport();
    var ms = txMonths().slice().reverse();
    var needle = q.q.trim().toLowerCase();
    var list = txs.filter(function (t) {
      if (q.month && t.d.slice(0, 7) !== q.month) return false;
      if (q.who !== "all" && t.owner !== q.who) return false;
      if (q.acc !== "all" && t.acc !== q.acc) return false;
      if (q.cat !== "all" && t.cat !== q.cat) return false;
      if (needle && (t.m || "").toLowerCase().indexOf(needle) < 0) return false;
      return true;
    });
    var st = stats(list);
    var filters = '<div class="filters" role="search">' +
      '<input type="search" data-txq="q" placeholder="Search" value="' + esc(q.q) + '" aria-label="Search transactions">' +
      '<select data-txq="month" aria-label="Month"><option value="">All months</option>' + ms.map(function (m) { return '<option value="' + m + '"' + (q.month === m ? " selected" : "") + ">" + esc(monthLabel(m, "long")) + "</option>"; }).join("") + "</select>" +
      '<select data-txq="who" aria-label="Whose"><option value="all">Everyone</option>' + ["p1", "p2", "joint"].map(function (o) { return '<option value="' + o + '"' + (q.who === o ? " selected" : "") + ">" + esc(ownerName(o)) + "</option>"; }).join("") + "</select>" +
      '<select data-txq="acc" aria-label="Account"><option value="all">All accounts</option>' + vals(S.accounts).map(function (a) { return '<option value="' + esc(a.id) + '"' + (q.acc === a.id ? " selected" : "") + ">" + esc(a.name) + "</option>"; }).join("") + "</select>" +
      '<select data-txq="cat" aria-label="Category"><option value="all">All categories</option>' + CATS.map(function (c) { return '<option value="' + c[0] + '"' + (q.cat === c[0] ? " selected" : "") + ">" + esc(c[1]) + "</option>"; }).join("") + "</select></div>";
    var shown = list.slice(0, 300);
    return head + '<div class="card">' + filters +
      '<div class="grid g3 mb-lg" style="gap:12px"><div class="tile"><p class="sm muted">Transactions</p><p class="num" style="font-weight:600;font-size:18px">' + list.length.toLocaleString("en-GB") + '</p></div><div class="tile"><p class="sm muted">Money in</p><p class="num pos" style="font-weight:600;font-size:18px">' + gbp(st.inc) + '</p></div><div class="tile"><p class="sm muted">Spending</p><p class="num" style="font-weight:600;font-size:18px">' + gbp(st.out) + "</p></div></div>" +
      (shown.length ? '<div class="rows">' + shown.map(function (t) { return txRow(t, true); }).join("") + "</div>" : '<p class="muted">No transactions match.</p>') +
      (list.length > 300 ? '<p class="sm muted mt-md">Showing the latest 300. Narrow the filters to see others.</p>' : "") +
      (S.canWrite ? '<p class="sm faint mt-md">Tap a transaction to change its category.</p>' : "") + "</div>";
  }

  // ══ Page: Family ═══════════════════════════════════════════════════════
  function accTotals(accs) {
    var cash = null, cards = null;
    accs.forEach(function (a) { if (a.balance == null) return; if (a.kind === "credit") cards = (cards || 0) + Math.abs(a.balance); else cash = (cash || 0) + a.balance; });
    return { cash: cash, cards: cards };
  }
  function gbpOr(n) { return n == null ? "—" : (n < 0 ? "−" : "") + gbp(n); }
  function accCard(a) {
    var kinds = { current: ["Current", "default"], savings: ["Savings", "success"], credit: ["Credit card", "warning"] };
    var k = kinds[a.kind] || kinds.current;
    return '<button type="button" class="acc-card" data-acc="' + esc(a.id) + '"' + (S.canWrite ? ' aria-label="Edit ' + esc(a.name) + '"' : " disabled") + '><div class="row-between mb-lg" style="align-items:flex-start"><div style="min-width:0"><p style="font-weight:600">' + esc(a.name) + '</p><p class="sm muted mt-xs">' + esc([a.bank, ownerName(a.owner)].filter(Boolean).join(", ")) + '</p></div><span class="badge ' + k[1] + '">' + k[0] + "</span></div>" +
      '<p class="big" style="font-size:22px">' + (a.balance == null ? "—" : (a.kind === "credit" ? gbp2(Math.abs(a.balance)) : (a.balance < 0 ? "−" : "") + gbp2(a.balance))) + '</p><p class="sm faint mt-xs">' +
      (a.balance == null ? "Balance not known" : (a.kind === "credit" ? "Owed" : "Balance") + (a.balanceAt ? " on " + esc(shortDate(a.balanceAt)) : "")) + "</p></button>";
  }
  function pageFamily() {
    var m = currentMonth(), txs = allTx(), accs = vals(S.accounts);
    var tabs = [["overview", "Overview"], ["p1", S.household.p1], ["p2", S.household.p2], ["joint", "Joint"]];
    var head = pageHead("Family accounts", esc(S.household.household) + ", " + esc(monthLabel(m, "long")),
      (txs.length ? monthSelect(m) : "") + (S.canWrite ? '<button class="btn btn-primary" data-action="import">' + icon("upload") + "Import</button>" : ""));
    var seg = '<div class="seg mb-lg" role="group" aria-label="Show" style="margin-bottom:24px">' + tabs.map(function (t) { return '<button type="button" data-fam="' + t[0] + '" aria-pressed="' + (S.famTab === t[0]) + '">' + esc(t[1]) + "</button>"; }).join("") + "</div>";
    if (!accs.length) return head + emptyImport("Import a statement for each account and choose whose it is. Each of you then gets your own view, plus one for joint accounts.");
    var mtx = inMonth(txs, m);
    if (S.famTab === "overview") {
      var st = stats(mtx), at = accTotals(accs);
      var html = head + seg + '<div class="grid g4" style="margin-bottom:24px">' +
        kpiCard("Money in", gbp(st.inc), monthLabel(m, "long")) + kpiCard("Spending", gbp(st.out), "Not counting transfers") +
        kpiCard("In your accounts", gbpOr(at.cash), at.cash == null ? "Add balances to accounts" : "Latest known balances") + kpiCard("On credit cards", gbpOr(at.cards), at.cards == null ? "No card balances yet" : "Latest known balances") + "</div>";
      html += '<div class="grid g3">' + ["p1", "p2", "joint"].map(function (o) {
        var mine = accs.filter(function (a) { return (a.owner || "joint") === o; }), ms = stats(mtx.filter(function (t) { return t.owner === o; })), t2 = accTotals(mine);
        var top = Object.keys(ms.byCat).filter(function (k) { return ms.byCat[k] > 0; }).sort(function (a, b) { return ms.byCat[b] - ms.byCat[a]; }).slice(0, 3);
        return '<div class="card"><div class="row-between mb-lg"><div class="row-between" style="gap:12px;justify-content:flex-start"><div class="avatar">' + esc(o === "joint" ? "J" : ownerName(o).slice(0, 1).toUpperCase()) + '</div><div><p style="font-weight:600">' + esc(ownerName(o)) + '</p><p class="sm muted">' + mine.length + " account" + (mine.length === 1 ? "" : "s") + '</p></div></div><button class="btn btn-subtle" data-fam="' + o + '">View ' + icon("chev") + "</button></div>" +
          '<div class="grid g2 mb-lg" style="gap:12px"><div class="tile"><p class="sm muted">Balances</p><p class="num" style="font-weight:600">' + gbpOr(t2.cash) + '</p></div><div class="tile"><p class="sm muted">Spent</p><p class="num" style="font-weight:600">' + gbp(ms.out) + "</p></div></div>" +
          (top.length ? '<div class="stack" style="gap:10px">' + top.map(function (k) { return '<div><div class="row-between mb-xs"><span class="sm">' + esc(CAT[k].label) + '</span><span class="sm muted num">' + gbp(ms.byCat[k]) + "</span></div>" + bar(ms.out ? ms.byCat[k] / ms.out * 100 : 0) + "</div>"; }).join("") + "</div>" : '<p class="sm muted">No spending this month.</p>') + "</div>";
      }).join("") + "</div>";
      return html;
    }
    var o = S.famTab, mine = accs.filter(function (a) { return (a.owner || "joint") === o; }), ptx = mtx.filter(function (t) { return t.owner === o; }), ps = stats(ptx), pt = accTotals(mine);
    var html2 = head + seg + '<div class="grid g3" style="margin-bottom:24px">' + kpiCard("In accounts", gbpOr(pt.cash), mine.filter(function (a) { return a.kind !== "credit"; }).length + " accounts") +
      kpiCard("On credit cards", gbpOr(pt.cards), mine.filter(function (a) { return a.kind === "credit"; }).length + " cards") + kpiCard("Spent", gbp(ps.out), monthLabel(m, "long")) + "</div>";
    html2 += '<div class="card" style="margin-bottom:24px"><div class="sec-head"><h2>Accounts</h2>' + (S.canWrite ? '<button class="icon-btn" data-action="import" aria-label="Import another account">' + icon("plus") + "</button>" : "") + "</div>" +
      (mine.length ? '<div class="grid g2" style="gap:16px">' + mine.map(accCard).join("") + "</div>" : '<p class="muted">No ' + (o === "joint" ? "joint accounts" : "accounts for " + esc(ownerName(o))) + " yet. Import a statement and choose " + (o === "joint" ? "Joint" : esc(ownerName(o))) + " as the owner.</p>") + "</div>";
    var cats = Object.keys(ps.byCat).filter(function (k) { return ps.byCat[k] > 0; }).sort(function (a, b) { return ps.byCat[b] - ps.byCat[a]; });
    html2 += '<div class="grid g2"><div class="card"><h2 class="mb-lg">Spending by category</h2>' + (cats.length ? '<div class="stack" style="gap:14px">' + cats.map(function (k) {
      return '<div><div class="row-between mb-xs"><span>' + esc(CAT[k].label) + '</span><span class="sm muted num">' + gbp(ps.byCat[k]) + "</span></div>" + bar(ps.out ? ps.byCat[k] / ps.out * 100 : 0) + "</div>";
    }).join("") + "</div>" : '<p class="muted">No spending in ' + esc(monthLabel(m, "long")) + ".</p>") + "</div>" +
      '<div class="card"><div class="sec-head"><h2>Recent transactions</h2><button class="btn btn-subtle" data-go-tx="' + o + '">All ' + icon("chev") + "</button></div>" +
      (ptx.length ? '<div class="rows">' + ptx.slice(0, 7).map(function (t) { return txRow(t, true); }).join("") + "</div>" : '<p class="muted">Nothing this month.</p>') + "</div></div>";
    return html2;
  }
  function kpiCard(label, value, sub) { return '<div class="card"><p class="muted">' + esc(label) + '</p><p class="big mt-xs">' + value + '</p><p class="sm faint mt-xs">' + esc(sub) + "</p></div>"; }

  // ══ Page: Wealth ═══════════════════════════════════════════════════════
  function wVisible() {
    var all = vals(S.items);
    if (S.wealthFilter === "all") return all;
    return all.filter(function (i) { if (i.group === "isa" && i.isaType === "jisa") return S.wealthFilter === "joint"; return (i.owner || "joint") === S.wealthFilter; });
  }
  function byGroup(items, g) { return items.filter(function (i) { return i.group === g; }).sort(function (a, b) { return (b.value || 0) - (a.value || 0); }); }
  function wTotals(items) {
    var a = items.filter(function (i) { return GROUPS[i.group] && GROUPS[i.group].side === "asset"; }), l = items.filter(function (i) { return GROUPS[i.group] && GROUPS[i.group].side === "liab"; });
    var ta = sumV(a), tl = sumV(l); return { assets: ta, liabs: tl, net: ta - tl, a: a, l: l };
  }
  function contribThisYear(item) { return item.contribYear === taxYear().label ? (Number(item.contrib) || 0) : 0; }
  function ownerShort(item) { return item.group === "isa" && item.isaType === "jisa" ? (item.child || "Child") : ownerName(item.owner); }
  function remainingText(end) {
    if (!end) return "—"; var p = end.split("-"); if (p.length < 2) return "—";
    var now = new Date(), months = (+p[0] - now.getFullYear()) * 12 + (+p[1] - 1 - now.getMonth());
    if (months <= 0) return "Ending"; if (months < 24) return months + " month" + (months === 1 ? "" : "s"); return Math.round(months / 12) + " years";
  }

  function pageWealth() {
    var opts = [["all", "Everyone"], ["p1", S.household.p1], ["p2", S.household.p2], ["joint", "Joint"]];
    var seg = '<div class="seg" role="group" aria-label="Show">' + opts.map(function (o) { return '<button type="button" data-wfilter="' + o[0] + '" aria-pressed="' + (S.wealthFilter === o[0]) + '">' + esc(o[1]) + "</button>"; }).join("") + "</div>";
    var head = pageHead("Wealth balance sheet", esc(S.household.household) + ", " + esc(new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })),
      seg + (S.canWrite ? '<button class="btn btn-primary" data-action="witem">' + icon("plus") + "Add</button>" : ""));
    var items = wVisible(), t = wTotals(items);
    var html = head + wKpis(t) + wTabs();
    if (S.wealthTab === "overview") html += wOverview(items, t);
    else if (S.wealthTab === "investments") html += wInvestments(items);
    else if (S.wealthTab === "assets") html += wAssets(items);
    else html += '<div class="stack">' + wSection(items, "mortgage") + wSection(items, "loan") + wSection(items, "credit") + "</div>";
    return html;
  }
  function ytdChange(currentNet) {
    if (S.wealthFilter !== "all") return null;
    var start = monthKey(taxYear().start), keys = Object.keys(S.history.points || {}).sort();
    var base = keys.filter(function (k) { return k >= start; })[0];
    if (!base || base === monthKey()) return null;
    var p = S.history.points[base]; return { change: currentNet - (p.a - p.l), since: base };
  }
  function wKpis(t) {
    var y = ytdChange(t.net);
    var badge = y ? '<span class="badge ' + (y.change >= 0 ? "success" : "danger") + '">' + (y.change >= 0 ? "↑ " : "↓ ") + gbp(y.change) + " since " + esc(monthLabel(y.since)) + "</span>" : "";
    return '<div class="grid g3 kpis">' +
      '<div class="card"><div class="kpi-head"><span class="muted">Total assets</span>' + icon("up", "pos") + '</div><p class="big">' + gbp(t.assets) + '</p><p class="sm faint mt-xs">Property, investments and cash</p></div>' +
      '<div class="card"><div class="kpi-head"><span class="muted">Total liabilities</span>' + icon("down", "faint") + '</div><p class="big">' + gbp(t.liabs) + '</p><p class="sm faint mt-xs">Mortgage, loans and cards</p></div>' +
      '<div class="card"><div class="kpi-head"><span class="muted">Net worth</span>' + badge + '</div><p class="big brand">' + (t.net < 0 ? "−" : "") + gbp(t.net) + '</p><p class="sm faint mt-xs">Assets minus liabilities</p></div></div>';
  }
  function wTabs() {
    var tabs = [["overview", "Overview"], ["investments", "Investments"], ["assets", "Assets"], ["liabilities", "Liabilities"]];
    return '<div class="tabs" role="tablist">' + tabs.map(function (x) { return '<button type="button" role="tab" data-wtab="' + x[0] + '" aria-selected="' + (S.wealthTab === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div>";
  }
  function wOverview(items, t) {
    if (!items.length) {
      return '<div class="card"><h2 class="mb-md">Start your balance sheet</h2><p class="muted mb-lg">Add what you own and what you owe. Start with the big things: your home, mortgage, pensions and savings. Values are your best estimates, and you can update them whenever you like.</p>' +
        (S.canWrite ? '<div class="head-actions">' + ["property", "mortgage", "pension", "cash"].map(function (g) { return '<button class="btn btn-neutral" data-action="witem" data-group="' + g + '">' + icon("plus") + "Add " + GROUPS[g].one + "</button>"; }).join("") + "</div>" : "") + "</div>";
    }
    var catRows = WCATS.map(function (c) {
      var v = sumV(t.a.filter(function (i) { return GROUPS[i.group].cat === c.key; })), pct = t.assets ? Math.round(v / t.assets * 100) : 0;
      return '<div><div class="row-between mb-xs"><span>' + c.label + '</span><span><span class="sm muted num">' + gbp(v) + '</span>&nbsp;&nbsp;<span class="sm brand num" style="font-weight:600">' + pct + "%</span></span></div>" + '<div class="bar"><span style="width:' + pct + '%;background:var(' + c.c + ')"></span></div>' + "</div>";
    }).join("");
    var html = '<div class="stack"><div class="card"><h2 class="mb-lg">Net worth breakdown</h2><div class="grid g3 mb-lg dup" style="gap:16px">' +
      '<div class="tile"><p class="sm muted">Total assets</p><p class="big mt-xs" style="font-size:22px">' + gbp(t.assets) + '</p></div><div class="tile"><p class="sm muted">Total liabilities</p><p class="big mt-xs" style="font-size:22px">' + gbp(t.liabs) + "</p></div>" +
      '<div class="tile selected"><p class="sm muted">Net worth</p><p class="big brand mt-xs" style="font-size:22px">' + (t.net < 0 ? "−" : "") + gbp(t.net) + '</p></div></div><h3 class="mb-lg">Where your assets are</h3><div class="stack" style="gap:16px">' + catRows + "</div></div>";
    var prop = sumV(byGroup(items, "property")), mort = sumV(byGroup(items, "mortgage")), ratios = "";
    if (prop > 0 && mort > 0) { var ltv = Math.round(mort / prop * 100); ratios += '<div class="tile"><div class="row-between mb-md"><h3>Loan-to-value</h3><span class="badge ' + (ltv > 75 ? "warning" : "success") + '">' + ltv + '%</span></div><p class="sm muted">Mortgage ' + gbp(mort) + " against property worth " + gbp(prop) + '</p><div class="mt-md">' + bar(ltv, ltv > 75 ? "warn" : "ok") + "</div></div>"; }
    if (t.assets > 0) { var dta = Math.round(t.liabs / t.assets * 100); ratios += '<div class="tile"><div class="row-between mb-md"><h3>Debt-to-assets</h3><span class="badge ' + (dta > 50 ? "warning" : "success") + '">' + dta + '%</span></div><p class="sm muted">Everything owed (' + gbp(t.liabs) + ') as a share of everything owned</p><div class="mt-md">' + bar(dta, dta > 50 ? "warn" : "ok") + "</div></div>"; }
    if (ratios) html += '<div class="card"><h2 class="mb-lg">Key ratios</h2><div class="grid g2" style="gap:16px">' + ratios + "</div></div>";
    if (S.wealthFilter === "all") {
      var keys = Object.keys(S.history.points || {}).sort().slice(-12);
      if (keys.length >= 2) {
        var nets = keys.map(function (k) { var p = S.history.points[k]; return p.a - p.l; }), max = Math.max.apply(null, nets.map(Math.abs)) || 1, cur = monthKey();
        html += '<div class="card"><h2>Net worth over time</h2><p class="sm muted mt-xs">Recorded whenever figures are updated, one point per month</p><div class="hist" role="img" aria-label="Net worth by month">' + keys.map(function (k, i) {
          return '<div class="col' + (k === cur ? " now" : "") + '" title="' + esc(monthLabel(k, "year")) + ": " + gbp(nets[i]) + '"><span class="b" style="height:' + Math.max(3, Math.round(Math.abs(nets[i]) / max * 88)) + '%"></span><span class="sm ' + (k === cur ? "" : "muted") + '">' + esc(monthLabel(k)) + "</span></div>";
        }).join("") + "</div></div>";
      } else html += '<div class="card"><h2>Net worth over time</h2><p class="muted mt-xs">This fills in as you update your figures in future months.</p></div>';
    }
    return html + "</div>";
  }
  function changeLine(i) {
    if (i.prevValue == null || i.prevValue === i.value) return "";
    var d = i.value - i.prevValue, good = GROUPS[i.group].side === "asset" ? d >= 0 : d <= 0;
    return '<span class="chg sm mt-xs ' + (good ? "pos" : "neg") + '">' + icon(d >= 0 ? "up" : "down") + signed(d) + " since " + esc(shortDate(i.prevAt)) + "</span>";
  }
  function subLine(i) {
    var bits = []; if (i.group === "isa") bits.push(ISA_TYPES[i.isaType] || "ISA"); if (i.provider) bits.push(i.provider); if (i.group === "pension" && i.pmonthly) bits.push(gbp(i.pmonthly) + " a month going in"); if (i.group === "credit" && i.due) bits.push("due on the " + ordinal(+i.due));
    return '<p class="sm muted">' + esc(bits.join(", ")) + (S.wealthFilter === "all" ? '<span class="owner-chip">' + esc(ownerShort(i)) + "</span>" : "") + "</p>";
  }
  function assetRow(i) {
    return '<button type="button" class="item-row" data-witem="' + esc(i.id) + '"' + (S.canWrite ? ' aria-label="Edit ' + esc(i.name) + '"' : " disabled") + '><div style="min-width:0"><p>' + esc(i.name) + "</p>" + subLine(i) + '</div><div class="r"><p class="num" style="font-weight:600">' + gbp(i.value) + "</p>" + changeLine(i) + "</div></button>";
  }
  function liabRow(i) {
    var facts = "";
    if (i.group === "mortgage" || i.group === "loan") facts = '<div class="facts"><div class="tile"><p class="sm muted">Rate</p><p class="num" style="font-weight:600">' + (i.rate != null && i.rate !== "" ? esc(i.rate) + "%" : "—") + '</p></div><div class="tile"><p class="sm muted">Monthly</p><p class="num" style="font-weight:600">' + (i.monthly ? gbp(i.monthly) : "—") + '</p></div><div class="tile"><p class="sm muted">Remaining</p><p style="font-weight:600">' + esc(remainingText(i.end)) + "</p></div></div>";
    else if (i.group === "credit" && i.limit) { var u = Math.round(i.value / i.limit * 100); facts = '<div style="width:100%;margin-top:10px"><div class="row-between mb-xs"><span class="sm muted">' + u + "% of " + gbp(i.limit) + " limit used</span></div>" + bar(u, u > 50 ? "warn" : "") + "</div>"; }
    return '<button type="button" class="item-row liab" data-witem="' + esc(i.id) + '"' + (S.canWrite ? ' aria-label="Edit ' + esc(i.name) + '"' : " disabled") + '><div class="row-between" style="align-items:flex-start"><div style="min-width:0"><p>' + esc(i.name) + "</p>" + subLine(i) + '</div><div class="r"><p class="num" style="font-weight:600">' + gbp(i.value) + "</p>" + changeLine(i) + "</div></div>" + facts + "</button>";
  }
  function wSection(items, g) {
    var list = byGroup(items, g), G = GROUPS[g];
    var body = list.length ? '<div class="rows">' + list.map(G.side === "liab" ? liabRow : assetRow).join("") + "</div>" : '<div class="empty"><span>No ' + esc(G.label.toLowerCase()) + " added yet.</span>" + (S.canWrite ? '<button class="btn btn-subtle" data-action="witem" data-group="' + g + '">' + icon("plus") + "Add " + esc(G.one) + "</button>" : "") + "</div>";
    return '<div class="card"><div class="sec-head"><div class="sec-title"><div class="icon-tile">' + icon(G.icon) + "</div><h2>" + esc(G.label) + '</h2></div><div class="sec-title"><span class="num" style="font-weight:600">' + gbp(sumV(list)) + "</span>" + (S.canWrite && list.length ? '<button class="icon-btn" data-action="witem" data-group="' + g + '" aria-label="Add ' + esc(G.one) + '">' + icon("plus") + "</button>" : "") + "</div></div>" + body + "</div>";
  }
  function allowanceTile(label, sub, used, allowance) {
    var pct = Math.min(100, Math.round(used / allowance * 100)), left = Math.max(0, allowance - used), maxed = used >= allowance;
    return '<div class="tile"><div class="row-between mb-md" style="align-items:flex-start"><div><h3>' + esc(label) + '</h3><p class="sm muted">' + esc(sub) + '</p></div><span class="badge ' + (maxed ? "warning" : "success") + '">' + (maxed ? "Fully used" : gbp(left) + " left") + "</span></div>" + bar(pct, maxed ? "warn" : "") + '<div class="row-between mt-xs"><span class="sm muted">' + gbp(used) + ' paid in</span><span class="sm faint">of ' + gbp(allowance) + "</span></div></div>";
  }
  function wInvestments(items) {
    var isa = byGroup(items, "isa"), pen = byGroup(items, "pension"), gen = byGroup(items, "general"), total = sumV(isa) + sumV(pen) + sumV(gen), ty = taxYear().label;
    var people = S.wealthFilter === "all" ? ["p1", "p2"] : (S.wealthFilter === "joint" ? [] : [S.wealthFilter]);
    function usedBy(p) { return isa.filter(function (i) { return i.owner === p && i.isaType !== "jisa"; }).reduce(function (s, i) { return s + contribThisYear(i); }, 0); }
    var tiles = people.map(function (p) {
      var lisa = isa.filter(function (i) { return i.owner === p && i.isaType === "lisa"; }).reduce(function (s, i) { return s + contribThisYear(i); }, 0);
      return allowanceTile(ownerName(p) + "'s ISA allowance", "All ISAs combined" + (lisa ? ", including " + gbp(lisa) + " in a Lifetime ISA" : ""), usedBy(p), ADULT_ISA_ALLOWANCE);
    });
    var kids = {}; isa.filter(function (i) { return i.isaType === "jisa"; }).forEach(function (i) { var k = (i.child || "Child").trim(); kids[k] = (kids[k] || 0) + contribThisYear(i); });
    Object.keys(kids).forEach(function (k) { tiles.push(allowanceTile("Junior ISA for " + k, "Everyone's payments in count", kids[k], JUNIOR_ISA_ALLOWANCE)); });
    var adultLeft = people.reduce(function (s, p) { return s + Math.max(0, ADULT_ISA_ALLOWANCE - usedBy(p)); }, 0);
    return '<div class="stack"><div class="grid g3 kpis">' +
      '<div class="card"><div class="kpi-head"><span class="muted">Invested in total</span>' + icon("chart", "faint") + '</div><p class="big">' + gbp(total) + '</p><p class="sm faint mt-xs">ISAs, pensions and other investments</p></div>' +
      '<div class="card"><div class="kpi-head"><span class="muted">In pensions</span>' + icon("landmark", "faint") + '</div><p class="big">' + gbp(sumV(pen)) + '</p><p class="sm faint mt-xs">' + (total ? Math.round(sumV(pen) / total * 100) + "% of investments" : "Nothing added yet") + "</p></div>" +
      '<div class="card"><div class="kpi-head"><span class="muted">ISA allowance left</span>' + icon("wallet", "faint") + '</div><p class="big brand">' + (people.length ? gbp(adultLeft) : "—") + '</p><p class="sm faint mt-xs">' + (people.length ? "Tax year " + ty + ", resets 6 April" : "ISAs are individual, not joint") + "</p></div></div>" +
      (tiles.length ? '<div class="card"><h2 class="mb-lg">Tax-year allowances, ' + ty + '</h2><div class="grid g2" style="gap:16px">' + tiles.join("") + "</div></div>" : "") +
      wSection(items, "isa") + wSection(items, "pension") + wSection(items, "general") + "</div>";
  }
  function wAssets(items) {
    var inv = items.filter(function (i) { return GROUPS[i.group] && (GROUPS[i.group].cat === "investments" || GROUPS[i.group].cat === "pensions"); }).sort(function (a, b) { return b.value - a.value; });
    var invCard = '<div class="card"><div class="sec-head"><div class="sec-title"><div class="icon-tile">' + icon("chart") + '</div><h2>Investments &amp; pensions</h2></div><span class="num" style="font-weight:600">' + gbp(sumV(inv)) + "</span></div>" +
      (inv.length ? '<div class="rows">' + inv.map(assetRow).join("") + "</div>" : '<div class="empty"><span>Add ISAs, pensions and investments in the Investments tab.</span><button class="btn btn-subtle" data-wtab="investments">Go to Investments</button></div>') + "</div>";
    return '<div class="stack">' + wSection(items, "property") + invCard + wSection(items, "cash") + wSection(items, "other") + "</div>";
  }

  // ══ Persistence ════════════════════════════════════════════════════════
  var queue = Promise.resolve();
  function write(fn) {
    queue = queue.then(fn).catch(function (err) {
      var code = err && err.code;
      if (code === "invalid_argument" && S.mode === "shared") { S.canWrite = false; render(); }
      else if (code === "quota_exceeded") alert("There's no room to save more. Delete some old imports or items, then try again.");
      else if (code === "unavailable") return new Promise(function (r) { setTimeout(r, 800 + Math.random() * 800); }).then(fn).catch(function () { alert("Couldn't save just now. Check your connection and try again."); });
      else if (code !== "revoked") console.error(err);
    });
    return queue;
  }
  function clean(o) { var b = {}; Object.keys(o).forEach(function (k) { if (k !== "id" && o[k] !== undefined) b[k] = o[k]; }); return b; }
  function saveDoc(coll, id, data) {
    var body = clean(data); S[STORE[coll]][id] = Object.assign({ id: id }, body);
    if (coll === "tx" || coll === "accounts") dirtyTx();
    if (db) write(function () { return db.collection(coll).doc(id).set(body); });
  }
  function delDoc(coll, id) {
    delete S[STORE[coll]][id]; if (coll === "tx" || coll === "accounts") dirtyTx();
    if (db) write(function () { return db.collection(coll).doc(id).delete(); });
  }
  function saveMeta(name, body) { if (db) write(function () { return db.doc("meta/" + name).set(body); }); }
  function recordHistory() {
    var items = vals(S.items), t = wTotals(items), ct = classTotals(items).c, points = Object.assign({}, S.history.points || {}), key = monthKey(), p = points[key];
    if (p && p.a === t.assets && p.l === t.liabs && p.c && JSON.stringify(p.c) === JSON.stringify(ct)) return;
    points[key] = { a: t.assets, l: t.liabs, c: ct }; S.history = { points: points }; saveMeta("history", { points: points });
  }

  // ══ Generic form dialog ═════════════════════════════════════════════════
  var gDlg = el("genDlg"), gForm = el("genForm"), gBody = el("genBody"), gDel = el("genDelete"), gCur = null;
  function openForm(cfg) {
    gCur = cfg;
    el("genTitle").textContent = cfg.title;
    gBody.innerHTML = cfg.fields.map(function (f) {
      var id = "g-" + f.name;
      if (f.type === "html") return f.html;
      if (f.type === "checks") return '<fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-weight:500;font-size:13px;margin-bottom:6px">' + esc(f.label) + '</legend><div class="checks">' + f.options.map(function (o) {
        return '<label><input type="checkbox" name="' + f.name + '" value="' + esc(o[0]) + '"' + ((f.value || []).indexOf(o[0]) >= 0 ? " checked" : "") + ">" + esc(o[1]) + "</label>";
      }).join("") + "</div>" + (f.hint ? '<p class="hint">' + esc(f.hint) + "</p>" : "") + "</fieldset>";
      if (f.type === "checkbox") return '<label class="check-one"><input type="checkbox" id="' + id + '"' + (f.value ? " checked" : "") + ">" + esc(f.label) + "</label>";
      var input;
      if (f.type === "select") input = '<select id="' + id + '">' + f.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(f.value) === String(o[0]) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
      else if (f.type === "money") input = '<div class="money"><input id="' + id + '" inputmode="decimal" autocomplete="off" value="' + esc(f.value == null ? "" : f.value) + '"></div>';
      else input = '<input id="' + id + '" type="' + (f.type || "text") + '" autocomplete="off" value="' + esc(f.value == null ? "" : f.value) + '"' + (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "") + ">";
      return '<div class="field"><label for="' + id + '">' + esc(f.label) + "</label>" + input + (f.hint ? '<p class="hint">' + esc(f.hint) + "</p>" : "") + '<p class="err" id="' + id + '-err" hidden></p></div>';
    }).join("");
    gDel.hidden = !cfg.onDelete; gDel.classList.remove("armed"); gDel.textContent = cfg.deleteLabel || "Delete";
    el("genSave").textContent = cfg.saveLabel || "Save";
    gDlg.showModal();
    var first = gBody.querySelector("input:not([type=checkbox]), select"); if (first) setTimeout(function () { first.focus(); }, 0);
  }
  function gv(name) { var e = el("g-" + name); return e ? (e.type === "checkbox" ? e.checked : e.value) : null; }
  function gChecks(name) { return Array.prototype.map.call(gBody.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; }); }
  function gErr(name, msg) { var e = el("g-" + name + "-err"); if (e) { e.textContent = msg; e.hidden = false; } var i = el("g-" + name); if (i) i.focus(); }
  gForm.addEventListener("submit", function (e) { e.preventDefault(); if (gCur && gCur.onSave() !== false) { gDlg.close(); render(); } });
  gDel.addEventListener("click", function () {
    if (!gDel.classList.contains("armed")) { gDel.classList.add("armed"); gDel.textContent = gCur.confirmLabel || "Delete for both of you"; return; }
    gDlg.close(); gCur.onDelete(); render();
  });

  function openGoal(id) {
    var g = id ? S.goals[id] : null;
    openForm({
      title: g ? "Edit " + g.name : "New savings goal",
      fields: [
        { name: "name", label: "What are you saving for?", value: g ? g.name : "", placeholder: "e.g. Summer holiday" },
        { name: "target", label: "Target", type: "money", value: g ? g.target : "" },
        { name: "saved", label: "Saved so far", type: "money", value: g ? g.saved : "" },
        { name: "by", label: "Aiming for (optional)", type: "month", value: g ? g.by : "" },
        { name: "icon", label: "Icon", type: "select", value: g ? g.icon : "target", options: [["target", "Target"], ["plane", "Plane"], ["home", "House"], ["shield", "Shield"], ["car", "Car"], ["smile", "Smile"], ["gift", "Gift"], ["sparkle", "Sparkle"]] }
      ],
      onSave: function () {
        var name = gv("name").trim(), target = parseMoney(gv("target")), saved = parseMoney(gv("saved")) || 0;
        if (!name) { gErr("name", "Give the goal a name."); return false; }
        if (target == null || isNaN(target) || target <= 0) { gErr("target", "Enter a target, like 3000."); return false; }
        if (isNaN(saved) || saved < 0) { gErr("saved", "Enter an amount, or leave it blank."); return false; }
        saveDoc("goals", g ? g.id : newId("g"), { name: name, target: target, saved: saved, by: gv("by") || null, icon: gv("icon"), createdAt: g ? g.createdAt : new Date().toISOString() });
      },
      onDelete: g ? function () { delDoc("goals", g.id); } : null
    });
  }
  function openAccount(id) {
    var a = S.accounts[id]; if (!a) return;
    var n = vals(S.txdocs).filter(function (d) { return d.acc === id; }).reduce(function (s, d) { return s + (d.list || []).length; }, 0);
    openForm({
      title: "Edit " + a.name,
      fields: [
        { name: "name", label: "Account name", value: a.name },
        { name: "bank", label: "Bank", value: a.bank || "" },
        { name: "owner", label: "Whose is it?", type: "select", value: a.owner || "joint", options: [["p1", S.household.p1], ["p2", S.household.p2], ["joint", "Joint"]] },
        { name: "kind", label: "Type", type: "select", value: a.kind || "current", options: [["current", "Current account"], ["savings", "Savings account"], ["credit", "Credit card"]] },
        { name: "balance", label: a.kind === "credit" ? "Amount owed" : "Balance", type: "money", value: a.balance == null ? "" : Math.abs(a.balance), hint: "Leave blank if you'd rather not track it." },
        { name: "limit", label: "Credit limit (cards only)", type: "money", value: a.limit || "", hint: "Used for the credit use check." },
        { type: "html", html: '<p class="sm muted">' + n.toLocaleString("en-GB") + " imported transactions.</p>" }
      ],
      onSave: function () {
        var name = gv("name").trim(); if (!name) { gErr("name", "Give the account a name."); return false; }
        var bal = parseMoney(gv("balance")); if (bal != null && isNaN(bal)) { gErr("balance", "Enter an amount, or leave it blank."); return false; }
        var kind = gv("kind");
        if (bal != null && kind === "credit") bal = -Math.abs(bal);
        var changed = bal !== a.balance;
        var lim = parseMoney(gv("limit")); if (lim != null && isNaN(lim)) { gErr("limit", "Enter an amount, or leave it blank."); return false; }
        saveDoc("accounts", a.id, Object.assign({}, a, { name: name, bank: gv("bank").trim(), owner: gv("owner"), kind: kind, balance: bal, balanceAt: changed ? new Date().toISOString().slice(0, 10) : a.balanceAt, limit: kind === "credit" && lim ? lim : null }));
      },
      onDelete: function () { vals(S.txdocs).forEach(function (d) { if (d.acc === a.id) delDoc("tx", d.id); }); delDoc("accounts", a.id); },
      deleteLabel: "Delete account", confirmLabel: "Delete it and its " + n + " transactions"
    });
  }
  function openTx(ref) {
    var p = ref.split("|"), doc = S.txdocs[p[0]]; if (!doc) return;
    var t = doc.list[+p[1]]; if (!t) return;
    var acc = S.accounts[doc.acc] || {}, cur = effCat(t);
    openForm({
      title: t.m || "Transaction",
      fields: [
        { type: "html", html: '<div class="tile"><div class="row-between"><span class="muted">' + esc(new Date(t.d + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })) + '</span><span class="num ' + (t.a > 0 ? "pos" : "") + '" style="font-weight:600">' + (t.a > 0 ? "+" : "−") + gbp2(t.a) + '</span></div><p class="sm muted mt-xs">' + esc(acc.name || "") + "</p></div>" },
        { name: "cat", label: "Category", type: "select", value: cur, options: CATS.map(function (c) { return [c[0], c[1]]; }) },
        { name: "always", label: "Use this for everything from “" + (t.m || "").slice(0, 30) + "”", type: "checkbox", value: true }
      ],
      onSave: function () {
        var cat = gv("cat"), always = gv("always");
        if (always) {
          var r = Object.assign({}, S.rules); r[t.k] = cat; S.rules = r; saveMeta("rules", { map: r });
          if (t.o) { var list = doc.list.slice(); var nt = Object.assign({}, t); delete nt.o; list[+p[1]] = nt; saveDoc("tx", doc.id, Object.assign({}, doc, { list: list })); }
        } else {
          var list2 = doc.list.slice(); list2[+p[1]] = Object.assign({}, t, { o: cat }); saveDoc("tx", doc.id, Object.assign({}, doc, { list: list2 }));
        }
        dirtyTx();
      }
    });
  }
  function openSettings() {
    var nTx = allTx().length;
    openForm({
      title: "Household settings",
      fields: [
        { name: "household", label: "Household name", value: S.household.household },
        { name: "p1", label: "First person", value: S.household.p1 },
        { name: "p2", label: "Second person", value: S.household.p2 },
        { type: "html", html: '<div class="tile"><h3 class="mb-xs">What gets saved</h3><p class="sm muted">' + PRIVACY_NOTE + '</p></div>' +
          '<div class="tile"><h3 class="mb-xs">Backup</h3><p class="sm muted mb-md">Download everything as one file to keep safe' + (restoreBackup ? ", or restore from one." : ". You\'ll also use it to move to your own hosting.") + '</p><div class="head-actions"><button type="button" class="btn btn-neutral" data-backup="download">' + icon("arrowdown") + 'Download a backup</button>' +
          (restoreBackup && S.canWrite ? '<button type="button" class="btn btn-neutral" data-backup="restore">' + icon("upload") + 'Restore from a backup</button><input type="file" id="restoreFile" accept=".json,application/json" hidden>' : "") +
          (signOut ? '<button type="button" class="btn btn-neutral" data-backup="signout">Sign out</button>' : "") + "</div>" +
          (S.canWrite ? '<div class="danger-zone mt-md"><button type="button" class="btn btn-danger" data-backup="wipe">Delete everything</button><p class="sm muted mt-xs">Removes all figures, transactions and settings for both of you. Download a backup first if you might want them.</p></div>' : "") + "</div>" }
      ],
      saveLabel: "Save",
      onSave: function () {
        if (!S.canWrite) return;
        var h = { household: gv("household").trim() || "Our household", p1: gv("p1").trim() || "Person 1", p2: gv("p2").trim() || "Person 2" };
        S.household = h; saveMeta("household", h);
      },
      onDelete: S.canWrite && nTx ? function () { vals(S.txdocs).forEach(function (d) { delDoc("tx", d.id); }); } : null,
      deleteLabel: "Delete all transactions", confirmLabel: "Delete all " + nTx.toLocaleString("en-GB") + " for both of you"
    });
  }

  // ══ Backup ═════════════════════════════════════════════════════════════
  var PRIVACY_NOTE = "From statements: the date, amount, a tidied description and a category. Account numbers, sort codes, card numbers and long reference numbers are stripped out before anything is saved. The CSV file itself is never stored. Only the two of you, signed in with two-factor, can see or change anything.";
  var restoreBackup = null, signOut = null;
  function buildBackup() {
    var docs = {};
    function put(coll, map) { docs[coll] = {}; Object.keys(map).forEach(function (id) { docs[coll][id] = clean(map[id]); }); }
    put("items", S.items); put("accounts", S.accounts); put("tx", S.txdocs); put("goals", S.goals); put("todos", S.todos); put("costs", S.costs);
    docs.meta = { household: S.household, history: S.history, rules: { map: S.rules }, bills: { ignore: S.billsIgnore }, budgets: { map: S.budgets } };
    return JSON.stringify({ app: "our-money", version: 1, exportedAt: new Date().toISOString(), docs: docs });
  }
  function downloadBackup() {
    var data = buildBackup(), name = "our-money-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    var p = window.claude && typeof window.claude.use === "function" ? window.claude.use("downloads") : Promise.resolve(null);
    p.then(function (dl) {
      if (dl) return dl.save({ filename: name, data: data }).catch(function (e) { if (e && e.code !== "declined" && e.code !== "cancelled") alert("The backup couldn't be saved. Try again."); });
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "application/json" })); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    });
  }
  el("genBody").addEventListener("click", function (e) {
    var b = e.target.closest("[data-backup]"); if (!b) return;
    var a = b.getAttribute("data-backup");
    if (a === "download") downloadBackup();
    else if (a === "signout" && signOut) signOut();
    else if (a === "wipe" && S.canWrite) {
      if (!b.classList.contains("armed")) { b.classList.add("armed"); b.textContent = "Click again to delete everything for both of you"; return; }
      ["items", "accounts", "tx", "goals", "todos", "costs"].forEach(function (coll) { Object.keys(S[STORE[coll]]).forEach(function (id) { delDoc(coll, id); }); });
      ["household", "history", "rules", "bills", "budgets"].forEach(function (m) { if (db) write(function () { return db.doc("meta/" + m).delete(); }); });
      S.history = { points: {} }; S.rules = {}; S.budgets = {}; S.billsIgnore = []; S.household = { household: "Our household", p1: "Person 1", p2: "Person 2" }; S.chat.turns = [];
      gDlg.close(); render();
    }
    else if (a === "restore" && restoreBackup) { var f = el("restoreFile"); f.onchange = function () { if (f.files[0]) restoreBackup(f.files[0]); }; f.click(); }
  });

  // ══ Wealth item dialog ═════════════════════════════════════════════════
  var dlg = el("itemDlg"), form = el("itemForm"), fGroup = el("f-group"), fOwner = el("f-owner"), fIsa = el("f-isaType"), delBtn = el("deleteBtn"), editingId = null;
  fGroup.innerHTML = '<optgroup label="Things you own">' + Object.keys(GROUPS).filter(function (g) { return GROUPS[g].side === "asset"; }).map(function (g) { return '<option value="' + g + '">' + GROUPS[g].label + "</option>"; }).join("") +
    '</optgroup><optgroup label="Things you owe">' + Object.keys(GROUPS).filter(function (g) { return GROUPS[g].side === "liab"; }).map(function (g) { return '<option value="' + g + '">' + GROUPS[g].label + "</option>"; }).join("") + "</optgroup>";
  function setOwnerOptions() {
    var cur = fOwner.value, opts = [["p1", S.household.p1], ["p2", S.household.p2]]; if (fGroup.value !== "isa") opts.push(["joint", "Joint"]);
    fOwner.innerHTML = opts.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + "</option>"; }).join("");
    if (opts.some(function (o) { return o[0] === cur; })) fOwner.value = cur;
  }
  function syncForm() {
    var g = fGroup.value, G = GROUPS[g];
    form.querySelectorAll("[data-for]").forEach(function (n) { n.hidden = n.getAttribute("data-for").split(" ").indexOf(g) < 0; });
    var jisa = g === "isa" && fIsa.value === "jisa";
    el("ownerField").hidden = jisa; el("childField").hidden = !jisa;
    el("l-value").textContent = G.valueLabel; el("l-provider").textContent = G.providerLabel;
    el("contribHint").textContent = fIsa.value === "lisa" ? "Up to " + gbp(LISA_ALLOWANCE) + " a year, which counts towards the " + gbp(ADULT_ISA_ALLOWANCE) + " allowance." : fIsa.value === "jisa" ? "The Junior ISA allowance is " + gbp(JUNIOR_ISA_ALLOWANCE) + " per child." : "Counts towards the " + gbp(ADULT_ISA_ALLOWANCE) + " allowance for tax year " + taxYear().label + ".";
    setOwnerOptions();
    if (!editingId) el("itemTitle").textContent = "Add " + G.one;
  }
  fGroup.addEventListener("change", syncForm); fIsa.addEventListener("change", syncForm);
  function openItem(id, group) {
    var it = id ? S.items[id] : null; editingId = id || null;
    form.reset(); el("valueErr").hidden = true;
    fGroup.value = it ? it.group : (group || (S.wealthTab === "liabilities" ? "mortgage" : S.wealthTab === "investments" ? "isa" : "property"));
    fGroup.disabled = !!it; fIsa.value = (it && it.isaType) || "ss"; syncForm();
    el("itemTitle").textContent = it ? "Edit " + it.name : "Add " + GROUPS[fGroup.value].one;
    if (it) {
      el("f-name").value = it.name || ""; el("f-provider").value = it.provider || ""; fOwner.value = it.owner || "joint"; el("f-child").value = it.child || "";
      el("f-value").value = it.value != null ? it.value : ""; el("f-contrib").value = contribThisYear(it) || ""; el("f-rate").value = it.rate != null ? it.rate : "";
      el("f-monthly").value = it.monthly || ""; el("f-pmonthly").value = it.pmonthly || ""; el("f-end").value = it.end || ""; el("f-limit").value = it.limit || ""; el("f-due").value = it.due || "";
    } else if (S.wealthFilter !== "all") fOwner.value = S.wealthFilter === "joint" && fGroup.value === "isa" ? "p1" : S.wealthFilter;
    delBtn.hidden = !it; delBtn.classList.remove("armed"); delBtn.textContent = "Delete";
    dlg.showModal(); setTimeout(function () { el("f-name").focus(); }, 0);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var g = fGroup.value, name = el("f-name").value.trim(), value = parseMoney(el("f-value").value);
    if (!name) { el("f-name").focus(); return; }
    if (value == null || isNaN(value) || value < 0) { el("valueErr").hidden = false; el("f-value").focus(); return; }
    var prev = editingId ? S.items[editingId] : null, id = prev ? prev.id : newId("i"), now = new Date().toISOString();
    var it = { group: g, name: name, provider: el("f-provider").value.trim(), value: value, owner: fOwner.value || "joint", updatedAt: now, updatedBy: myId || null, createdAt: prev ? prev.createdAt : now };
    if (prev && prev.value !== value) { it.prevValue = prev.value; it.prevAt = prev.updatedAt || prev.createdAt; }
    else if (prev && prev.prevValue != null) { it.prevValue = prev.prevValue; it.prevAt = prev.prevAt; }
    if (g === "isa") { it.isaType = fIsa.value; var c = parseMoney(el("f-contrib").value); it.contrib = c && !isNaN(c) ? c : 0; it.contribYear = taxYear().label; if (it.isaType === "jisa") { it.child = el("f-child").value.trim() || "Child"; it.owner = "joint"; } }
    if (g === "mortgage" || g === "loan") { var r = parseMoney(el("f-rate").value); it.rate = r != null && !isNaN(r) ? r : null; var m = parseMoney(el("f-monthly").value); it.monthly = m && !isNaN(m) ? m : null; it.end = el("f-end").value || null; }
    if (g === "pension") { var pm = parseMoney(el("f-pmonthly").value); it.pmonthly = pm && !isNaN(pm) ? pm : null; }
    if (g === "credit") { var l = parseMoney(el("f-limit").value); it.limit = l && !isNaN(l) ? l : null; var d = parseInt(el("f-due").value, 10); it.due = d >= 1 && d <= 31 ? d : null; }
    dlg.close(); saveDoc("items", id, it); recordHistory(); render();
  });
  delBtn.addEventListener("click", function () {
    if (!delBtn.classList.contains("armed")) { delBtn.classList.add("armed"); delBtn.textContent = "Delete for both of you"; return; }
    var id = editingId; dlg.close(); delDoc("items", id); recordHistory(); render();
  });

  // ══ Import ═════════════════════════════════════════════════════════════
  var iDlg = el("impDlg"), iBody = el("impBody"), iFoot = el("impFoot"), IMP = null;
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, "");
    var first = text.split(/\r?\n/)[0] || "", delim = [",", ";", "\t"].sort(function (a, b) { return first.split(b).length - first.split(a).length; })[0];
    var rows = [], row = [], f = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
      else if (ch === '"') q = true;
      else if (ch === delim) { row.push(f); f = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(f); f = ""; if (row.some(function (c) { return c.trim() !== ""; })) rows.push(row); row = []; }
      else f += ch;
    }
    row.push(f); if (row.some(function (c) { return c.trim() !== ""; })) rows.push(row);
    return rows.map(function (r) { return r.map(function (c) { return c.trim(); }); });
  }
  var MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
  function parseDate(s) {
    s = String(s || "").trim(); var m, y, mo, d;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/))) { d = +m[1]; mo = +m[2]; y = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})[\s\-]([A-Za-z]{3,9})[\s\-,]*(\d{2,4})/))) { d = +m[1]; mo = MON[m[2].toLowerCase().slice(0, 4)] || MON[m[2].toLowerCase().slice(0, 3)]; y = +m[3]; }
    else return null;
    if (y < 100) y += 2000;
    if (!mo || mo > 12 || !d || d > 31 || y < 1990 || y > 2100) return null;
    return y + "-" + String(mo).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }
  function analyse(rows) {
    var hi = -1;
    for (var i = 0; i < Math.min(rows.length, 15); i++) {
      var low = rows[i].map(function (c) { return c.toLowerCase(); });
      if (low.some(function (c) { return /date/.test(c); }) && rows[i].length >= 3 && !parseDate(rows[i][0])) { hi = i; break; }
    }
    var headers, data;
    if (hi >= 0) { headers = rows[hi]; data = rows.slice(hi + 1); }
    else { var w = Math.max.apply(null, rows.slice(0, 20).map(function (r) { return r.length; })); headers = []; for (var c = 0; c < w; c++) headers.push("Column " + (c + 1)); data = rows; }
    data = data.filter(function (r) { return r.length >= 2; });
    var low2 = headers.map(function (h) { return h.toLowerCase(); });
    function find(pats, not) { for (var p = 0; p < pats.length; p++) for (var j = 0; j < low2.length; j++) if (pats[p].test(low2[j]) && !(not && not.test(low2[j]))) return j; return -1; }
    var map = { date: find([/^date$/, /transaction date/, /^posted/, /date/]), desc: find([/^name$/, /merchant/, /^description$/, /description/, /details/, /narrative/, /payee/, /counter ?party/, /memo/, /reference/]),
      amount: find([/^amount$/, /^amount \(gbp\)$/, /amount/, /^value$/], /local|original|foreign/), out: find([/paid out/, /money out/, /debit/, /withdraw/, /spent/]), in_: find([/paid in/, /money in/, /credit/, /deposit/, /received/]),
      cat: find([/categor/]), bal: find([/balance/]) };
    if (map.out >= 0 && map.in_ >= 0 && (map.amount === map.out || map.amount === map.in_ || map.amount < 0)) map.amount = -1;
    if (hi < 0 || map.date < 0) {
      var sample = data.slice(0, 30), cols = headers.length, scores = [];
      for (var k = 0; k < cols; k++) {
        var ds = 0, ns = 0, len = 0;
        sample.forEach(function (r) { var v = r[k] || ""; if (parseDate(v)) ds++; var n = parseMoney(v); if (n != null && !isNaN(n) && !parseDate(v)) ns++; len += v.length; });
        scores.push({ k: k, ds: ds, ns: ns, len: len });
      }
      if (map.date < 0) map.date = scores.slice().sort(function (a, b) { return b.ds - a.ds; })[0].k;
      if (map.amount < 0 && map.out < 0) { var nums = scores.filter(function (s) { return s.k !== map.date && s.ns > sample.length * 0.6; }); if (nums.length) map.amount = nums[0].k; }
      if (map.desc < 0) map.desc = scores.filter(function (s) { return s.k !== map.date && s.k !== map.amount && s.ns < sample.length * 0.5; }).sort(function (a, b) { return b.len - a.len; }).map(function (s) { return s.k; })[0];
      if (map.desc == null) map.desc = -1;
    }
    if (map.desc < 0) { var usedCols = [map.date, map.amount, map.out, map.in_, map.cat, map.bal]; for (var z = 0; z < headers.length; z++) if (usedCols.indexOf(z) < 0) { map.desc = z; break; } }
    var mode = map.amount >= 0 ? "amount" : "split";
    var pos = 0, tot = 0;
    if (mode === "amount") data.forEach(function (r) { var v = parseMoney(r[map.amount]); if (v != null && !isNaN(v) && v !== 0) { tot++; if (v > 0) pos++; } });
    return { headers: headers, data: data, map: map, mode: mode, flip: tot > 0 && pos / tot > 0.7 };
  }
  function buildRows() {
    var m = IMP.map, out = [], bad = 0;
    IMP.data.forEach(function (r) {
      var d = parseDate(r[m.date]); if (!d) { bad++; return; }
      var a;
      if (IMP.mode === "amount") { a = parseMoney(r[m.amount]); if (a == null || isNaN(a)) { bad++; return; } if (IMP.flip) a = -a; }
      else { var o = m.out >= 0 ? parseMoney(r[m.out]) : 0, i = m.in_ >= 0 ? parseMoney(r[m.in_]) : 0; o = o && !isNaN(o) ? Math.abs(o) : 0; i = i && !isNaN(i) ? Math.abs(i) : 0; if (!o && !i) { bad++; return; } a = Math.round((i - o) * 100) / 100; }
      var raw = m.desc >= 0 ? r[m.desc] : "", desc = cleanDesc(raw) || "Unknown";
      out.push({ d: d, a: a, raw: raw, m: desc, k: merchantKey(desc), c: guessCat(raw, a, m.cat >= 0 ? r[m.cat] : null), bal: m.bal >= 0 ? parseMoney(r[m.bal]) : null });
    });
    return { rows: out, bad: bad };
  }
  function openImport() {
    IMP = null; iBody.innerHTML = '<div class="drop"><p style="font-weight:600">Choose a CSV statement</p><p class="sm muted mt-xs">Download it from your banking app or website, usually under statements or exports. One account per file.</p><input type="file" id="impFile" accept=".csv,text/csv,text/plain"></div>' +
      '<p class="sm muted">The file is read on this device. Only the date, amount, a tidied description and a category are saved. Account numbers, sort codes and long reference numbers are removed first.</p>';
    iFoot.innerHTML = '<div class="right"><button type="button" class="btn btn-neutral" data-close>Cancel</button></div>';
    iDlg.showModal();
    el("impFile").addEventListener("change", function (e) {
      var file = e.target.files[0]; if (!file) return;
      if (file.size > 5e6) { alert("That file is over 5 MB. Export a shorter date range and try again."); return; }
      var rd = new FileReader();
      rd.onload = function () {
        try { var rows = parseCSV(String(rd.result)); if (rows.length < 2) throw new Error("empty"); IMP = analyse(rows); IMP.fileName = file.name; IMP.acc = vals(S.accounts).length ? vals(S.accounts)[0].id : "new"; IMP.newAcc = { name: "", bank: "", owner: "p1", kind: "current" }; renderImport(); }
        catch (err) { iBody.innerHTML = '<p class="err" style="font-size:14px">That file couldn\'t be read as a statement. Check it\'s a CSV export rather than a PDF, then try again.</p>'; }
      };
      rd.readAsText(file);
    });
  }
  function colSelect(key, label, optional) {
    return '<div class="field"><label for="imp-' + key + '">' + label + '</label><select id="imp-' + key + '" data-imp-map="' + key + '">' + (optional ? '<option value="-1">None</option>' : "") +
      IMP.headers.map(function (h, i) { return '<option value="' + i + '"' + (IMP.map[key] === i ? " selected" : "") + ">" + esc(h || "Column " + (i + 1)) + "</option>"; }).join("") + "</select></div>";
  }
  function renderImport() {
    var accs = vals(S.accounts), b = buildRows(), rows = b.rows;
    var dates = rows.map(function (r) { return r.d; }).sort();
    var html = '<p class="sm muted">' + esc(IMP.fileName) + ": " + rows.length + " transactions" + (dates.length ? " from " + esc(txDate(dates[0])) + " " + dates[0].slice(0, 4) + " to " + esc(txDate(dates[dates.length - 1])) + " " + dates[dates.length - 1].slice(0, 4) : "") + (b.bad ? ", " + b.bad + " rows skipped" : "") + "</p>";
    html += '<div class="field"><label for="imp-acc">Which account is this?</label><select id="imp-acc" data-imp="acc">' + accs.map(function (a) { return '<option value="' + esc(a.id) + '"' + (IMP.acc === a.id ? " selected" : "") + ">" + esc(a.name) + " (" + esc(ownerName(a.owner)) + ")</option>"; }).join("") + '<option value="new"' + (IMP.acc === "new" ? " selected" : "") + ">A new account…</option></select></div>";
    if (IMP.acc === "new") {
      html += '<div class="two"><div class="field"><label for="imp-name">Account name</label><input id="imp-name" data-imp-new="name" value="' + esc(IMP.newAcc.name) + '" placeholder="e.g. Hannah\'s Monzo"><p class="err" id="imp-name-err" hidden>Give the account a name.</p></div><div class="field"><label for="imp-bank">Bank</label><input id="imp-bank" data-imp-new="bank" value="' + esc(IMP.newAcc.bank) + '"></div></div>' +
        '<div class="two"><div class="field"><label for="imp-owner">Whose is it?</label><select id="imp-owner" data-imp-new="owner">' + [["p1", S.household.p1], ["p2", S.household.p2], ["joint", "Joint"]].map(function (o) { return '<option value="' + o[0] + '"' + (IMP.newAcc.owner === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></div>" +
        '<div class="field"><label for="imp-kind">Type</label><select id="imp-kind" data-imp-new="kind">' + [["current", "Current account"], ["savings", "Savings account"], ["credit", "Credit card"]].map(function (o) { return '<option value="' + o[0] + '"' + (IMP.newAcc.kind === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></div></div>";
    }
    html += '<details' + (rows.length ? "" : " open") + '><summary class="sm" style="cursor:pointer;font-weight:500">Columns (check these if the preview looks wrong)</summary><div class="dlg-body" style="padding:12px 0 0">' +
      '<div class="two">' + colSelect("date", "Date") + colSelect("desc", "Description") + "</div>" +
      '<div class="field"><label for="imp-mode">Amounts are in</label><select id="imp-mode" data-imp="mode"><option value="amount"' + (IMP.mode === "amount" ? " selected" : "") + '>One column</option><option value="split"' + (IMP.mode === "split" ? " selected" : "") + ">Separate money in and money out columns</option></select></div>" +
      (IMP.mode === "amount" ? colSelect("amount", "Amount") + '<label class="check-one"><input type="checkbox" data-imp="flip"' + (IMP.flip ? " checked" : "") + ">Spending shows as a positive number (common on credit card statements)</label>"
        : '<div class="two">' + colSelect("out", "Money out", true) + colSelect("in_", "Money in", true) + "</div>") +
      '<div class="two">' + colSelect("cat", "Category (optional)", true) + colSelect("bal", "Balance (optional)", true) + "</div></div></details>";
    html += rows.length ? '<div class="scroll-x"><table class="preview"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th style="text-align:right">Amount</th></tr></thead><tbody>' + rows.slice(0, 6).map(function (r) {
      return "<tr><td>" + esc(txDate(r.d)) + '</td><td class="desc">' + esc(r.m) + "</td><td>" + esc(CAT[r.c].label) + '</td><td style="text-align:right" class="num ' + (r.a > 0 ? "pos" : "") + '">' + (r.a > 0 ? "+" : "−") + gbp2(r.a) + "</td></tr>";
    }).join("") + '</tbody></table></div><p class="sm muted">Check that spending shows as −£ and money in as +£. You can fix categories after importing.</p>' : '<p class="err" style="font-size:14px">No transactions found with these columns. Open Columns above and pick the right ones.</p>';
    iBody.innerHTML = html;
    iFoot.innerHTML = '<div class="right"><button type="button" class="btn btn-neutral" data-close>Cancel</button><button type="button" class="btn btn-primary" data-imp-go' + (rows.length ? "" : " disabled") + ">Import " + rows.length + " transactions</button></div>";
  }
  iBody.addEventListener("change", function (e) {
    var t = e.target; if (!IMP) return;
    if (t.hasAttribute("data-imp-map")) IMP.map[t.getAttribute("data-imp-map")] = +t.value;
    else if (t.getAttribute("data-imp") === "acc") IMP.acc = t.value;
    else if (t.getAttribute("data-imp") === "mode") { IMP.mode = t.value; if (IMP.mode === "amount" && IMP.map.amount < 0) IMP.map.amount = 0; }
    else if (t.getAttribute("data-imp") === "flip") IMP.flip = t.checked;
    else if (t.hasAttribute("data-imp-new")) { IMP.newAcc[t.getAttribute("data-imp-new")] = t.value; if (t.getAttribute("data-imp-new") !== "kind") return; }
    else return;
    renderImport();
  });
  iBody.addEventListener("input", function (e) { var t = e.target; if (IMP && t.hasAttribute("data-imp-new")) IMP.newAcc[t.getAttribute("data-imp-new")] = t.value; });
  iFoot.addEventListener("click", function (e) { if (e.target.closest("[data-imp-go]")) doImport(); });
  function doImport() {
    var b = buildRows(), rows = b.rows; if (!rows.length) return;
    var accId = IMP.acc, acc;
    if (accId === "new") {
      var nm = IMP.newAcc.name.trim(); if (!nm) { var er = el("imp-name-err"); if (er) { er.hidden = false; el("imp-name").focus(); } return; }
      accId = newId("a"); acc = { name: nm, bank: IMP.newAcc.bank.trim(), owner: IMP.newAcc.owner, kind: IMP.newAcc.kind, createdAt: new Date().toISOString(), balance: null };
    } else acc = Object.assign({}, S.accounts[accId]);
    var seen = {}, byMonth = {};
    rows.forEach(function (r) {
      var base = accId + "|" + r.d + "|" + r.a + "|" + r.raw; seen[base] = (seen[base] || 0) + 1;
      var tx = { d: r.d, a: r.a, m: r.m, k: r.k, c: r.c, h: hash(base + "#" + seen[base]) };
      (byMonth[r.d.slice(0, 7)] = byMonth[r.d.slice(0, 7)] || []).push(tx);
    });
    var added = 0, skipped = 0;
    Object.keys(byMonth).sort().forEach(function (mk) {
      var id = accId + "_" + mk, ex = S.txdocs[id], list = ex && Array.isArray(ex.list) ? ex.list.slice() : [], have = {};
      list.forEach(function (t) { have[t.h] = 1; });
      byMonth[mk].forEach(function (t) { if (have[t.h]) skipped++; else { list.push(t); added++; } });
      if (!ex || list.length !== ex.list.length) { list.sort(function (x, y) { return x.d < y.d ? 1 : -1; }); saveDoc("tx", id, { acc: accId, month: mk, list: list }); }
    });
    if (IMP.map.bal >= 0) {
      var withBal = rows.filter(function (r) { return r.bal != null && !isNaN(r.bal); });
      if (withBal.length) {
        var newestFirst = rows[0].d >= rows[rows.length - 1].d, latest = withBal.reduce(function (m, r) { return r.d > m ? r.d : m; }, "");
        var same = withBal.filter(function (r) { return r.d === latest; }), pick = newestFirst ? same[0] : same[same.length - 1];
        if (!acc.balanceAt || latest >= acc.balanceAt) { acc.balance = pick.bal; acc.balanceAt = latest; }
      }
    }
    acc.lastImport = new Date().toISOString();
    saveDoc("accounts", accId, acc);
    var months = Object.keys(byMonth).sort(); S.month = months[months.length - 1];
    iBody.innerHTML = '<div class="ok-box"><p style="font-weight:600">Imported ' + added + " transaction" + (added === 1 ? "" : "s") + " into " + esc(acc.name) + ".</p>" + (skipped ? '<p class="sm mt-xs">' + skipped + " were already here, so they were skipped.</p>" : "") + "</div>" +
      '<p class="sm muted">Spot something in the wrong category? Tap it in Spending to change it, and choose whether to apply that to everything from the same place.</p>';
    iFoot.innerHTML = '<div class="right"><button type="button" class="btn btn-neutral" data-imp-again>Import another</button><button type="button" class="btn btn-primary" data-close>Done</button></div>';
    render();
  }
  iFoot.addEventListener("click", function (e) { if (e.target.closest("[data-imp-again]")) openImport(); });

  // ══ Ask Claude (Strategy page) ═════════════════════════════════════════
  var sampleFn = null, sampleReady = false, chatCtl = null;
  S.chat = { turns: [], busy: false, live: "", note: "", off: false };
  function chatContext() {
    var txs = allTx(), m = currentMonth(), hl = health(m, txs), items = vals(S.items), L = [];
    L.push("Household: " + S.household.p1 + " and " + S.household.p2 + " (UK). Today: " + new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) + ". Tax year " + taxYear().label + ".");
    if (hl.checks.length) {
      L.push("\nFINANCIAL HEALTH SCORE: " + (hl.score == null ? "n/a" : hl.score + "/100") + " (" + hl.checks.length + " checks)");
      hl.checks.forEach(function (c) { L.push("- " + c.label + ": " + c.value + ". Aim: " + c.target + ". Score " + Math.round(c.score) + "/100."); });
    }
    var ms = txMonths().slice(-6);
    if (ms.length) {
      L.push("\nCASHFLOW BY MONTH (excluding transfers between own accounts):");
      ms.forEach(function (k) { var s = stats(inMonth(txs, k)); L.push("- " + monthLabel(k, "year") + ": in " + gbp(s.inc) + ", out " + gbp(s.out) + ", net " + signed(s.net)); });
      var avg = catAverages(txs, m), cats = Object.keys(avg).filter(function (k) { return avg[k] > 0; }).sort(function (a, b) { return avg[b] - avg[a]; });
      L.push("\nAVERAGE MONTHLY SPENDING BY CATEGORY (last 3 months):");
      cats.forEach(function (k) { L.push("- " + CAT[k].label + ": " + gbp(avg[k]) + (S.budgets[k] ? " (budget " + gbp(S.budgets[k]) + ")" : "")); });
      var bills = upcomingBills();
      if (bills.length) { L.push("\nREGULAR BILLS DUE SOON:"); bills.forEach(function (b) { L.push("- " + b.name + ": about " + gbp(b.amount, 2) + " around " + b.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })); }); }
    }
    if (items.length) {
      var t = wTotals(items);
      L.push("\nBALANCE SHEET: assets " + gbp(t.assets) + ", liabilities " + gbp(t.liabs) + ", net worth " + signed(t.net) + ".");
      items.slice().sort(function (a, b) { return (b.value || 0) - (a.value || 0); }).forEach(function (i) {
        var G = GROUPS[i.group], bits = [G.label.replace(/s$/, ""), ownerShort(i), gbp(i.value)];
        if (i.group === "isa") bits.push(ISA_TYPES[i.isaType] + ", " + gbp(contribThisYear(i)) + " paid in this tax year");
        if (i.group === "pension" && i.pmonthly) bits.push(gbp(i.pmonthly) + "/month going in");
        if (i.rate != null && i.rate !== "") bits.push(i.rate + "% interest");
        if (i.monthly) bits.push(gbp(i.monthly) + "/month");
        if (i.end) bits.push("ends " + monthLabel(i.end, "year"));
        if (i.limit) bits.push("limit " + gbp(i.limit));
        L.push("- " + (G.side === "liab" ? "[owed] " : "") + i.name + ": " + bits.join(", "));
      });
    }
    var accs = vals(S.accounts).filter(function (a) { return a.balance != null; });
    if (accs.length) { L.push("\nBANK ACCOUNT BALANCES:"); accs.forEach(function (a) { L.push("- " + a.name + " (" + ownerName(a.owner) + ", " + a.kind + "): " + (a.kind === "credit" ? gbp(Math.abs(a.balance)) + " owed" : gbp(a.balance))); }); }
    var goals = vals(S.goals);
    if (goals.length) { L.push("\nSAVINGS GOALS:"); goals.forEach(function (g) { L.push("- " + g.name + ": " + gbp(g.saved) + " of " + gbp(g.target) + (g.by ? " by " + monthLabel(g.by, "year") : "")); }); }
    var costs = vals(S.costs);
    if (costs.length) { L.push("\nPLANNED UPCOMING COSTS:"); costs.forEach(function (c) { L.push("- " + c.label + ": " + gbp(c.amount) + (c.when ? " in " + monthLabel(c.when, "year") : ", date to be confirmed")); }); }
    return L.join("\n");
  }
  function chatRules() {
    return "You are a friendly, straight-talking money coach built into a UK household's private budgeting app, talking with " + S.household.p1 + " and " + S.household.p2 + ". " +
      "Use their figures below to give specific, practical answers, using UK terms, rules and allowances (ISAs, workplace pensions, tax relief, Personal Savings Allowance and so on). Write in British English with £. " +
      "Keep answers short and conversational: a few sentences or a short list, no headings. Show quick sums when they help. " +
      "If something important is missing from the figures, say what and ask. Don't recommend specific named products or providers. " +
      "You are not a regulated financial adviser: for big or irreversible decisions (pension transfers, mortgages, large investments), suggest they speak to an FCA-regulated adviser or the free MoneyHelper service, without repeating this on every answer. " +
      "The figures are the household's own records and may be incomplete.\n\nTHEIR FIGURES:\n" + chatContext();
  }
  function mdLite(t) {
    var out = [], inList = false;
    esc(t).split("\n").forEach(function (line) {
      var l = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      var li = l.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
      if (li) { if (!inList) { out.push("<ul>"); inList = true; } out.push("<li>" + li[1] + "</li>"); return; }
      if (inList) { out.push("</ul>"); inList = false; }
      if (l.trim()) out.push("<p>" + l + "</p>");
    });
    if (inList) out.push("</ul>");
    return out.join("");
  }
  var CHAT_SUGGEST = ["What should we focus on first?", "How can we reach our savings goals sooner?", "Are our pensions on track?", "Where could we cut back without it hurting?"];
  function chatCard() {
    if (S.chat.off || (sampleReady && !sampleFn)) return "";
    var c = S.chat, msgs = c.turns.map(function (t) { return '<div class="msg ' + (t.role === "user" ? "me" : "ai") + '">' + (t.role === "user" ? "<p>" + esc(t.content) + "</p>" : mdLite(t.content)) + "</div>"; }).join("");
    if (c.busy) msgs += '<div class="msg ai" id="chatLive">' + (c.live ? mdLite(c.live) : '<p class="muted">Thinking…</p>') + "</div>";
    return '<div class="card chat-card" style="margin-bottom:24px"><div class="sec-head" style="align-items:flex-start"><div><h2>' + icon("sparkle") + " Ask Claude</h2><p class=\"sm muted mt-xs\">Questions about your money, answered using your own figures</p></div>" +
      (c.turns.length && !c.busy ? '<button class="btn btn-subtle" data-chat="clear">Clear</button>' : "") + "</div>" +
      '<div class="chat-log" id="chatLog" aria-live="polite">' + (msgs || '<div class="chat-empty"><p class="muted mb-md">Try asking:</p><div class="chips">' + CHAT_SUGGEST.map(function (q, i) { return '<button class="chip" data-chat-q="' + i + '">' + esc(q) + "</button>"; }).join("") + "</div></div>") + "</div>" +
      (c.note ? '<p class="err" style="margin:8px 0">' + esc(c.note) + "</p>" : "") +
      '<form class="chat-form" data-chat-form><label for="chatInput" class="sr-only">Your question</label><textarea id="chatInput" rows="2" placeholder="Ask about your budget, savings, pensions…"' + (c.busy ? " disabled" : "") + "></textarea>" +
      (c.busy ? '<button type="button" class="btn btn-neutral" data-chat="stop">Stop</button>' : '<button type="submit" class="btn btn-primary">Send</button>') + "</form>" +
      '<p class="sm faint mt-md">' + icon("shield") + " Each question sends Claude a summary of your figures: totals, balance sheet, budgets, goals and planned costs. Individual transactions aren't included. Chats aren't saved, and each question is paid for from your Anthropic API credit. <button class=\"link\" data-chat=\"shared\">See what's shared</button></p></div>";
  }
  function chatSend(q) {
    q = (q || "").trim(); if (!q || S.chat.busy || !sampleFn) return;
    var c = S.chat; c.note = ""; c.turns.push({ role: "user", content: q.slice(0, 2000) }); c.busy = true; c.live = "";
    render(); scrollChat();
    var turns = c.turns.slice(-12); while (turns.length && turns[0].role !== "user") turns.shift();
    var input = [{ role: "user", content: chatRules() }, { role: "assistant", content: "Got it. I'll use your figures. What would you like to know?" }].concat(turns);
    chatCtl = new AbortController();
    sampleFn(input, { cache: false, signal: chatCtl.signal, onText: function (e) { c.live = e.text; var n = el("chatLive"); if (n) { n.innerHTML = mdLite(e.text); scrollChat(); } } })
      .then(function (r) { c.turns.push({ role: "assistant", content: r.text + (r.truncated ? "\n\n(Cut short, ask me to continue.)" : "") }); })
      .catch(function (e) {
        var code = e && e.code;
        if (e && e.text) c.turns.push({ role: "assistant", content: e.text });
        if (code === "cancelled") {}
        else if (code === "not_granted" || code === "sampling_disabled" || code === "capability_disabled" || code === "capability_removed" || code === "not_declared") c.note = "Ask Claude isn't available: it needs permission to use your Claude account. Reload the page to be asked again.";
        else if (code === "rate_limited" || code === "queue_overflow") c.note = "That's a lot of questions at once. Give it a minute and try again.";
        else if (code === "session_expired") c.note = "Your session has expired. Reload the page and sign in again.";
        else if (code === "not_configured") c.note = "Ask Claude isn't set up yet. Add your Anthropic API key to the ask-claude function in Supabase, as the README explains.";
        else if (code === "prompt_too_large") c.note = "That conversation got too long. Clear it and start a new one.";
        else c.note = "Something went wrong getting an answer. Try again in a moment.";
      })
      .then(function () {
        c.busy = false; c.live = ""; chatCtl = null;
        var back = "";
        if (c.turns.length && c.turns[c.turns.length - 1].role === "user") back = c.turns.pop().content;
        render(); scrollChat(); var ta = el("chatInput"); if (ta) { if (back) ta.value = back; ta.focus(); }
      });
  }
  function scrollChat() { var lg = el("chatLog"); if (lg) lg.scrollTop = lg.scrollHeight; }
  function showShared() {
    openForm({ title: "What Claude sees", fields: [{ type: "html", html: '<p class="sm muted">This summary goes with each question, along with the conversation so far. It\'s built fresh from your figures each time.</p><pre class="shared">' + esc(chatContext()) + "</pre>" }], saveLabel: "Done", onSave: function () {} });
  }
  sampleReady = true;
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-chat],[data-chat-q]"); if (!t || t.closest("dialog")) return;
    if (t.hasAttribute("data-chat-q")) return chatSend(CHAT_SUGGEST[+t.getAttribute("data-chat-q")]);
    var a = t.getAttribute("data-chat");
    if (a === "stop" && chatCtl) chatCtl.abort();
    else if (a === "clear") { S.chat.turns = []; S.chat.note = ""; render(); }
    else if (a === "shared") showShared();
  });
  document.addEventListener("submit", function (e) {
    if (!e.target.hasAttribute("data-chat-form")) return; e.preventDefault();
    var ta = el("chatInput"); if (ta) chatSend(ta.value);
  });
  document.addEventListener("keydown", function (e) {
    if (e.target && e.target.id === "chatInput" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chatSend(e.target.value); }
  });

  // ══ Events ═════════════════════════════════════════════════════════════
  document.querySelectorAll("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target.closest("[data-close]") || e.target === d) d.close(); });
  });
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-page],[data-action],[data-tx],[data-acc],[data-goal],[data-stab],[data-wg],[data-cost-del],[data-cost-todo],[data-witem],[data-wtab],[data-wfilter],[data-fam],[data-go-tx],[data-pick-month],[data-todo-del],[data-bill-todo],[data-bill-ignore],[data-step-todo]");
    if (!t || t.closest("dialog")) return;
    var a;
    if ((a = t.getAttribute("data-page")) !== null) return go(a);
    if ((a = t.getAttribute("data-action")) !== null) {
      if (a === "settings") return openSettings();
      if (a === "health") return openHealth();
      if (a === "model-reset") { var tb = S.model ? S.model.tab : "inv"; S.model = null; S.model0tab = tb; return render(); }
      if (!S.canWrite) return;
      if (a === "import") return openImport();
      if (a === "budgets") return openBudgets();
      if (a === "addtx") return openAddTx();
      if (a === "goal") return openGoal(null);
      if (a === "witem") return openItem(null, t.getAttribute("data-group"));
      return;
    }
    if ((a = t.getAttribute("data-tx")) !== null) return S.canWrite && openTx(a);
    if ((a = t.getAttribute("data-acc")) !== null) return S.canWrite && openAccount(a);
    if ((a = t.getAttribute("data-stab")) !== null) { S.model.tab = a; return render(); }
    if ((a = t.getAttribute("data-wg")) !== null) { S.wgSel = a; return render(); }
    if ((a = t.getAttribute("data-cost-del")) !== null) { if (S.canWrite) { delDoc("costs", a); render(); } return; }
    if ((a = t.getAttribute("data-cost-todo")) !== null) {
      var cst = S.costs[a]; if (!cst || !S.canWrite) return;
      var cl = cst.label + ", about " + gbp(cst.amount) + (cst.when ? " (" + monthLabel(cst.when, "long") + ")" : "");
      if (!vals(S.todos).some(function (x) { return x.label === cl; })) saveDoc("todos", newId("t"), { label: cl, done: false, who: "", createdAt: new Date().toISOString() });
      return render();
    }
    if ((a = t.getAttribute("data-goal")) !== null) return S.canWrite && openGoal(a);
    if ((a = t.getAttribute("data-witem")) !== null) return S.canWrite && openItem(a);
    if ((a = t.getAttribute("data-wtab")) !== null) { S.wealthTab = a; return render(); }
    if ((a = t.getAttribute("data-wfilter")) !== null) { S.wealthFilter = a; return render(); }
    if ((a = t.getAttribute("data-fam")) !== null) { S.famTab = a; render(); return window.scrollTo(0, 0); }
    if ((a = t.getAttribute("data-go-tx")) !== null) { S.txq = { q: "", month: currentMonth(), who: a || "all", cat: "all", acc: "all" }; return go("transactions"); }
    if ((a = t.getAttribute("data-pick-month")) !== null) { S.month = a; return render(); }
    if ((a = t.getAttribute("data-todo-del")) !== null) { delDoc("todos", a); return render(); }
    if ((a = t.getAttribute("data-bill-todo")) !== null) {
      var bill = upcomingBills().filter(function (b) { return b.key === a; })[0]; if (!bill) return;
      var label = "Pay " + bill.name + ", about " + gbp(bill.amount, 2) + " (around " + bill.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ")";
      if (!vals(S.todos).some(function (x) { return x.label === label; })) saveDoc("todos", newId("t"), { label: label, done: false, who: "", createdAt: new Date().toISOString() });
      return render();
    }
    if ((a = t.getAttribute("data-step-todo")) !== null) {
      var hc = health(currentMonth(), allTx()).checks.filter(function (c) { return c.key === a && c.step; })[0];
      if (hc && !stepAdded(hc.step.title)) saveDoc("todos", newId("t"), { label: hc.step.title, done: false, who: "", createdAt: new Date().toISOString() });
      return render();
    }
    if ((a = t.getAttribute("data-bill-ignore")) !== null) { S.billsIgnore = S.billsIgnore.concat([a]); saveMeta("bills", { ignore: S.billsIgnore }); return render(); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target; if (t.closest("dialog")) return;
    if (t.hasAttribute("data-month")) { S.month = t.value; return render(); }
    if (t.hasAttribute("data-todo-toggle")) { var td = S.todos[t.getAttribute("data-todo-toggle")]; if (td) { saveDoc("todos", td.id, Object.assign({}, td, { done: t.checked })); render(); } return; }
    if (t.hasAttribute("data-todo-who")) { var tw = S.todos[t.getAttribute("data-todo-who")]; if (tw) saveDoc("todos", tw.id, Object.assign({}, tw, { who: t.value })); return; }
    if (t.hasAttribute("data-txq") && t.tagName === "SELECT") { S.txq[t.getAttribute("data-txq")] = t.value; render(); }
  });
  var searchTimer;
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.getAttribute && t.getAttribute("data-sl") && S.model) {
      var parts = t.getAttribute("data-sl").split("."), v = parseFloat(t.value); if (!isFinite(v)) return;
      v = Math.min(Math.max(v, +t.min), +t.max); S.model[parts[0]][parts[1]] = v;
      root.querySelectorAll('[data-sl="' + t.getAttribute("data-sl") + '"]').forEach(function (o) { if (o !== t) o.value = v; });
      var mo = el("modelOut"); if (mo) mo.innerHTML = modelOut(); return;
    }
    if (t.getAttribute && t.getAttribute("data-txq") === "q") {
      S.txq.q = t.value; clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { var pos = t.selectionStart; render(); var n = root.querySelector('[data-txq="q"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } }, 200);
    }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.hasAttribute("data-cost-form")) {
      e.preventDefault(); if (!S.canWrite) return;
      var lbl = el("costLabel").value.trim(), amt = parseMoney(el("costAmount").value), when = el("costWhen").value, er = el("costErr");
      if (!lbl) { er.textContent = "Say what the cost is."; er.hidden = false; el("costLabel").focus(); return; }
      if (amt == null || isNaN(amt) || amt <= 0) { er.textContent = "Add an estimate, like 250."; er.hidden = false; el("costAmount").focus(); return; }
      saveDoc("costs", newId("c"), { label: lbl.slice(0, 120), amount: amt, when: /^\d{4}-\d{2}$/.test(when) ? when : null, createdAt: new Date().toISOString() });
      render(); var n2 = el("costLabel"); if (n2) n2.focus(); return;
    }
    if (!e.target.hasAttribute("data-todo-form")) return; e.preventDefault();
    var inp = el("todoInput"), label = inp.value.trim(); if (!label || !S.canWrite) return;
    saveDoc("todos", newId("t"), { label: label.slice(0, 200), done: false, who: "", createdAt: new Date().toISOString() });
    render(); var n = el("todoInput"); if (n) n.focus();
  });
  root.addEventListener("keydown", function (e) {
    var tab = e.target.closest && e.target.closest('[role="tab"]'); if (!tab || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
    var attr = tab.hasAttribute("data-stab") ? "data-stab" : "data-wtab";
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[' + attr + ']')), i = (tabs.indexOf(tab) + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length, v = tabs[i].getAttribute(attr);
    if (attr === "data-stab") S.model.tab = v; else S.wealthTab = v;
    render(); var nt = root.querySelector('[' + attr + '="' + v + '"]'); if (nt) nt.focus();
  });
  root.addEventListener("mouseover", function (e) {
    var r = e.target.closest && e.target.closest("[data-proj]"); if (!r) return;
    var p = PROJ[+r.getAttribute("data-proj")]; if (!p) return;
    var yr = el("projYr"), vl = el("projVal"), cn = el("projCon"), dot = el("projDot"), ln = el("projLine");
    if (yr) yr.textContent = "Year " + p.y; if (vl) vl.textContent = gbp(p.v); if (cn && p.c != null) cn.textContent = "(" + gbp(p.c) + " put in)";
    if (dot) { dot.setAttribute("cx", r.getAttribute("data-x")); dot.setAttribute("cy", r.getAttribute("data-y")); }
    if (ln) { ln.setAttribute("x1", r.getAttribute("data-x")); ln.setAttribute("x2", r.getAttribute("data-x")); ln.setAttribute("opacity", "1"); }
  });

  // ══ Start (your own hosting: Supabase) ═════════════════════════════════
  var CFG = window.OUR_MONEY_CONFIG || {}, sb = null, hid = null, session = null;
  var IDLE_MINUTES = CFG.signOutAfterMinutes || 30;

  function goLocal() {}

  // ── Data store: same shape as the one the app used inside Claude ──────
  function makeStore(client, householdId) {
    var cache = {}, subs = [], loaded = false;
    function snapshot(s) {
      var m = cache[s.coll] || {};
      if (s.id) { var d = m[s.id]; s.cb({ exists: !!d, data: function () { return d; } }); }
      else s.cb({ docs: Object.keys(m).map(function (id) { return { id: id, data: function () { return m[id]; } }; }) });
    }
    function emit(coll) { subs.forEach(function (s) { if (s.coll === coll) snapshot(s); }); }
    function emitAll() { subs.forEach(snapshot); }
    function fail(e) { subs.forEach(function (s) { if (s.err) s.err(e); }); }
    function loadAll() {
      var next = {}, from = 0, PAGE = 1000;
      function page() {
        return client.from("docs").select("collection,id,data").eq("household_id", householdId).order("collection").order("id").range(from, from + PAGE - 1).then(function (r) {
          if (r.error) throw r.error;
          r.data.forEach(function (row) { (next[row.collection] = next[row.collection] || {})[row.id] = row.data; });
          if (r.data.length === PAGE) { from += PAGE; return page(); }
          cache = next; loaded = true; emitAll();
        });
      }
      return page().catch(function (e) { console.error(e); fail(e); });
    }
    function on(coll, id, cb, err) { var s = { coll: coll, id: id, cb: cb, err: err }; subs.push(s); if (loaded) snapshot(s); return function () { subs = subs.filter(function (x) { return x !== s; }); }; }
    function put(coll, id, data) {
      (cache[coll] = cache[coll] || {})[id] = data; emit(coll);
      return client.from("docs").upsert({ household_id: householdId, collection: coll, id: id, data: data }).then(function (r) { if (r.error) { var e = new Error(r.error.message); e.code = "unavailable"; throw e; } });
    }
    function del(coll, id) {
      if (cache[coll]) delete cache[coll][id]; emit(coll);
      return client.from("docs").delete().match({ household_id: householdId, collection: coll, id: id }).then(function (r) { if (r.error) { var e = new Error(r.error.message); e.code = "unavailable"; throw e; } });
    }
    function docRef(coll, id) { return { set: function (d) { return put(coll, id, d); }, delete: function () { return del(coll, id); }, onSnapshot: function (cb, err) { return on(coll, id, cb, err); } }; }
    // Live changes from the other person
    client.channel("docs-" + householdId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "docs", filter: "household_id=eq." + householdId }, function (p) { var r = p.new; (cache[r.collection] = cache[r.collection] || {})[r.id] = r.data; emit(r.collection); })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "docs", filter: "household_id=eq." + householdId }, function (p) { var r = p.new; (cache[r.collection] = cache[r.collection] || {})[r.id] = r.data; emit(r.collection); })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "docs" }, function (p) { var r = p.old || {}; if (r.household_id !== householdId || !cache[r.collection]) return; delete cache[r.collection][r.id]; emit(r.collection); })
      .subscribe(function (status) { if (status === "SUBSCRIBED" && loaded) loadAll(); });
    // Catch up after the phone sleeps or the tab is in the background
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && loaded) loadAll(); });
    loadAll();
    return {
      collection: function (coll) { return { doc: function (id) { return docRef(coll, id); }, onSnapshot: function (cb, err) { return on(coll, null, cb, err); } }; },
      doc: function (path) { var p = path.split("/"); return docRef(p[0], p[1]); },
      bulk: function (rows) {
        var chunks = []; for (var i = 0; i < rows.length; i += 200) chunks.push(rows.slice(i, i + 200));
        return chunks.reduce(function (pr, ch) {
          return pr.then(function () { return client.from("docs").upsert(ch.map(function (r) { return { household_id: householdId, collection: r.collection, id: r.id, data: r.data }; })).then(function (res) { if (res.error) throw res.error; }); });
        }, Promise.resolve()).then(loadAll);
      }
    };
  }

  // ── Sign-in screens ───────────────────────────────────────────────────
  function authShow(html) {
    document.querySelector(".app").hidden = true; el("auth").hidden = false; el("authBody").innerHTML = html;
    var f = el("auth").querySelector("input"); if (f) f.focus();
  }
  function authErr(t) { var m = el("authErr"); if (m) { m.textContent = t; m.hidden = !t; } }
  function busy(btn, on, label) { if (btn) { btn.disabled = on; if (label) btn.textContent = label; } }
  function showSignIn(msg) {
    authShow('<form id="signInForm" novalidate><div class="field"><label for="authEmail">Email</label><input id="authEmail" type="email" autocomplete="username" required></div>' +
      '<div class="field"><label for="authPass">Password</label><input id="authPass" type="password" autocomplete="current-password" required></div>' +
      '<p class="err" id="authErr"' + (msg ? "" : " hidden") + ">" + esc(msg || "") + '</p><button class="btn btn-primary auth-btn" type="submit">Sign in</button></form>' +
      '<p class="sm muted mt-md">Forgotten your password? Ask whoever set this up to reset it in Supabase.</p>');
    el("signInForm").addEventListener("submit", function (e) {
      e.preventDefault(); var btn = e.target.querySelector("button"); busy(btn, true, "Signing in…");
      sb.auth.signInWithPassword({ email: el("authEmail").value.trim(), password: el("authPass").value }).then(function (r) {
        if (r.error) { busy(btn, false, "Sign in"); authErr("That email and password didn't match."); return; }
        session = r.data.session; afterSignIn();
      });
    });
  }
  function afterSignIn() {
    sb.auth.mfa.getAuthenticatorAssuranceLevel().then(function (r) {
      if (r.error) return showSignIn("Something went wrong. Try again.");
      if (r.data.currentLevel === "aal2") return enterApp();
      return sb.auth.mfa.listFactors().then(function (f) {
        var all = (f.data && f.data.all) || [], ok = all.filter(function (x) { return x.factor_type === "totp" && x.status === "verified"; })[0];
        if (ok) return showCode(ok.id);
        var stale = all.filter(function (x) { return x.status !== "verified"; });
        return Promise.all(stale.map(function (x) { return sb.auth.mfa.unenroll({ factorId: x.id }); })).then(showEnroll);
      });
    });
  }
  function codeForm(intro, extra) {
    return intro + (extra || "") + '<form id="codeForm" novalidate><div class="field"><label for="authCode">6-digit code</label><input id="authCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" required></div>' +
      '<p class="err" id="authErr" hidden></p><button class="btn btn-primary auth-btn" type="submit">Confirm</button></form><p class="sm mt-md"><button class="link" type="button" id="authOut">Sign out</button></p>';
  }
  function bindCode(factorId) {
    el("authOut").onclick = function () { sb.auth.signOut().then(function () { showSignIn(); }); };
    el("codeForm").addEventListener("submit", function (e) {
      e.preventDefault(); var code = el("authCode").value.replace(/\D/g, ""), btn = e.target.querySelector("button");
      if (code.length !== 6) return authErr("Enter the 6-digit code from your authenticator app.");
      busy(btn, true, "Checking…");
      sb.auth.mfa.challengeAndVerify({ factorId: factorId, code: code }).then(function (r) {
        if (r.error) { busy(btn, false, "Confirm"); el("authCode").value = ""; return authErr("That code didn't work. Codes change every 30 seconds, so try the current one."); }
        enterApp();
      });
    });
  }
  function showCode(factorId) {
    authShow(codeForm('<p class="muted mb-md">Enter the code from your authenticator app.</p>'));
    bindCode(factorId);
  }
  function clearUnverified() {
    return sb.auth.mfa.listFactors().then(function (f) {
      var stale = ((f.data && f.data.all) || []).filter(function (x) { return x.status !== "verified"; });
      return Promise.all(stale.map(function (x) { return sb.auth.mfa.unenroll({ factorId: x.id }); }));
    }).catch(function () {});
  }
  function enrollTotp() {
    return sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Our money " + Date.now() }).then(function (r) {
      if (!r.error) return r;
      console.warn("TOTP enrol failed, retrying", r.error);
      return clearUnverified().then(function () { return sb.auth.mfa.enroll({ factorType: "totp" }); });
    });
  }
  function showEnroll() {
    enrollTotp().then(function (r) {
      if (r.error) {
        var detail = [r.error.status, r.error.code, r.error.message].filter(Boolean).join(" · ");
        console.error("TOTP enrol failed", r.error);
        return showSignIn("Couldn't start two-factor set-up. Supabase said: " + (detail || "no details") + ". Send this message to whoever set this up.");
      }
      authShow(codeForm('<h2 class="mb-xs">Set up two-factor sign-in</h2><p class="sm muted mb-md">This keeps your finances safe even if someone learns your password. Scan this with an authenticator app (such as Google Authenticator, Microsoft Authenticator or 1Password), then enter the code it shows.</p>',
        '<div class="qr"><img alt="QR code for your authenticator app" src="' + esc(r.data.totp.qr_code) + '"></div><p class="sm muted mb-md">Can\'t scan it? Enter this key instead: <code class="secret">' + esc(r.data.totp.secret) + "</code></p>"));
      bindCode(r.data.id);
    });
  }

  // ── Into the app ──────────────────────────────────────────────────────
  var entered = false;
  function enterApp() {
    sb.from("members").select("household_id").limit(1).then(function (r) {
      if (r.error || !r.data || !r.data.length) {
        authShow('<p class="muted mb-md">You\'re signed in, but your account isn\'t linked to the household yet. Run the second setup script in Supabase with your email address, then reload this page.</p><button class="btn btn-neutral" id="authOut">Sign out</button>');
        el("authOut").onclick = function () { sb.auth.signOut().then(function () { location.reload(); }); };
        return;
      }
      if (entered) return; entered = true;
      hid = r.data[0].household_id;
      el("auth").hidden = true; document.querySelector(".app").hidden = false;
      sb.auth.getUser().then(function (u) { var user = u.data && u.data.user; if (user) { myId = user.id; el("meAvatar").textContent = (user.email || "?").slice(0, 1).toUpperCase(); } });
      sb.auth.getSession().then(function (s) { session = s.data.session; });
      S.canWrite = true;
      sampleFn = CFG.askClaude === false ? null : askViaServer;
      restoreBackup = doRestore;
      signOut = function () { sb.auth.signOut().then(function () { location.reload(); }); };
      attach(makeStore(sb, hid));
      startIdle();
    });
  }
  function doRestore(file) {
    var rd = new FileReader();
    rd.onload = function () {
      var j; try { j = JSON.parse(String(rd.result)); } catch (e) { return alert("That file isn't a backup from this app."); }
      if (!j || j.app !== "our-money" || !j.docs) return alert("That file isn't a backup from this app.");
      var rows = [];
      Object.keys(j.docs).forEach(function (coll) {
        if (!/^[a-z]{1,20}$/.test(coll)) return;
        Object.keys(j.docs[coll] || {}).forEach(function (id) { var d = j.docs[coll][id]; if (d && typeof d === "object" && id.length <= 120) rows.push({ collection: coll, id: id, data: d }); });
      });
      if (!rows.length) return alert("That backup is empty.");
      if (!confirm("Restore " + rows.length + " records from the backup made on " + String(j.exportedAt || "").slice(0, 10) + "? Anything with the same name here will be replaced.")) return;
      gDlg.close();
      db.bulk(rows).then(function () { alert("Backup restored."); }).catch(function (e) { console.error(e); alert("Some of the backup couldn't be restored. Try again."); });
    };
    rd.readAsText(file);
  }
  function startIdle() {
    var t, ms = IDLE_MINUTES * 60000;
    function reset() { clearTimeout(t); t = setTimeout(function () { sb.auth.signOut().then(function () { location.reload(); }); }, ms); }
    ["click", "keydown", "touchstart", "scroll"].forEach(function (ev) { document.addEventListener(ev, reset, { passive: true }); });
    reset();
  }

  // ── Ask Claude, via your Supabase edge function ────────────────────────
  function askViaServer(input, opts) {
    var system = input[0] && input[0].role === "user" ? input[0].content : "", msgs = input.slice(2);
    return sb.auth.getSession().then(function (s) {
      var tok = s.data.session && s.data.session.access_token;
      return fetch(CFG.supabaseUrl.replace(/\/$/, "") + "/functions/v1/ask-claude", {
        method: "POST", signal: opts && opts.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + tok, apikey: CFG.supabaseAnonKey },
        body: JSON.stringify({ system: system, messages: msgs })
      });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) {
          var code = r.status === 429 ? "rate_limited" : r.status === 413 ? "prompt_too_large" : (r.status === 401 || r.status === 403) ? "session_expired" : (r.status === 503 || r.status === 404) ? "not_configured" : "upstream_error";
          throw { code: code };
        }
        if (opts && opts.onText) opts.onText({ text: j.text || "", delta: j.text || "" });
        return { text: j.text || "", truncated: !!j.truncated };
      });
    }).catch(function (e) { if (e && e.name === "AbortError") throw { code: "cancelled" }; throw e && e.code ? e : { code: "upstream_error" }; });
  }

  function attach(d) {
      db = d; S.mode = "shared";
      var need = ["items", "accounts", "tx", "costs", "goals", "todos", "household", "history", "rules", "bills", "budgets"], got = {};
      function ready(k) { if (!got[k]) { got[k] = 1; if (need.every(function (n) { return got[n]; })) S.loaded = true; } render(); }
      function onErr(e) { if (e && e.code === "revoked") { S.canWrite = false; render(); } else console.error(e); }
      ["items", "accounts", "tx", "costs", "goals", "todos"].forEach(function (coll) {
        db.collection(coll).onSnapshot(function (snap) {
          var next = {}; snap.docs.forEach(function (doc) { var v = doc.data(); if (v) next[doc.id] = Object.assign({ id: doc.id }, v); });
          if (coll === "items") Object.keys(next).forEach(function (k) { if (!GROUPS[next[k].group]) delete next[k]; });
          S[STORE[coll]] = next; if (coll === "tx" || coll === "accounts") dirtyTx(); ready(coll);
        }, onErr);
      });
      db.doc("meta/household").onSnapshot(function (s) { if (s.exists) { var v = s.data(); S.household = { household: v.household || "Our household", p1: v.p1 || "Person 1", p2: v.p2 || "Person 2" }; } ready("household"); }, onErr);
      db.doc("meta/history").onSnapshot(function (s) { S.history = s.exists ? { points: s.data().points || {} } : { points: {} }; ready("history"); }, onErr);
      db.doc("meta/rules").onSnapshot(function (s) { S.rules = s.exists ? (s.data().map || {}) : {}; dirtyTx(); ready("rules"); }, onErr);
      db.doc("meta/budgets").onSnapshot(function (s) { S.budgets = s.exists ? (s.data().map || {}) : {}; ready("budgets"); }, onErr);
      db.doc("meta/bills").onSnapshot(function (s) { S.billsIgnore = s.exists ? (s.data().ignore || []) : []; ready("bills"); }, onErr);
  }
  function start() {
    if (!window.supabase || !CFG.supabaseUrl || !CFG.supabaseAnonKey || /YOUR-/.test(CFG.supabaseUrl + CFG.supabaseAnonKey)) {
      authShow('<p class="err" style="font-size:14px">This site isn\'t connected to Supabase yet. Add your project URL and public key to <code>config.js</code>, as the README explains.</p>');
      return;
    }
    sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } });
    sb.auth.getSession().then(function (r) { session = r.data.session; if (session) afterSignIn(); else showSignIn(); });
  }
  try { start(); } catch (e) { console.error(e); }
})();
