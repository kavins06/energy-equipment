/*
 * Inventory data. Edit this file to add, remove or change listings.
 *
 * cat:      "gt" (gas turbine) | "aero" (aeroderivative) | "recip" (reciprocating engine)
 * makers:   manufacturers used by the filter; leave empty when undisclosed
 * units/mw: numbers used for sorting and the headline totals; null when not stated
 * unitsLabel / mwLabel: optional text shown in the schedule instead of the bare number
 *           (for example "Up to 6" or "c. 123")
 * img:      file in /images without extension; null shows the line-drawing tile
 * fit:      "cut"   transparent cut-out, shown whole on the dark plate
 *           "photo" photograph, fills the plate
 *           (product shots on white should be cut out first; see README)
 */
window.SITE = {
  asOf: "10 November 2026",
  // Set an address to turn every "Request details" button into a pre-filled email.
  contactEmail: "",
};

window.LISTINGS = [
  /* ---------- Gas turbines ---------- */
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT-800", variant: "60 Hz", cat: "gt",
    units: 6, mw: 342, summary: "6 units · 57 MW each · 342 MW",
    tags: ["New, never fired", "Manila, Philippines"],
    price: "$2.4M – $2.5M", priceBasis: "per MW", featured: true,
    blurb: "Six new 60 Hz units held at a Siemens facility and open for inspection, with Siemens warranty and Siemens on site at installation.",
    specs: [
      ["Units", "6"],
      ["Output", "57 MW each, 342 MW total"],
      ["Frequency", "60 Hz"],
      ["Condition", "New, never fired"],
      ["Model year", "2016"],
      ["Location", "Siemens facility, Manila, Philippines"],
      ["Inspection", "Open for inspection"],
      ["Warranty", "Siemens warranty, with Siemens on site at installation"],
    ],
    img: "sgt800-cutaway", fit: "cut", alt: "Cutaway rendering of a Siemens SGT-800 gas turbine",
  },
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT-800", variant: "10-unit lot", cat: "gt",
    units: 10, mw: null, summary: "10 units · 4 at 60 Hz, 6 at 50 Hz",
    tags: ["Model years 2018 to 2024", "Frankfurt"],
    specs: [
      ["Units", "10: 4 at 60 Hz, 6 at 50 Hz"],
      ["Model years", "2018 to 2024"],
      ["Location", "Frankfurt"],
      ["Conversion", "50 Hz units convertible to 60 Hz by Siemens in about 90 to 120 days, warranty retained"],
    ],
    img: "sgt800-package", fit: "cut", alt: "Siemens SGT-800 single-lift generator package",
  },
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT-800", variant: "Further units", cat: "gt",
    units: 25, unitsLabel: "25+", mw: null, summary: "25 or more units",
    tags: ["Upcoming"],
    specs: [
      ["Units", "25 or more"],
      ["Availability", "Follows the 10-unit lot; timing to be confirmed"],
      ["Source", "Same source as the two SGT-800 lots above"],
    ],
    img: "sgt800-package-open", fit: "cut", alt: "Siemens SGT-800 package with the enclosure opened",
  },
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT-800", variant: "Used", cat: "gt",
    units: 1, mw: null, summary: "1 unit",
    tags: ["Used", "Istanbul"],
    specs: [
      ["Units", "1"],
      ["Condition", "Used"],
      ["Warranty", "Siemens warranty"],
      ["Location", "Istanbul"],
    ],
    img: "sgt800-core", fit: "photo", alt: "Siemens SGT-800 core engine with air inlet",
  },
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT-800", variant: "50 Hz lot", cat: "gt",
    units: null, mw: null, summary: "Lot · unit count on request",
    tags: ["New", "50 Hz"],
    price: "$190M", priceBasis: "for the lot",
    specs: [
      ["Units", "On request"],
      ["Condition", "New"],
      ["Frequency", "50 Hz, with documentation for conversion to 60 Hz"],
    ],
    img: "sgt800-core-cutaway", fit: "photo", alt: "Sectioned view of a Siemens SGT-800 core engine",
  },
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT5-4000F", variant: "Power island", cat: "gt",
    units: null, mw: 306, summary: "306 MW power island",
    tags: [],
    price: "$300k", priceBasis: "per MW",
    specs: [
      ["Scope", "Power island"],
      ["Output", "306 MW"],
    ],
    img: "sgt5-4000f-cut", fit: "cut", alt: "Siemens SGT5-4000F heavy-duty gas turbine",
  },
  {
    maker: "Ansaldo / Siemens", makers: ["Ansaldo", "Siemens"], model: "F-class gas turbine", variant: "", cat: "gt",
    units: 1, mw: 440, summary: "1 unit · 440 MW",
    tags: ["New"], featured: true,
    blurb: "A single new F-class machine rated at 440 MW.",
    specs: [
      ["Units", "1"],
      ["Output", "440 MW"],
      ["Condition", "New"],
    ],
    img: "ae94-3a", fit: "cut", alt: "Cutaway rendering of an Ansaldo AE94.3A F-class gas turbine",
  },
  {
    maker: "GE", makers: ["GE"], model: "Frame 6B", variant: "MS6001B, 60 Hz", cat: "gt",
    units: 12, mw: 480, summary: "12 units · 480 MW",
    tags: ["Zero-hour refurbishment", "United States"], featured: true,
    blurb: "Twelve 60 Hz units to be fully refurbished and delivered in zero-hour condition, with clean title and full documentation.",
    specs: [
      ["Units", "12"],
      ["Output", "480 MW total"],
      ["Frequency", "60 Hz"],
      ["Condition", "To be fully refurbished and delivered in zero-hour condition"],
      ["Location", "United States"],
      ["Title and records", "Clean title, full documentation"],
    ],
    img: "ge-6b", fit: "cut", alt: "Sectioned rendering of a GE 6B heavy-duty gas turbine",
  },
  {
    maker: "GE", makers: ["GE"], model: "Frame 5", variant: "", cat: "gt",
    units: 18, mw: 450, summary: "18 units · 25 MW each · 450 MW",
    tags: [],
    specs: [
      ["Units", "18"],
      ["Output", "25 MW each, 450 MW total"],
    ],
    img: "ge-frame-assembly", fit: "photo", alt: "GE heavy-duty gas turbine rotor during assembly",
  },
  {
    maker: "GE", makers: ["GE"], model: "Frame 7", variant: "", cat: "gt",
    units: null, mw: null, summary: "Unit count on request",
    tags: ["Europe"],
    specs: [
      ["Units", "On request"],
      ["Location", "Europe"],
    ],
    img: "ge-7e", fit: "cut", alt: "Sectioned rendering of a GE 7E heavy-duty gas turbine",
  },
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT-600", variant: "", cat: "gt",
    units: 8, mw: null, summary: "8 units",
    tags: [],
    specs: [["Units", "8"]],
    img: "sgt600-package", fit: "cut", alt: "Siemens SGT-600 gas turbine package",
  },
  {
    maker: "", makers: [], model: "Gas turbine lot", variant: "3 units", cat: "gt",
    units: 3, mw: 15.9, summary: "3 units · 15.9 MW",
    tags: [],
    specs: [
      ["Units", "3"],
      ["Output", "15.9 MW"],
    ],
    img: "turbine-blades", fit: "photo", alt: "Close view of gas turbine blade rows",
  },
  {
    maker: "", makers: [], model: "Gas turbine lot", variant: "", cat: "gt",
    units: null, mw: null, summary: "Details on request",
    tags: [],
    specs: [],
    img: "turbine-rotor", fit: "photo", alt: "Close view of compressor blades on a gas turbine rotor",
  },

  /* ---------- Aeroderivative ---------- */
  {
    maker: "GE", makers: ["GE"], model: "TM2500+ Gen 6", variant: "Mobile", cat: "aero",
    units: 10, mw: 300, summary: "10 units · 30 MW each · 300 MW",
    tags: [],
    price: "$660M", priceBasis: "for the lot", featured: true,
    blurb: "Ten trailer-mounted aeroderivative units, 300 MW in total, offered as a single lot.",
    specs: [
      ["Units", "10"],
      ["Output", "30 MW each, 300 MW total"],
    ],
    img: "tm2500", fit: "cut", alt: "GE TM2500 trailer-mounted gas turbine generator set",
  },
  {
    maker: "GE", makers: ["GE"], model: "LM6000", variant: "5-unit lot", cat: "aero",
    units: 5, mw: 232.5, summary: "5 units · 232.5 MW",
    tags: [],
    specs: [
      ["Units", "5"],
      ["Output", "232.5 MW total"],
    ],
    img: "lm6000", fit: "cut", alt: "GE LM6000 aeroderivative gas turbine",
  },
  {
    maker: "GE", makers: ["GE"], model: "LM6000", variant: "25 units", cat: "aero",
    units: 25, mw: null, summary: "25 units, or a 12-unit set",
    tags: [],
    specs: [["Units", "25, or a 12-unit set"]],
    img: "lm6000-generator-end-cut", fit: "cut", alt: "Inlet end of a GE LM6000 aeroderivative gas turbine",
  },
  {
    maker: "GE", makers: ["GE"], model: "LM6000", variant: "Up to 6 units", cat: "aero",
    units: 6, unitsLabel: "Up to 6", mw: null, summary: "Up to 6 units",
    tags: [],
    specs: [["Units", "Up to 6"]],
    img: "lm6000-plant", fit: "photo", alt: "Aerial view of an LM6000 power plant",
  },
  {
    maker: "GE", makers: ["GE"], model: "LM6000", variant: "Packages", cat: "aero",
    units: null, mw: null, summary: "Several lots · sizes on request",
    tags: [],
    specs: [["Units", "Several lots, sizes on request"]],
    img: "lm6000-turbine-end-cut", fit: "cut", alt: "Turbine section of a GE LM6000 aeroderivative gas turbine",
  },
  {
    maker: "GE", makers: ["GE"], model: "TM2500", variant: "Mobile", cat: "aero",
    units: 10, mw: null, summary: "10 units",
    tags: [],
    specs: [["Units", "10"]],
    img: "tm2500-trailer", fit: "photo", alt: "GE TM2500 mobile gas turbine on its trailer",
  },
  {
    maker: "Siemens", makers: ["Siemens"], model: "SGT-A05", variant: "", cat: "aero",
    units: 20, mw: null, summary: "20 units · 4 to 5.8 MW each",
    tags: ["New"],
    specs: [
      ["Units", "20"],
      ["Output", "4 to 5.8 MW each"],
      ["Condition", "New"],
      ["Availability", "10 units now, 10 to follow"],
    ],
    img: "sgt-a05", fit: "cut", alt: "Siemens SGT-A05 aeroderivative gas turbine",
  },
  {
    maker: "Pratt & Whitney", makers: ["Pratt & Whitney"], model: "FT4A-9", variant: "", cat: "aero",
    units: 3, mw: null, summary: "3 units",
    tags: [],
    specs: [["Units", "3"]],
    img: null, alt: "",
  },

  /* ---------- Reciprocating engines ---------- */
  {
    maker: "MTU", makers: ["MTU"], model: "16V4000", variant: "", cat: "recip",
    units: 45, mw: 112.5, summary: "45 units · 112.5 MW",
    tags: ["Delivery 2028 to 2029"],
    specs: [
      ["Units", "45"],
      ["Output", "112.5 MW total"],
      ["Delivery", "Late 2028 to early 2029"],
    ],
    img: "mtu-s4000", fit: "photo", alt: "MTU Series 4000 gas generator set",
  },
  {
    maker: "Wärtsilä", makers: ["Wärtsilä"], model: "31SG", variant: "", cat: "recip",
    units: 10, mw: 123, mwLabel: "c. 123", summary: "10 units · about 123 MW",
    tags: [],
    specs: [
      ["Units", "10"],
      ["Output", "About 123 MW total"],
    ],
    img: "wartsila-31sg-cut", fit: "cut", alt: "Wärtsilä 31SG gas engine",
  },
  {
    maker: "", makers: [], model: "Reciprocating engines", variant: "", cat: "recip",
    units: null, mw: 285, summary: "285 MW",
    tags: ["New"],
    specs: [
      ["Output", "285 MW"],
      ["Condition", "New"],
    ],
    img: null, alt: "",
  },
  {
    maker: "Wärtsilä", makers: ["Wärtsilä"], model: "Engine package", variant: "300 MW", cat: "recip",
    units: null, mw: 300, summary: "300 MW package",
    tags: [],
    specs: [["Output", "300 MW"]],
    img: "wartsila-plant-aerial", fit: "photo", alt: "Aerial view of a Wärtsilä engine power plant",
  },
  {
    maker: "Wärtsilä", makers: ["Wärtsilä"], model: "34SG", variant: "6-unit lot", cat: "recip",
    units: 6, mw: 56.4, summary: "6 units · 56.4 MW",
    tags: [],
    specs: [
      ["Units", "6"],
      ["Output", "56.4 MW total"],
    ],
    img: "wartsila-34sg-cut", fit: "cut", alt: "Wärtsilä 34SG gas engine generating set",
  },
  {
    maker: "Caterpillar", makers: ["Caterpillar"], model: "G3520", variant: "", cat: "recip",
    units: 96, mw: null, summary: "96 units",
    tags: [],
    specs: [["Units", "96"]],
    img: null, alt: "",
  },
  {
    maker: "Wärtsilä", makers: ["Wärtsilä"], model: "Power plant", variant: "2 engines", cat: "recip",
    units: 2, mw: 18.76, summary: "2 units · 9.38 MW each · 18.76 MW",
    tags: [],
    specs: [
      ["Units", "2"],
      ["Output", "9.38 MW each, 18.76 MW total"],
    ],
    img: "wartsila-plant-dusk", fit: "photo", alt: "Wärtsilä engine power plant at dusk",
  },
  {
    maker: "Caterpillar", makers: ["Caterpillar"], model: "C175-20", variant: "", cat: "recip",
    units: 15, mw: 46.5, summary: "15 units · 46.5 MW",
    tags: [],
    specs: [
      ["Units", "15"],
      ["Output", "46.5 MW total"],
    ],
    img: null, alt: "",
  },
  {
    maker: "Wärtsilä", makers: ["Wärtsilä"], model: "34SG", variant: "2-unit lot", cat: "recip",
    units: 2, mw: 18, summary: "2 units · 9 MW each",
    tags: [],
    specs: [
      ["Units", "2"],
      ["Output", "9 MW each"],
    ],
    img: "wartsila-plant", fit: "photo", alt: "Wärtsilä engine power plant building",
  },
  {
    maker: "", makers: [], model: "Engines, unused", variant: "", cat: "recip",
    units: null, mw: null, summary: "Unit count on request",
    tags: ["2018 units", "Never used"],
    specs: [
      ["Model year", "2018"],
      ["Condition", "Never used"],
    ],
    img: null, alt: "",
  },
  {
    maker: "Wärtsilä", makers: ["Wärtsilä"], model: "Engines", variant: "2011", cat: "recip",
    units: null, mw: null, summary: "Unit count on request",
    tags: ["2011 units", "New Mexico"],
    specs: [
      ["Model year", "2011"],
      ["Location", "New Mexico"],
    ],
    img: "wartsila-engine-detail", fit: "photo", alt: "Detail of a Wärtsilä engine and generator coupling",
  },
  {
    maker: "Caterpillar", makers: ["Caterpillar"], model: "Production slots", variant: "", cat: "recip",
    units: null, mw: null, summary: "New-build slots",
    tags: ["New build"],
    specs: [["Scope", "New-build production slots"]],
    img: null, alt: "",
  },
  {
    maker: "Wärtsilä", makers: ["Wärtsilä"], model: "Gas engines", variant: "", cat: "recip",
    units: null, mw: null, summary: "Details on request",
    tags: [],
    specs: [],
    img: "wartsila-engine-hall", fit: "photo", alt: "Wärtsilä engine inside an engine hall",
  },
  {
    maker: "", makers: [], model: "Engine generator lot", variant: "", cat: "recip",
    units: null, mw: null, summary: "Details on request",
    tags: [],
    specs: [],
    img: null, alt: "",
  },
];
