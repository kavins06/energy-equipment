(function () {
  "use strict";

  var SITE = window.SITE || {};
  var CATS = { gt: "Gas turbines", aero: "Aeroderivative", recip: "Reciprocating engines" };
  var CAT_SHORT = { gt: "Gas turbine", aero: "Aeroderivative", recip: "Reciprocating" };
  var CAT_SINGULAR = { gt: "Gas turbine", aero: "Aeroderivative gas turbine", recip: "Reciprocating engine" };
  var CAT_TONE = { gt: ["#cfcbc2", "#060708"], aero: ["#77797c", "#060708"], recip: ["#2f3135", "#ebe7df"] };

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
  function plate(l, cls, opts) {
    opts = opts || {};
    var box = el("div", { class: "plate" + (cls ? " " + cls : "") });
    fillPlate(box, l, opts);
    return box;
  }

  function fillPlate(box, l, opts) {
    opts = opts || {};
    box.replaceChildren();
    if (l.img) {
      var full = "images/" + l.img + ".webp";
      var img = el("img", { src: opts.thumb ? "images/thumbs/" + l.img + ".webp" : full, alt: opts.decorative ? "" : (l.alt || fullName(l)), class: "fit-" + (l.fit || "photo"), decoding: "async" });
      if (opts.thumb) img.addEventListener("error", function onErr() { img.removeEventListener("error", onErr); img.src = full; });
      if (!opts.eager) img.setAttribute("loading", "lazy");
      box.appendChild(img);
    } else {
      var art = el("div", { class: "plate__art" });
      art.innerHTML = '<svg viewBox="0 0 400 200" aria-hidden="true"><use href="#art-' + (l.cat === "recip" ? "engine" : "turbine") + '"/></svg><span>Photographs on request</span>';
      box.appendChild(art);
    }
  }

  function title(tag, cls, l) {
    return el(tag, { class: cls }, [l.model, l.variant ? " " : null, l.variant ? el("span", { text: l.variant }) : null]);
  }

  function openButton(l, inner) {
    var b = el("button", { class: "open", type: "button", "aria-label": "Open " + l.ref + ": " + fullName(l) });
    b.appendChild(inner);
    b.addEventListener("click", function (e) { e.stopPropagation(); openLot(l); });
    return b;
  }

  function nil() { return el("span", { class: "nil", "aria-label": "Not stated", text: "—" }); }

  function leaders(specs) {
    var dl = el("dl", { class: "leaders" });
    if (!specs.length) {
      dl.appendChild(el("div", { class: "leaders__empty" }, ["Particulars for this lot are provided on request."]));
      return dl;
    }
    specs.forEach(function (s) { dl.appendChild(el("div", {}, [el("dt", { text: s[0] }), el("dd", { text: s[1] })])); });
    return dl;
  }

  function ask(l, cls) {
    var value = l.price
      ? el("p", { class: "ask__value" }, [l.price, l.priceBasis ? el("small", { text: l.priceBasis }) : null])
      : el("p", { class: "ask__value is-por", text: "On request" });
    return el("div", { class: "ask" + (cls ? " " + cls : "") }, [el("p", { class: "ask__label", text: "Asking" }), value]);
  }

  /* ---------- Hero ---------- */
  function buildHero() {
    var l = lots[0];
    if (!l) return;
    var host = $("[data-callouts]");
    // anchor points are fractions of the hero rendering (SGT-800 cutaway)
    var notes = [
      { x: 24, y: 31, len: 118, html: "<b>" + l.ref + "</b>" + (l.maker + " " + l.model) + (l.variant ? " · " + l.variant : "") },
      { x: 55, y: 18, len: 70, html: "<b>" + unitsText(l) + " units</b>" + l.summary.split(" · ").slice(1).join(" · ") },
      { x: 77, y: 74, len: 40, down: true, left: true, html: "<b>Condition</b>" + (l.tags[0] || "On request") + (l.tags[1] ? "<br>" + l.tags[1] : "") },
      { x: 30, y: 63, len: 112, down: true, html: "<b>Asking</b><em>" + (l.price ? l.price + " " + (l.priceBasis || "") : "On request") + "</em>" },
    ];
    notes.forEach(function (c, i) {
      var node = el("div", { class: "callout" + (c.down ? " callout--down" : "") + (c.left ? " callout--left" : ""), style: "--x:" + c.x + "%;--y:" + c.y + "%;--len:" + c.len + "px;--i:" + i });
      node.appendChild(el("span", { class: "callout__stem" }));
      node.appendChild(el("span", { class: "callout__dot" }));
      var label = el("span", { class: "callout__label" });
      label.innerHTML = c.html.replace(/&(?!amp;)/g, "&amp;");
      node.appendChild(label);
      host.appendChild(node);
    });
  }

  /* ---------- Principal lots ---------- */
  function plateMarked(l) { var p = plate(l, ""); p.style.height = "100%"; return p; }

  /* ---------- Capacity ---------- */
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
      " lots. Output for the other " + (lots.length - stated) + " is available on request, so these shares describe stated output only.";

    var go = function (key) { return function () { state.cat = key; render(); $("#board").scrollIntoView(); }; };
    var bar = el("div", { class: "capacity__bar", role: "group", "aria-label": "Stated output by class" });
    var keys = el("div", { class: "capacity__keys" });
    data.forEach(function (d) {
      var tone = CAT_TONE[d.key];
      var share = Math.round(d.mw / total * 100);
      var seg = el("button", { class: "capacity__seg", type: "button", style: "--w:" + d.mw + ";--tone:" + tone[0] + ";--ink:" + tone[1], "aria-label": CATS[d.key] + ", " + fmt(Math.round(d.mw), 0) + " MW, " + share + "% of stated output. Show on the board." }, [
        el("span", { text: share + "%" }),
      ]);
      seg.addEventListener("click", go(d.key));
      bar.appendChild(seg);

      var key = el("button", { class: "capacity__key", type: "button", style: "--tone:" + tone[0] }, [
        el("span", { class: "capacity__name" }, [el("i", { "aria-hidden": "true" }), CATS[d.key]]),
        el("span", { class: "capacity__mw" }, [fmt(Math.round(d.mw), 0), el("small", { text: "MW" })]),
        el("span", { class: "capacity__sub", text: d.lots + " lots · " + d.withMw + " state output · " + fmt(d.units, 0) + " units stated" }),
      ]);
      key.addEventListener("click", go(d.key));
      keys.appendChild(key);
    });
    $("[data-capacity]").append(bar, keys);
  }

  /* ---------- Board ---------- */
  function priceCell(l) {
    if (!l.price) return [el("span", { class: "por", text: "On request" })];
    return [el("span", { class: "amount", text: l.price }), el("span", { class: "basis", text: l.priceBasis || "" })];
  }

  function row(l) {
    var tr = el("tr", { class: "row", id: l.id }, [
      el("td", { class: "b-lot", text: pad(l.n) }),
      el("td", { class: "b-eq" }, [
        el("div", { class: "row__eq" }, [
          plate(l, "row__thumb", { thumb: true, decorative: true }),
          el("div", { class: "row__text" }, [
            el("span", { class: "row__maker" }, [el("span", { class: "row__ref", text: l.ref }), makerLine(l)]),
            openButton(l, title("span", "row__title", l)),
            el("span", { class: "row__summary", text: l.summary }),
          ]),
        ]),
      ]),
      el("td", { class: "b-class", text: CAT_SHORT[l.cat] }),
      el("td", { class: "b-num b-units", "data-label": "Units" }, [unitsText(l) || nil()]),
      el("td", { class: "b-num b-mw", "data-label": "Output MW" }, [mwText(l) || nil()]),
      el("td", { class: "b-notes" }, [l.tags.length ? l.tags.join(" · ") : nil()]),
      el("td", { class: "b-price", "data-label": "Asking" }, priceCell(l)),
    ]);
    tr.addEventListener("click", function () {
      if (String(window.getSelection && window.getSelection())) return;
      openLot(l);
    });
    return tr;
  }

  var state = { cat: "all", maker: "all", sort: "lot", priced: false };
  var visible = lots.slice();
  var rows = {};
  lots.forEach(function (l) { rows[l.id] = row(l); });

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

    var tbody = $("[data-rows]");
    tbody.replaceChildren.apply(tbody, list.map(function (l) { return rows[l.id]; }));
    $("[data-board]").hidden = list.length === 0;
    $("[data-empty]").hidden = list.length > 0;
    $("[data-shown]").textContent = String(list.length);
    $("[data-total]").textContent = String(lots.length);

    $$("[data-types] .seg").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat)); });
    $("[data-sort]").value = state.sort;
    $$("[data-sort-col]").forEach(function (th) {
      var col = th.getAttribute("data-sort-col");
      if (col === state.sort) th.setAttribute("aria-sort", col === "lot" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });
  }

  function buildConsole() {
    var types = $("[data-types]");
    [["all", "All"]].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k]]; })).forEach(function (t) {
      var count = t[0] === "all" ? lots.length : lots.filter(function (l) { return l.cat === t[0]; }).length;
      var seg = el("button", { class: "seg", type: "button", "data-cat": t[0], "aria-pressed": "false" }, [t[1], el("span", { text: pad(count) })]);
      seg.addEventListener("click", function () { state.cat = t[0]; render(); });
      types.appendChild(seg);
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
    $$("[data-sort-col]").forEach(function (th) {
      var col = th.getAttribute("data-sort-col");
      var btn = el("button", { class: "sortkey", type: "button" });
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

    $("[data-d-crumb]").replaceChildren(el("b", { text: l.ref }), "  ·  " + pad(i + 1) + " of " + pad(sequence.length) + (sequence.length === lots.length ? "" : " shown"));
    $("[data-prev]").disabled = i <= 0;
    $("[data-next]").disabled = i >= sequence.length - 1;

    fillPlate($("[data-d-media]"), l, { eager: true });
    $("[data-d-caption]").textContent = l.img
      ? "Manufacturer image of the model or equipment class. Not a photograph of the units offered."
      : "No photograph on file. Photographs are available on request.";

    $("[data-d-kicker]").replaceChildren(el("b", { text: l.ref }), el("span", { text: CAT_SINGULAR[l.cat] }), el("span", { text: makerLine(l) }));
    var t = $("[data-d-title]");
    t.replaceChildren.apply(t, Array.prototype.slice.call(title("span", "", l).childNodes));
    $("[data-d-summary]").textContent = l.summary;
    $("[data-d-price]").replaceChildren(ask(l));
    var specs = $("[data-d-specs]");
    specs.replaceChildren.apply(specs, Array.prototype.slice.call(leaders(l.specs).childNodes));
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
    var ref = current.ref;
    var done = function () { say("Link to " + ref + " copied."); };
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

  /* ---------- Engraving: guilloché band and microprint ---------- */
  function guilloche(svg) {
    // a bank-note rosette: rings of phase-shifted sinusoidal circles
    var C = 300, out = [];
    var rings = [
      { r: 238, a: 18, b: 9, lobes: 36, lobes2: 12, copies: 22 },
      { r: 176, a: 14, b: 7, lobes: 28, lobes2: 8, copies: 18 },
      { r: 118, a: 10, b: 5, lobes: 20, lobes2: 6, copies: 14 },
    ];
    rings.forEach(function (g) {
      for (var k = 0; k < g.copies; k++) {
        var ph = k / g.copies * Math.PI * 2, d = "";
        for (var s = 0; s <= 900; s++) {
          var th = s / 900 * Math.PI * 2;
          var r = g.r + g.a * Math.sin(g.lobes * th + ph) + g.b * Math.sin(g.lobes2 * th - ph);
          d += (s ? "L" : "M") + (C + r * Math.cos(th)).toFixed(1) + " " + (C + r * Math.sin(th)).toFixed(1);
        }
        out.push('<path d="' + d + 'Z"/>');
      }
    });
    svg.setAttribute("viewBox", "0 0 600 600");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.innerHTML = '<g fill="none" stroke="currentColor" stroke-width=".4" vector-effect="non-scaling-stroke" opacity=".42">' + out.join("") + "</g>";
  }

  /* ---------- Boot ---------- */
  var makers = buildConsole();
  buildHero();
  buildCapacity();

  var feat = $("[data-featured]");
  lots.filter(function (l) { return l.featured; }).forEach(function (l) {
    var media = el("div", { class: "marks dossier__media" }, [plateMarked(l)]);
    var body = el("div", { class: "dossier__body" }, [
      el("p", { class: "dossier__index" }, [el("b", { text: l.ref }), el("span", { text: CAT_SINGULAR[l.cat] })]),
      el("p", { class: "dossier__maker", text: makerLine(l) }),
      openButton(l, title("h3", "dossier__title", l)),
      l.blurb ? el("p", { class: "dossier__blurb", text: l.blurb }) : null,
      leaders(l.specs),
      ask(l),
    ]);
    feat.appendChild(el("article", { class: "dossier" }, [media, body]));
  });

  var mw = lots.reduce(function (s, l) { return s + (l.mw || 0); }, 0);
  var units = lots.reduce(function (s, l) { return s + (l.units || 0); }, 0);
  var withMw = lots.filter(function (l) { return l.mw; }).length;
  var withUnits = lots.filter(function (l) { return l.units; }).length;
  $('[data-stat="lots"]').textContent = String(lots.length);
  $('[data-stat="mw"]').textContent = fmt(Math.round(mw), 0);
  $('[data-stat="units"]').textContent = fmt(units, 0);
  $('[data-stat="makers"]').textContent = String(makers.length);
  $("[data-stat-note]").replaceChildren(el("sup", { text: "1" }), " Output is stated for " + withMw + " of " + lots.length + " lots, unit counts for " + withUnits + ". Totals cover those lots only.");

  var makerText = makers.length > 1 ? makers.slice(0, -1).join(", ") + " and " + makers[makers.length - 1] : makers.join("");
  $("[data-lede]").textContent = "Gas turbines, aeroderivatives and reciprocating engines from " + makerText + ". " + lots.length + " lots, offered subject to prior sale.";

  var asOf = SITE.asOf || "";
  var d = asOf ? new Date(asOf) : null;
  var schedNo = d && !isNaN(d) ? "No. " + pad(d.getMonth() + 1) + "/" + String(d.getFullYear()).slice(-2) : "";
  $$("[data-asof]").forEach(function (n) { n.textContent = asOf; });
  $$("[data-schedule-no]").forEach(function (n) { n.textContent = schedNo; });
  var mp = "Power Equipment · Off-market schedule " + schedNo + " · Private circulation · ";
  $("[data-microprint]").textContent = new Array(40).join(mp);
  guilloche($("[data-guilloche]"));

  var bar = $("[data-bar]");
  var onScroll = function () { bar.classList.toggle("is-solid", window.scrollY > 24); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  render();
  fromHash();
})();
