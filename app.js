(function () {
  "use strict";

  var SITE = window.SITE || {};
  var CATS = { gt: "Gas turbines", aero: "Aeroderivative", recip: "Reciprocating engines" };
  var CAT_SINGULAR = { gt: "Gas turbine", aero: "Aeroderivative gas turbine", recip: "Reciprocating engine" };

  var lots = (window.LISTINGS || []).map(function (l, i) {
    var n = i + 1;
    return Object.assign({}, l, { n: n, ref: "Lot " + (n < 10 ? "0" + n : n), id: "lot-" + (n < 10 ? "0" + n : n) });
  });

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") node.className = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function fullName(l) { return (l.maker ? l.maker + " " : "") + l.model; }

  /* ---------- Shared pieces ---------- */
  function media(l, cls, eager) {
    var box = el("div", { class: cls + " studio" });
    if (l.img) {
      var img = el("img", { src: "images/" + l.img + ".webp", alt: l.alt || fullName(l), class: "fit-" + (l.fit || "photo"), decoding: "async" });
      if (!eager) img.setAttribute("loading", "lazy");
      box.appendChild(img);
    } else {
      var art = el("div", { class: "studio__art" });
      art.innerHTML = '<svg viewBox="0 0 400 200" aria-hidden="true"><use href="#art-' + (l.cat === "recip" ? "engine" : "turbine") + '"/></svg><span>Photographs on request</span>';
      box.appendChild(art);
    }
    return box;
  }

  function title(tag, cls, l) {
    var h = el(tag, { class: cls, text: l.model });
    if (l.variant) { h.appendChild(document.createTextNode(" ")); h.appendChild(el("span", { text: l.variant })); }
    return h;
  }

  function price(l) {
    if (!l.price) return el("div", { class: "price price--por", text: "Price on request" });
    return el("div", { class: "price" }, [el("strong", { text: l.price }), document.createTextNode(" "), el("span", { text: l.priceBasis || "" })]);
  }

  function openButton(l, inner) {
    var b = el("button", { class: "open", type: "button", "aria-label": "View " + l.ref + ": " + fullName(l) + (l.variant ? ", " + l.variant : "") });
    b.appendChild(inner);
    b.addEventListener("click", function () { openLot(l, true); });
    return b;
  }

  /* ---------- Cards ---------- */
  function card(l) {
    var m = media(l, "card__media");
    m.appendChild(el("span", { class: "badge", text: l.ref }));
    var tags = l.tags && l.tags.length ? el("ul", { class: "card__tags" }, l.tags.map(function (t) { return el("li", { text: t }); })) : null;
    var body = el("div", { class: "card__body" }, [
      el("p", { class: "card__maker", text: l.maker || CAT_SINGULAR[l.cat] }),
      openButton(l, title("h3", "card__title", l)),
      el("p", { class: "card__summary", text: l.summary }),
      tags,
      el("div", { class: "card__foot" }, [price(l), el("span", { class: "card__cta", text: "View lot", "aria-hidden": "true" })]),
    ]);
    return el("article", { class: "card reveal", id: l.id }, [m, body]);
  }

  function feature(l) {
    var m = media(l, "feature__media", true);
    m.appendChild(el("span", { class: "badge", text: l.ref }));
    var facts = [];
    if (l.units) facts.push(["Units", String(l.units)]);
    if (l.mw) facts.push(["Output", l.mw.toLocaleString("en-US") + " MW"]);
    (l.tags || []).slice(0, 1).forEach(function (t) { facts.push(["Condition", t]); });
    var dl = el("dl", { class: "feature__facts" }, facts.map(function (f) {
      return el("div", {}, [el("dt", { text: f[0] }), el("dd", { text: f[1] })]);
    }));
    dl.appendChild(el("div", { class: l.price ? "is-price" : "" }, [
      el("dt", { text: l.price ? "Price " + (l.priceBasis || "") : "Price" }),
      el("dd", { text: l.price || "On request" }),
    ]));
    var body = el("div", { class: "feature__body" }, [
      el("p", { class: "feature__maker", text: l.maker || CAT_SINGULAR[l.cat] }),
      openButton(l, title("h3", "feature__title", l)),
      l.blurb ? el("p", { class: "feature__blurb", text: l.blurb }) : null,
      dl,
    ]);
    return el("article", { class: "feature reveal" }, [m, body]);
  }

  /* ---------- Filters ---------- */
  var state = { cat: "all", maker: "all", sort: "lot", priced: false };
  var grid = $("[data-grid]");
  var cards = {};
  lots.forEach(function (l) { cards[l.id] = card(l); });

  function matches(l) {
    return (state.cat === "all" || l.cat === state.cat) &&
      (state.maker === "all" || l.makers.indexOf(state.maker) > -1) &&
      (!state.priced || !!l.price);
  }

  function render() {
    var list = lots.filter(matches);
    if (state.sort === "mw") list.sort(function (a, b) { return (b.mw || -1) - (a.mw || -1) || a.n - b.n; });
    if (state.sort === "units") list.sort(function (a, b) { return (b.units || -1) - (a.units || -1) || a.n - b.n; });
    grid.replaceChildren.apply(grid, list.map(function (l) { return cards[l.id]; }));
    $("[data-count]").textContent = list.length === lots.length
      ? "Showing all " + lots.length + " lots"
      : "Showing " + list.length + " of " + lots.length + " lots";
    $("[data-empty]").hidden = list.length > 0;
    $$("[data-types] .chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat)); });
    observe();
  }

  function buildFilters() {
    var types = $("[data-types]");
    [["all", "All"]].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k]]; })).forEach(function (t) {
      var count = t[0] === "all" ? lots.length : lots.filter(function (l) { return l.cat === t[0]; }).length;
      var chip = el("button", { class: "chip", type: "button", "data-cat": t[0], "aria-pressed": "false" }, [document.createTextNode(t[1]), el("span", { text: String(count) })]);
      chip.addEventListener("click", function () { state.cat = t[0]; render(); });
      types.appendChild(chip);
    });

    var makers = {};
    lots.forEach(function (l) { l.makers.forEach(function (m) { makers[m] = (makers[m] || 0) + 1; }); });
    var sel = $("[data-maker]");
    sel.appendChild(el("option", { value: "all", text: "All manufacturers" }));
    Object.keys(makers).sort(function (a, b) { return makers[b] - makers[a] || a.localeCompare(b); }).forEach(function (m) {
      sel.appendChild(el("option", { value: m, text: m + " (" + makers[m] + ")" }));
    });
    sel.addEventListener("change", function () { state.maker = sel.value; render(); });
    $("[data-sort]").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
    $("[data-priced]").addEventListener("change", function (e) { state.priced = e.target.checked; render(); });
    $("[data-reset]").addEventListener("click", function () {
      state = { cat: "all", maker: "all", sort: state.sort, priced: false };
      sel.value = "all"; $("[data-priced]").checked = false; render();
    });
    return Object.keys(makers).length;
  }

  /* ---------- Reveal on scroll ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -6% 0px" }) : null;

  function observe() {
    $$(".reveal:not(.is-in)").forEach(function (n) { io ? io.observe(n) : n.classList.add("is-in"); });
  }

  /* ---------- Lot dialog ---------- */
  var dialog = $("[data-dialog]");
  var current = null;

  function openLot(l, pushHash) {
    current = l;
    var slot = $("[data-d-media]");
    slot.replaceChildren.apply(slot, Array.prototype.slice.call(media(l, "", true).childNodes));
    $("[data-d-ref]").textContent = l.ref + " · " + CAT_SINGULAR[l.cat];
    $("[data-d-maker]").textContent = l.maker || "Manufacturer on request";
    var t = $("[data-d-title]");
    t.replaceChildren.apply(t, Array.prototype.slice.call(title("span", "", l).childNodes));
    $("[data-d-summary]").textContent = l.summary;
    var p = $("[data-d-price]");
    p.replaceChildren(el("strong", { text: l.price || "Price on request" }));
    if (l.price && l.priceBasis) p.appendChild(el("span", { text: l.priceBasis }));
    var specs = $("[data-d-specs]");
    specs.replaceChildren.apply(specs, (l.specs || []).map(function (s) {
      return el("div", {}, [el("dt", { text: s[0] }), el("dd", { text: s[1] })]);
    }));
    $("[data-d-note]").textContent = "";
    if (!dialog.open) dialog.showModal();
    $(".lot__info", dialog).scrollTop = 0;
    if (pushHash && location.hash !== "#" + l.id) history.replaceState(null, "", "#" + l.id);
  }

  function closeLot() { if (dialog.open) dialog.close(); }
  dialog.addEventListener("close", function () {
    current = null;
    if (/^#lot-\d+$/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
  });
  dialog.addEventListener("click", function (e) { if (e.target === dialog) closeLot(); });
  $("[data-close]").addEventListener("click", closeLot);

  function fromHash() {
    var m = /^#(lot-\d+)$/.exec(location.hash);
    var l = m && lots.filter(function (x) { return x.id === m[1]; })[0];
    if (l) openLot(l, false);
  }
  window.addEventListener("hashchange", fromHash);

  /* ---------- Enquiries ---------- */
  var toast = $("[data-toast]"), toastTimer;
  function say(msg) {
    var note = $("[data-d-note]");
    if (dialog.open) { note.textContent = msg; return; }
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
  var makerCount = buildFilters();
  var feat = $("[data-featured]");
  lots.filter(function (l) { return l.featured; }).forEach(function (l) { feat.appendChild(feature(l)); });

  var mw = lots.reduce(function (s, l) { return s + (l.mw || 0); }, 0);
  var units = lots.reduce(function (s, l) { return s + (l.units || 0); }, 0);
  $('[data-stat="lots"]').textContent = String(lots.length);
  $('[data-stat="gw"]').textContent = (Math.floor(mw / 100) / 10).toFixed(1) + " GW+";
  $('[data-stat="units"]').textContent = (Math.floor(units / 10) * 10) + "+";
  $('[data-stat="makers"]').textContent = String(makerCount);
  $$("[data-asof]").forEach(function (n) { n.textContent = SITE.asOf || ""; });

  render();
  fromHash();
})();
