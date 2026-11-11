(function () {
  "use strict";

  var SITE = window.SITE || {};
  var CATS = { gt: "Gas turbines", aero: "Aeroderivative", recip: "Reciprocating engines" };
  var CAT_SHORT = { gt: "Gas turbine", aero: "Aeroderivative", recip: "Reciprocating" };
  var CAT_SINGULAR = { gt: "Gas turbine", aero: "Aeroderivative gas turbine", recip: "Reciprocating engine" };
  var CAT_TONE = { gt: "#12171d", aero: "#6b737b", recip: "#b3afa5" };

  var pad = function (n) { return n < 10 ? "0" + n : String(n); };
  var lots = (window.LISTINGS || []).map(function (l, i) {
    var n = i + 1;
    return Object.assign({ makers: [], tags: [], specs: [] }, l, { n: n, ref: "Lot " + pad(n), id: "lot-" + pad(n) });
  });

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var fmt = function (n, d) { return n.toLocaleString("en-US", { maximumFractionDigits: d == null ? 1 : d }); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function fullName(l) { return (l.maker ? l.maker + " " : "") + l.model + (l.variant ? ", " + l.variant : ""); }
  function makerLine(l) { return l.maker || "Manufacturer on request"; }
  function unitsText(l) { return l.unitsLabel || (l.units ? fmt(l.units, 0) : ""); }
  function mwText(l) { return l.mwLabel || (l.mw ? fmt(l.mw, 2) : ""); }

  /* ---------- Shared pieces ---------- */
  function media(l, cls, opts) {
    opts = opts || {};
    var box = el("div", { class: "media" + (cls ? " " + cls : "") });
    if (l.img) {
      var full = "images/" + l.img + ".webp";
      var img = el("img", { src: opts.thumb ? "images/thumbs/" + l.img + ".webp" : full, alt: opts.decorative ? "" : (l.alt || fullName(l)), class: "fit-" + (l.fit || "photo"), decoding: "async" });
      if (opts.thumb) img.addEventListener("error", function onErr() { img.removeEventListener("error", onErr); img.src = full; });
      if (!opts.eager) img.setAttribute("loading", "lazy");
      box.appendChild(img);
    } else {
      var art = el("div", { class: "media__art" });
      art.innerHTML = '<svg viewBox="0 0 400 200" aria-hidden="true"><use href="#art-' + (l.cat === "recip" ? "engine" : "turbine") + '"/></svg><span>Photographs on request</span>';
      box.appendChild(art);
    }
    return box;
  }

  function title(tag, cls, l) {
    return el(tag, { class: cls }, [l.model, l.variant ? " " : null, l.variant ? el("span", { text: l.variant }) : null]);
  }

  function openButton(l, inner, cls) {
    var b = el("button", { class: "open" + (cls ? " " + cls : ""), type: "button", "aria-label": "Open " + l.ref + ": " + fullName(l) });
    b.appendChild(inner);
    b.addEventListener("click", function (e) { e.stopPropagation(); openLot(l); });
    return b;
  }

  function nil() { return el("span", { class: "nil", "aria-label": "Not stated", text: "—" }); }

  /* ---------- Featured ---------- */
  function feature(l) {
    var facts = [
      ["Units", unitsText(l)],
      ["Output", l.mw ? mwText(l) + " MW" : ""],
      ["Condition", (l.tags || [])[0] || ""],
      [l.price ? "Price, " + (l.priceBasis || "") : "Price", l.price || "On request", !l.price],
    ];
    var dl = el("dl", { class: "feature__facts" }, facts.map(function (f) {
      return el("div", { class: f[2] || !f[1] ? "is-por" : "" }, [el("dt", { text: f[0] }), el("dd", { text: f[1] || "On request" })]);
    }));
    return el("article", { class: "feature" }, [
      media(l, "feature__media", { eager: true }),
      el("div", { class: "feature__head" }, [el("span", { class: "ref", text: l.ref }), el("span", { class: "feature__type", text: CAT_SINGULAR[l.cat] })]),
      el("p", { class: "feature__maker", text: makerLine(l) }),
      openButton(l, title("h3", "feature__title", l)),
      l.blurb ? el("p", { class: "feature__blurb", text: l.blurb }) : null,
      dl,
    ]);
  }

  /* ---------- Schedule: table rows and gallery cards ---------- */
  function priceCell(l) {
    if (!l.price) return [el("span", { class: "por", text: "On request" })];
    return [el("span", { class: "amount", text: l.price }), el("span", { class: "basis", text: l.priceBasis || "" })];
  }

  function row(l) {
    var tr = el("tr", { class: "row", id: l.id }, [
      el("td", { class: "c-lot" }, [el("span", { class: "ref", text: pad(l.n) })]),
      el("td", { class: "c-eq" }, [
        el("div", { class: "row__eq" }, [
          media(l, "row__thumb", { thumb: true, decorative: true }),
          el("div", { class: "row__text" }, [
            el("span", { class: "row__maker" }, [el("span", { class: "ref row__ref-mobile", text: l.ref }), makerLine(l)]),
            openButton(l, title("span", "row__title", l)),
            el("span", { class: "row__summary", text: l.summary }),
          ]),
        ]),
      ]),
      el("td", { class: "c-type", text: CAT_SHORT[l.cat] }),
      el("td", { class: "c-num c-units", "data-label": "Units" }, [unitsText(l) || nil()]),
      el("td", { class: "c-num c-mw", "data-label": "Output MW" }, [mwText(l) || nil()]),
      el("td", { class: "c-notes" }, [l.tags.length ? l.tags.join(" · ") : nil()]),
      el("td", { class: "c-price", "data-label": "Price" }, priceCell(l)),
    ]);
    tr.addEventListener("click", function () {
      if (String(window.getSelection && window.getSelection())) return;
      openLot(l);
    });
    return tr;
  }

  function card(l) {
    return el("article", { class: "card" }, [
      media(l, "card__media"),
      el("div", { class: "card__head" }, [el("span", { class: "ref", text: l.ref }), el("span", { text: CAT_SHORT[l.cat] })]),
      el("p", { class: "card__maker", text: makerLine(l) }),
      openButton(l, title("h3", "card__title", l)),
      el("p", { class: "card__summary", text: l.summary }),
      el("div", { class: "card__foot" }, [
        el("div", {}, [
          el("span", {}, priceCell(l)),
          l.tags.length ? el("span", { class: "card__notes", text: l.tags[0] }) : null,
        ]),
      ]),
    ]);
  }

  /* ---------- State ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  var state = { cat: "all", maker: "all", sort: "lot", priced: false, view: store.get("pe-view") === "grid" ? "grid" : "table" };
  var visible = lots.slice();

  var rows = {}, cards = {};
  lots.forEach(function (l) { rows[l.id] = row(l); cards[l.id] = card(l); });

  function matches(l) {
    return (state.cat === "all" || l.cat === state.cat) &&
      (state.maker === "all" || l.makers.indexOf(state.maker) > -1) &&
      (!state.priced || !!l.price);
  }

  function render() {
    var list = lots.filter(matches);
    if (state.sort === "mw") list.sort(function (a, b) { return (b.mw || -1) - (a.mw || -1) || a.n - b.n; });
    if (state.sort === "units") list.sort(function (a, b) { return (b.units || -1) - (a.units || -1) || a.n - b.n; });
    visible = list;

    var tbody = $("[data-rows]"), grid = $("[data-grid]");
    tbody.replaceChildren.apply(tbody, list.map(function (l) { return rows[l.id]; }));
    grid.replaceChildren.apply(grid, list.map(function (l) { return cards[l.id]; }));

    var none = list.length === 0;
    $("[data-ledger]").hidden = none || state.view !== "table";
    grid.hidden = none || state.view !== "grid";
    $("[data-empty]").hidden = !none;
    $("[data-count]").textContent = list.length === lots.length
      ? lots.length + " lots"
      : list.length + " of " + lots.length + " lots shown";

    $$("[data-types] .tab").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat)); });
    $$("[data-view]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.view === state.view)); });
    $("[data-sort]").value = state.sort;
    $$("[data-sort-col]").forEach(function (th) {
      var col = th.getAttribute("data-sort-col");
      if (col === state.sort) th.setAttribute("aria-sort", col === "lot" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });
  }

  function buildFilters() {
    var types = $("[data-types]");
    [["all", "All lots"]].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k]]; })).forEach(function (t) {
      var count = t[0] === "all" ? lots.length : lots.filter(function (l) { return l.cat === t[0]; }).length;
      var tab = el("button", { class: "tab", type: "button", "data-cat": t[0], "aria-pressed": "false" }, [t[1], el("span", { text: String(count) })]);
      tab.addEventListener("click", function () { state.cat = t[0]; render(); });
      types.appendChild(tab);
    });

    var makers = {};
    lots.forEach(function (l) { l.makers.forEach(function (m) { makers[m] = (makers[m] || 0) + 1; }); });
    var order = Object.keys(makers).sort(function (a, b) { return makers[b] - makers[a] || a.localeCompare(b); });
    var sel = $("[data-maker]");
    sel.appendChild(el("option", { value: "all", text: "All" }));
    order.forEach(function (m) { sel.appendChild(el("option", { value: m, text: m + " (" + makers[m] + ")" })); });
    sel.addEventListener("change", function () { state.maker = sel.value; render(); });

    $("[data-sort]").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
    $("[data-priced]").addEventListener("change", function (e) { state.priced = e.target.checked; render(); });
    $$("[data-view]").forEach(function (b) {
      b.addEventListener("click", function () { state.view = b.dataset.view; store.set("pe-view", state.view); render(); });
    });
    $$("[data-sort-col]").forEach(function (th) {
      var col = th.getAttribute("data-sort-col");
      var btn = el("button", { class: "sort-btn", type: "button" });
      while (th.firstChild) btn.appendChild(th.firstChild);
      th.appendChild(btn);
      btn.addEventListener("click", function () { state.sort = col; render(); });
    });
    $("[data-reset]").addEventListener("click", function () {
      state.cat = "all"; state.maker = "all"; state.priced = false;
      sel.value = "all"; $("[data-priced]").checked = false; render();
    });
    return order;
  }

  /* ---------- Capacity by type ---------- */
  function buildCapacity() {
    var total = 0, stated = 0;
    var data = Object.keys(CATS).map(function (k) {
      var group = lots.filter(function (l) { return l.cat === k; });
      var d = {
        key: k, lots: group.length,
        units: group.reduce(function (s, l) { return s + (l.units || 0); }, 0),
        mw: group.reduce(function (s, l) { return s + (l.mw || 0); }, 0),
        withMw: group.filter(function (l) { return l.mw; }).length,
      };
      total += d.mw; stated += d.withMw;
      return d;
    });

    $("[data-cap-lede]").textContent = fmt(Math.round(total), 0) + " MW is stated across " + stated + " of " + lots.length +
      " lots. Output for the remaining " + (lots.length - stated) + " lots is available on request, so the shares below describe stated output only.";

    var bar = $("[data-cap-bar]");
    bar.setAttribute("aria-label", data.map(function (d) { return CATS[d.key] + " " + fmt(Math.round(d.mw), 0) + " MW"; }).join(", "));
    data.forEach(function (d) {
      bar.appendChild(el("span", { style: "flex:" + d.mw + " 0 0;background:" + CAT_TONE[d.key], title: CATS[d.key] + ": " + fmt(Math.round(d.mw), 0) + " MW" }));
    });

    var tbody = $("[data-cap-rows]");
    data.forEach(function (d) {
      var btn = el("button", { class: "link", type: "button", text: "Show lots" });
      btn.addEventListener("click", function () {
        state.cat = d.key; render();
        $("#schedule").scrollIntoView();
      });
      tbody.appendChild(el("tr", {}, [
        el("td", {}, [el("span", { class: "capacity__type" }, [el("span", { class: "swatch", style: "background:" + CAT_TONE[d.key], "aria-hidden": "true" }), CATS[d.key]])]),
        el("td", { class: "num", text: String(d.lots) }),
        el("td", { class: "num", text: fmt(d.units, 0) }),
        el("td", { class: "num", text: fmt(Math.round(d.mw), 0) + " MW" }),
        el("td", { class: "num", text: Math.round(d.mw / total * 100) + "%" }),
        el("td", {}, [btn]),
      ]));
    });
    $("[data-cap-foot]").appendChild(el("tr", {}, [
      el("td", { text: "All equipment" }),
      el("td", { class: "num", text: String(lots.length) }),
      el("td", { class: "num", text: fmt(data.reduce(function (s, d) { return s + d.units; }, 0), 0) }),
      el("td", { class: "num", text: fmt(Math.round(total), 0) + " MW" }),
      el("td", { class: "num", text: "100%" }),
      el("td", {}),
    ]));
    $$(".capacity__table th:nth-child(3), .capacity__table td:nth-child(3), .capacity__table th:nth-child(5), .capacity__table td:nth-child(5)").forEach(function (c) { c.classList.add("c-hide-sm"); });
  }

  /* ---------- Lot sheet ---------- */
  var dialog = $("[data-dialog]");
  var current = null, sequence = lots, lastFocus = null;

  function openLot(l, fromHash) {
    if (!dialog.open) {
      lastFocus = document.activeElement;
      sequence = visible.indexOf(l) > -1 ? visible.slice() : lots;
    }
    if (sequence.indexOf(l) < 0) sequence = lots;
    current = l;
    var i = sequence.indexOf(l);

    var crumb = $("[data-d-crumb]");
    crumb.replaceChildren(el("strong", { text: l.ref }), " · " + (i + 1) + " of " + sequence.length + (sequence.length === lots.length ? " lots" : " lots shown"));
    $("[data-prev]").disabled = i <= 0;
    $("[data-next]").disabled = i >= sequence.length - 1;

    var slot = $("[data-d-media]");
    slot.replaceChildren.apply(slot, Array.prototype.slice.call(media(l, "", { eager: true }).childNodes));
    $("[data-d-caption]").textContent = l.img
      ? "Manufacturer image of the model or equipment class. Not a photograph of the units offered."
      : "No photograph on file. Photographs are available on request.";

    $("[data-d-lot]").replaceChildren(el("span", { class: "ref", text: l.ref }), CAT_SINGULAR[l.cat]);
    $("[data-d-maker]").textContent = makerLine(l);
    var t = $("[data-d-title]");
    t.replaceChildren.apply(t, Array.prototype.slice.call(title("span", "", l).childNodes));
    $("[data-d-summary]").textContent = l.summary;

    var p = $("[data-d-price]");
    if (l.price) p.replaceChildren(el("span", { class: "label", text: "Asking price" }), el("strong", {}, [l.price, l.priceBasis ? el("small", { text: l.priceBasis }) : null]));
    else p.replaceChildren(el("span", { class: "label", text: "Asking price" }), el("strong", { class: "por-lg", text: "On request" }));

    var specs = $("[data-d-specs]");
    if (l.specs.length) {
      specs.replaceChildren.apply(specs, l.specs.map(function (s) { return el("div", {}, [el("dt", { text: s[0] }), el("dd", { text: s[1] })]); }));
    } else {
      specs.replaceChildren(el("div", { class: "specs__empty" }, ["Particulars for this lot are provided on request."]));
    }
    $("[data-d-note]").textContent = "";
    $(".sheet__info", dialog).scrollTop = 0;
    $(".sheet__body", dialog).scrollTop = 0;

    if (!dialog.open) dialog.showModal();
    t.focus({ preventScroll: true });
    if (!fromHash && location.hash !== "#" + l.id) history.replaceState(null, "", "#" + l.id);
  }

  function step(d) {
    if (!current) return;
    var next = sequence[sequence.indexOf(current) + d];
    if (next) openLot(next);
  }

  function closeLot() { if (dialog.open) dialog.close(); }
  dialog.addEventListener("close", function () {
    current = null;
    if (/^#lot-\d+$/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) closeLot(); });
  dialog.addEventListener("keydown", function (e) {
    if (e.target.matches && e.target.matches("input, select, textarea")) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  });
  $("[data-close]").addEventListener("click", closeLot);
  $("[data-prev]").addEventListener("click", function () { step(-1); });
  $("[data-next]").addEventListener("click", function () { step(1); });

  $("[data-copy]").addEventListener("click", function () {
    if (!current) return;
    var url = location.href.split("#")[0] + "#" + current.id;
    var done = function () { say("Link to " + current.ref + " copied."); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { say(url); });
    else say(url);
  });
  $("[data-print]").addEventListener("click", function () {
    document.documentElement.classList.add("print-sheet");
    window.print();
  });
  window.addEventListener("afterprint", function () { document.documentElement.classList.remove("print-sheet"); });

  function fromHash() {
    var m = /^#(lot-\d+)$/.exec(location.hash);
    var l = m && lots.filter(function (x) { return x.id === m[1]; })[0];
    if (l) openLot(l, true);
  }
  window.addEventListener("hashchange", fromHash);

  /* ---------- Enquiries ---------- */
  var toast = $("[data-toast]"), toastTimer;
  function say(msg) {
    if (dialog.open) { $("[data-d-note]").textContent = msg; return; }
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 4200);
  }

  $$("[data-enquire]").forEach(function (b) {
    b.addEventListener("click", function () {
      var l = b.hasAttribute("data-d-enquire") ? current : null;
      if (!SITE.contactEmail) {
        say(l ? "Enquiries open shortly. Please quote " + l.ref + "." : "Enquiries open shortly.");
        return;
      }
      var subject = l ? "Enquiry: " + l.ref + ", " + fullName(l) : "Equipment enquiry";
      var body = l ? "Please send details for " + l.ref + " (" + fullName(l) + ", " + l.summary + ").\n\nCompany:\nName:\nPhone:\n" : "";
      location.href = "mailto:" + SITE.contactEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  });

  /* ---------- Boot ---------- */
  var makers = buildFilters();
  buildCapacity();

  var feat = $("[data-featured]");
  lots.filter(function (l) { return l.featured; }).forEach(function (l) { feat.appendChild(feature(l)); });

  var mw = lots.reduce(function (s, l) { return s + (l.mw || 0); }, 0);
  var units = lots.reduce(function (s, l) { return s + (l.units || 0); }, 0);
  var withMw = lots.filter(function (l) { return l.mw; }).length;
  var withUnits = lots.filter(function (l) { return l.units; }).length;
  $('[data-stat="lots"]').textContent = String(lots.length);
  $('[data-stat="mw"]').textContent = fmt(Math.round(mw), 0);
  $('[data-stat="units"]').textContent = fmt(units, 0);
  $('[data-stat="makers"]').textContent = String(makers.length);
  $('[data-stat="priced"]').textContent = String(lots.filter(function (l) { return l.price; }).length);
  $("[data-stat-note]").replaceChildren(el("sup", { text: "1" }), " Output is stated for " + withMw + " of " + lots.length + " lots and unit counts for " + withUnits + ". Totals cover those lots only.");

  var names = makers.slice();
  var makerText = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names.join("");
  $("[data-lede]").textContent = lots.length + " lots of new, zero-hour and operating equipment from " + makerText + ", offered subject to prior sale.";
  $$("[data-asof]").forEach(function (n) { n.textContent = SITE.asOf || ""; });

  render();
  fromHash();
})();
