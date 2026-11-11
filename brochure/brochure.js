/* Builds the printable brochure from listings.js. Rendered to PDF by build.js. */
(function () {
  "use strict";

  var SITE = window.SITE || {};
  var CATS = { gt: "Gas turbines", aero: "Aeroderivative", recip: "Reciprocating engines" };
  var CAT_SHORT = { gt: "Gas turbine", aero: "Aeroderivative", recip: "Reciprocating" };
  var CAT_SINGULAR = { gt: "Gas turbine", aero: "Aeroderivative gas turbine", recip: "Reciprocating engine" };
  var CAT_TONE = { gt: ["#cfcbc2", "#060708"], aero: ["#77797c", "#060708"], recip: ["#2f3135", "#ebe7df"] };

  var pad = function (n) { return n < 10 ? "0" + n : String(n); };
  var fmt = function (n, d) { return n.toLocaleString("en-US", { maximumFractionDigits: d == null ? 1 : d }); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };

  var lots = (window.LISTINGS || []).map(function (l, i) {
    var n = i + 1;
    return Object.assign({ makers: [], tags: [], specs: [] }, l, { n: n, ref: "Lot " + pad(n) });
  });

  /* ---------- Figures ---------- */
  var mw = lots.reduce(function (s, l) { return s + (l.mw || 0); }, 0);
  var units = lots.reduce(function (s, l) { return s + (l.units || 0); }, 0);
  var withMw = lots.filter(function (l) { return l.mw; }).length;
  var withUnits = lots.filter(function (l) { return l.units; }).length;
  var makerCount = {};
  lots.forEach(function (l) { l.makers.forEach(function (m) { makerCount[m] = (makerCount[m] || 0) + 1; }); });
  var makers = Object.keys(makerCount).sort(function (a, b) { return makerCount[b] - makerCount[a] || a.localeCompare(b); });
  var makerText = makers.length > 1 ? makers.slice(0, -1).join(", ") + " and " + makers[makers.length - 1] : makers.join("");
  var featured = lots.filter(function (l) { return l.featured; });

  var asOf = SITE.asOf || "";
  var d = asOf ? new Date(asOf) : null;
  var schedNo = d && !isNaN(d) ? "No. " + pad(d.getMonth() + 1) + "/" + String(d.getFullYear()).slice(-2) : "";

  /* ---------- Pagination ---------- */
  var PER_SHEET = 2;
  var sheetPages = Math.ceil(lots.length / PER_SHEET);
  var P = { cover: 1, overview: 2, principal: 3, board: 3 + featured.length };
  P.sheets = P.board + 1;
  P.back = P.sheets + sheetPages;
  var TOTAL = P.back;
  var pageOf = function (l) { return P.sheets + Math.floor((l.n - 1) / PER_SHEET); };

  /* ---------- Pieces ---------- */
  var micro = (function () {
    var s = "Power Equipment · Off-market schedule " + schedNo + " · Private circulation · ";
    return esc(new Array(30).join(s));
  })();

  function run(section) {
    return '<header class="run"><span><b>Power Equipment</b></span><span class="run__r"><span>Off-market schedule ' + esc(schedNo) + "</span><span>" + esc(section) + "</span></span></header>";
  }
  function foot(n, left) {
    return '<footer class="foot"><p class="foot__micro" aria-hidden="true">' + micro + '</p><div class="foot__row"><span>' + esc(left || "Private circulation") + "</span><span><b>" + pad(n) + "</b> / " + pad(TOTAL) + "</span></div></footer>";
  }
  function page(cls, inner) { return '<section class="page ' + cls + '">' + inner + "</section>"; }

  function title(l) { return esc(l.model) + (l.variant ? " <span>" + esc(l.variant) + "</span>" : ""); }
  function makerLine(l) { return l.maker || ""; }
  // round down to a clean figure and mark it as a minimum: 3,527 -> "3,500+"
  function atLeast(n, step) { return fmt(Math.floor(n / step) * step, 0) + "+"; }
  // summaries without hedging: drop "on request" phrases, fall back to what the lot does state
  function blurbLine(l) {
    var s = (l.summary || "").replace(/\s*·?\s*(unit count|sizes|details) on request/gi, "").replace(/^(unit count|details) on request$/i, "").trim();
    if (/^lot$/i.test(s)) s = "Offered as a single lot";
    if (/^several lots$/i.test(s)) s = "Several lots available";
    return s || l.tags.join(" · ") || "Full particulars available to qualified principals";
  }
  // particulars: leave out anything not yet known, tidy qualifiers
  function cleanSpecs(l) {
    return l.specs.filter(function (sp) { return !/^on request$/i.test(sp[1]); }).map(function (sp) {
      var v = sp[1].replace(/[;,]\s*(timing to be confirmed|sizes on request)/i, "").replace(/the two SGT-800 lots above/i, "Lots 01 and 02");
      return [sp[0], v];
    });
  }
  function unitsText(l) { return l.unitsLabel || (l.units ? fmt(l.units, 0) : ""); }
  function mwText(l) { return l.mwLabel || (l.mw ? fmt(l.mw, 2) : ""); }
  var nil = '<span class="nil">—</span>';

  function plate(l, cls) {
    var inner = l.img
      ? ""
      : '<div class="plate__art"><svg viewBox="0 0 400 200"><use href="#art-' + (l.cat === "recip" ? "engine" : "turbine") + '"/></svg></div>';
    var data = l.img ? ' data-src="../images/' + esc(l.img) + '.webp" data-fit="' + esc(l.fit || "photo") + '"' : "";
    return '<div class="marks ' + cls + '"><div class="plate" style="height:100%"' + data + ">" + inner + "</div></div>";
  }
  function leaders(specs) {
    if (!specs.length) return '<dl class="leaders"><div class="leaders__empty">Full particulars available to qualified principals.</div></dl>';
    return '<dl class="leaders">' + specs.map(function (s) { return "<div><dt>" + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl>";
  }
  function ask(l) {
    var v = l.price
      ? '<p class="ask__value">' + esc(l.price) + (l.priceBasis ? " <small>" + esc(l.priceBasis) + "</small>" : "") + "</p>"
      : '<p class="ask__value is-por">On application</p>';
    return '<div class="ask"><p class="ask__label">Asking</p>' + v + "</div>";
  }

  /* ---------- Cover ---------- */
  function cover() {
    var l = lots[0];
    var notes = [
      { x: 24, y: 31, len: 26, html: "<b>" + esc(l.ref) + "</b>" + esc(l.maker + " " + l.model) + (l.variant ? " · " + esc(l.variant) : "") },
      { x: 55, y: 18, len: 15, html: "<b>" + esc(unitsText(l)) + " units</b>" + esc(l.summary.split(" · ").slice(1).join(" · ")) },
      { x: 30, y: 63, len: 22, down: true, html: "<b>Asking</b><em>" + esc(l.price ? l.price + " " + (l.priceBasis || "") : "On application") + "</em>" },
      { x: 77, y: 74, len: 9, down: true, left: true, html: "<b>Condition</b>" + esc(l.tags[0] || "") + (l.tags[1] ? "<br>" + esc(l.tags[1]) : "") },
    ];
    var callouts = notes.map(function (c) {
      return '<div class="callout' + (c.down ? " callout--down" : "") + (c.left ? " callout--left" : "") + '" style="--x:' + c.x + "%;--y:" + c.y + "%;--len:" + c.len + 'mm"><span class="callout__stem"></span><span class="callout__dot"></span><span class="callout__label">' + c.html + "</span></div>";
    }).join("");
    return page("cover",
      '<header class="run cover__run"><span><b>Power Equipment</b></span><span class="run__r"><span>Off-market schedule</span><span>' + esc(schedNo) + "</span><span>Revised " + esc(asOf) + "</span></span></header>" +
      '<div class="cover__stage"><img src="../images/hero-sgt800.webp" alt="" data-hero>' + callouts + "</div>" +
      '<div class="cover__copy">' +
        '<p class="eyebrow">Circulated privately</p>' +
        "<h1>Capacity,<br>traded quietly.</h1>" +
        '<p class="cover__lede">Gas turbines, aeroderivatives and reciprocating engines from ' + esc(makerText) + ". " + lots.length + " lots of utility-scale generating capacity, available for acquisition.</p>" +
        '<div class="scale"></div>' +
        '<dl class="readout">' +
          "<div><dt>Capacity</dt><dd>" + atLeast(mw, 100) + "<small>MW</small></dd></div>" +
          "<div><dt>Units</dt><dd>" + atLeast(units, 10) + "</dd></div>" +
          "<div><dt>Lots</dt><dd>" + lots.length + "</dd></div>" +
          "<div><dt>Manufacturers</dt><dd>" + makers.length + "</dd></div>" +
        "</dl>" +
        '<div style="height:10mm"></div>' +
      "</div>" +
      foot(P.cover, "Revised " + asOf));
  }

  /* ---------- Overview: capacity and contents ---------- */
  function overview() {
    var total = 0, stated = 0;
    var data = Object.keys(CATS).map(function (k) {
      var g = lots.filter(function (l) { return l.cat === k; });
      var r = { key: k, lots: g.length, units: g.reduce(function (s, l) { return s + (l.units || 0); }, 0), mw: g.reduce(function (s, l) { return s + (l.mw || 0); }, 0), withMw: g.filter(function (l) { return l.mw; }).length };
      total += r.mw; stated += r.withMw;
      return r;
    });
    var bar = data.map(function (r) { var t = CAT_TONE[r.key]; return '<span style="--w:' + r.mw + ";--tone:" + t[0] + ";--ink:" + t[1] + '"><i>' + esc(CAT_SHORT[r.key].toUpperCase()) + "</i></span>"; }).join("");
    var keys = data.map(function (r) {
      return '<div class="cap__key" style="--tone:' + CAT_TONE[r.key][0] + '"><span class="cap__name"><i></i>' + esc(CATS[r.key]) + '</span><span class="cap__mw">' + atLeast(r.mw, 50) + "<small>MW</small></span><span class=\"cap__sub\">" + r.lots + " lots · " + atLeast(r.units, 5) + " units</span></div>";
    }).join("");
    var contents = [
      ["01", "Principal lots", P.principal],
      ["02", "The board: every lot at a glance", P.board],
      ["03", "Lot sheets, " + lots.length + " lots in lot order", P.sheets],
      ["04", "Terms and enquiries", P.back],
    ].map(function (c) { return "<li><b>" + c[0] + "</b>" + esc(c[1]) + "<em>p. " + pad(c[2]) + "</em></li>"; }).join("");
    return page("overview", run("Overview") +
      '<div class="body">' +
        '<p class="eyebrow">Overview</p>' +
        '<h2 class="h2">' + lots.length + " lots. More than " + (Math.floor(mw / 100) / 10).toFixed(1) + "&nbsp;GW of capacity.</h2>" +
        '<p class="overview__lede">New, zero-hour and operating units from ' + esc(makerText) + ". Every lot is numbered and set out on its own sheet in this schedule. Quote the number and full particulars follow.</p>" +
        '<div class="cap"><p class="eyebrow">Capacity by class</p><div class="cap__bar">' + bar + '</div><div class="cap__keys">' + keys + "</div></div>" +
        '<div class="contents"><p class="eyebrow">Highlights</p><ol>' + featured.map(function (l, i) { return "<li><b>" + pad(l.n) + "</b>" + esc((l.maker ? l.maker + " " : "") + l.model) + ". " + esc(l.blurb || blurbLine(l)) + "<em>p. " + pad(P.principal + i) + "</em></li>"; }).join("") + "</ol></div>" +
        '<div class="contents" style="margin-top:12mm"><p class="eyebrow">Contents</p><ol>' + contents + "</ol></div>" +
      "</div>" + foot(P.overview));
  }

  /* ---------- Principal lots ---------- */
  function principal(l, i) {
    return page("principal", run("Principal lots") +
      '<div class="body">' +
        '<p class="principal__index"><b>' + esc(l.ref) + "</b><span>Principal lot " + pad(i + 1) + " of " + pad(featured.length) + "</span><span>" + esc(CAT_SINGULAR[l.cat]) + "</span></p>" +
        plate(l, "principal__plate") +
        '<div class="principal__grid">' +
          "<div>" +
            (l.maker ? '<p class="maker">' + esc(l.maker) + "</p>" : "") +
            '<h2 class="principal__title">' + title(l) + "</h2>" +
            (l.blurb ? '<p class="principal__blurb">' + esc(l.blurb) + "</p>" : "") +
            '<p class="principal__summary">' + esc(blurbLine(l)) + "</p>" +
            ask(l) +
          "</div>" +
          "<div>" + leaders(cleanSpecs(l)) + "</div>" +
        "</div>" +
      "</div>" + foot(P.principal + i));
  }

  /* ---------- Board ---------- */
  function board() {
    var rows = lots.map(function (l) {
      var price = l.price
        ? '<td class="p">' + esc(l.price) + "<small>" + esc(l.priceBasis || "") + "</small></td>"
        : '<td class="p por">On application</td>';
      return "<tr>" +
        '<td class="n">' + pad(l.n) + "</td>" +
        '<td class="m">' + esc(l.maker || "") + '</td><td class="t">' + title(l) + "</td>" +
        '<td class="c">' + esc(CAT_SHORT[l.cat]) + "</td>" +
        '<td class="u">' + esc(unitsText(l)) + "</td>" +
        '<td class="u">' + esc(mwText(l)) + "</td>" +
        '<td class="x">' + esc(l.tags.join(" · ")) + "</td>" +
        price +
        '<td class="pg">' + pad(pageOf(l)) + "</td>" +
        "</tr>";
    }).join("");
    return page("board-page", run("The board") +
      '<div class="body">' +
        '<p class="eyebrow">The board</p>' +
        '<h2 class="h2">Every lot on the schedule.</h2>' +
        '<table class="board"><colgroup><col style="width:7mm"><col style="width:21mm"><col style="width:45mm"><col style="width:18mm"><col style="width:13mm"><col style="width:12mm"><col><col style="width:22mm"><col style="width:8mm"></colgroup><thead><tr><th>Lot</th><th>Maker</th><th>Equipment</th><th>Class</th><th style="text-align:right">Units</th><th style="text-align:right">MW</th><th>Highlights</th><th style="text-align:right">Asking</th><th>Page</th></tr></thead><tbody>' + rows + "</tbody></table>" +
        '<p class="board__legend">Prices marked “on application” are provided to qualified principals.</p>' +
      "</div>" + foot(P.board));
  }

  /* ---------- Lot sheets ---------- */
  function entry(l) {
    if (!l) return '<article class="entry entry--blank"></article>';
    return '<article class="entry">' +
      '<p class="entry__index"><b>' + esc(l.ref) + "</b><span>" + esc(CAT_SINGULAR[l.cat]) + "</span><span>" + esc(makerLine(l)) + "</span></p>" +
      plate(l, "entry__plate") +
      '<div class="entry__grid">' +
        "<div>" +
          '<h3 class="entry__title">' + title(l) + "</h3>" +
          '<p class="entry__summary">' + esc(blurbLine(l)) + "</p>" +
          '<div style="margin-top:4mm">' + ask(l) + "</div>" +
        "</div>" +
        "<div>" + leaders(cleanSpecs(l)) + "</div>" +
      "</div>" +
    "</article>";
  }
  function sheets() {
    var out = [];
    for (var i = 0; i < lots.length; i += PER_SHEET) {
      var a = lots[i], b = lots[i + 1];
      out.push(page("sheets", run("Lot sheets · " + a.ref + (b ? " – " + pad(b.n) : "")) +
        '<div class="body">' + entry(a) + entry(b) + "</div>" + foot(pageOf(a))));
    }
    return out.join("");
  }

  /* ---------- Back cover ---------- */
  function rosette() {
    var C = 300, out = [];
    [
      { r: 238, a: 18, b: 9, lobes: 36, lobes2: 12, copies: 22 },
      { r: 176, a: 14, b: 7, lobes: 28, lobes2: 8, copies: 18 },
      { r: 118, a: 10, b: 5, lobes: 20, lobes2: 6, copies: 14 },
    ].forEach(function (g) {
      for (var k = 0; k < g.copies; k++) {
        var ph = k / g.copies * Math.PI * 2, dd = "";
        for (var s = 0; s <= 900; s++) {
          var th = s / 900 * Math.PI * 2;
          var r = g.r + g.a * Math.sin(g.lobes * th + ph) + g.b * Math.sin(g.lobes2 * th - ph);
          dd += (s ? "L" : "M") + (C + r * Math.cos(th)).toFixed(1) + " " + (C + r * Math.sin(th)).toFixed(1);
        }
        out.push('<path d="' + dd + 'Z"/>');
      }
    });
    return '<svg viewBox="0 0 600 600" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".35" opacity=".5">' + out.join("") + "</g></svg>";
  }
  function back() {
    var contact = SITE.contactEmail ? '<p class="contact">' + esc(SITE.contactEmail) + "</p>" : "";
    return page("back", run("Terms") +
      '<div class="body">' +
        '<p class="eyebrow">Terms</p>' +
        '<h2 class="h2">Terms of offer.</h2>' +
        '<ol class="terms">' +
          "<li><h3>Availability</h3><p>All equipment is offered subject to prior sale and to final verification of specifications, title and availability.</p></li>" +
          "<li><h3>Due diligence</h3><p>Full specifications, records and inspection access are available to qualified principals.</p></li>" +
          "<li><h3>Imagery</h3><p>Images are representative of the model or equipment class. Product imagery belongs to the respective manufacturers.</p></li>" +
        "</ol>" +
        '<div class="enquire">' + rosette() +
          '<p class="eyebrow">Enquiries</p>' +
          '<h2 class="enquire__title">Quote the lot number.</h2>' +
          "<p>Full specifications, records and inspection access are available to qualified principals. Schedule " + esc(schedNo) + ", revised " + esc(asOf) + ".</p>" + contact +
        "</div>" +
      "</div>" + foot(P.back));
  }

  document.getElementById("book").innerHTML =
    cover() + overview() + featured.map(principal).join("") + board() + sheets() + back();

  /* ---------- Bake images ----------
   CSS filters make Chromium rasterise every plate at full device scale, which bloats the PDF.
   Each plate is drawn once to a canvas at about 200 dpi with the monochrome treatment and
   lamp backdrop, then placed as a JPEG. */
  var PX_PER_CSS = 8 / 3.7795; // 8 device px per mm
  function load(src) {
    return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = rej; im.src = src; });
  }
  function bakePlate(el) {
    return load(el.getAttribute("data-src")).then(function (im) {
      var r = el.getBoundingClientRect();
      var W = Math.round(r.width * PX_PER_CSS), H = Math.round(r.height * PX_PER_CSS);
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d");
      x.fillStyle = "#0e1013"; x.fillRect(0, 0, W, H);
      x.save(); x.translate(W / 2, H * 0.6); x.scale(1, (H * 0.58) / (W * 0.62));
      var g = x.createRadialGradient(0, 0, 0, 0, 0, W * 0.62);
      g.addColorStop(0, "#1d2025"); g.addColorStop(0.72, "#0e1013");
      x.fillStyle = g; x.fillRect(-W, -W * 2, W * 2, W * 4); x.restore();
      if (el.getAttribute("data-fit") === "cut") {
        var bw = W * 0.86, bh = H * 0.8, k = Math.min(bw / im.width, bh / im.height);
        var w = im.width * k, h = im.height * k;
        x.filter = "grayscale(1) contrast(1.05) brightness(.95)";
        x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = H * 0.06; x.shadowOffsetY = H * 0.04;
        x.drawImage(im, (W - w) / 2, (H - h) / 2, w, h);
      } else {
        var kc = Math.max(W / im.width, H / im.height), cw = W / kc, ch = H / kc;
        x.filter = "grayscale(1) contrast(1.08) brightness(.7)";
        x.drawImage(im, (im.width - cw) / 2, (im.height - ch) / 2, cw, ch, 0, 0, W, H);
      }
      var out = new Image(); out.alt = ""; out.src = c.toDataURL("image/jpeg", 0.84);
      el.appendChild(out);
      return out.decode ? out.decode() : null;
    });
  }
  function bakeHero(img) {
    return load(img.src).then(function (im) {
      var r = img.getBoundingClientRect();
      var W = Math.round(r.width * PX_PER_CSS), H = Math.round(W * im.height / im.width);
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d");
      x.fillStyle = "#060708"; x.fillRect(0, 0, W, H);
      x.filter = "grayscale(1) contrast(1.06) brightness(.92)";
      x.drawImage(im, 0, 0, W, H);
      img.src = c.toDataURL("image/jpeg", 0.86);
      return img.decode ? img.decode() : null;
    });
  }

  /* signal readiness to the PDF builder once fonts and images are in */
  document.fonts.ready.then(function () {
    var jobs = Array.prototype.slice.call(document.querySelectorAll(".plate[data-src]")).map(bakePlate);
    var hero = document.querySelector("img[data-hero]");
    if (hero) jobs.push(bakeHero(hero));
    return Promise.all(jobs);
  }).then(function () { document.documentElement.setAttribute("data-ready", "1"); }, function (e) {
    document.documentElement.setAttribute("data-error", String(e && e.message || e));
  });
})();
