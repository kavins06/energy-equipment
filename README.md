# Power equipment listing page

A single static page that presents the available power generation equipment as an offering schedule: a summary of inventory, featured lots, stated capacity by equipment type, a sortable schedule of every lot (table or gallery view) and a printable sheet for each lot. There is no build step: open `index.html` in a browser, or serve the folder from any static host.

## Files

- `index.html`: page structure
- `styles.css`: all styling
- `listings.js`: the inventory, one entry per lot, plus the "as of" date and the contact address
- `app.js`: renders the summary figures, featured lots, capacity table, schedule, filters, sorting and the lot sheet
- `images/`: product images, one `.webp` per file name used in `listings.js`
- `images/thumbs/`: 360 px wide copies used in the schedule table
- `fonts/`: Source Serif 4, IBM Plex Sans and IBM Plex Mono (SIL Open Font License)

## Editing

- **Listings**: edit `listings.js`. Lot numbers follow the order of the list. The header comment in that file explains each field.
- **Enquiries**: set `contactEmail` in `listings.js`. Every "Request details" button then opens a pre-filled email that names the lot. While it is empty the buttons show "Enquiries open shortly".
- **Images**: add a `.webp` to `images/` and put its name (without extension) in the listing's `img` field. Add a 360 px wide copy with the same name to `images/thumbs/` for the schedule table; without one the table falls back to the full image. A listing with `img: null` shows a line drawing with "Photographs on request".
- **Totals**: the summary and capacity figures are calculated from `units` and `mw` in `listings.js`, and only count lots that state a figure.

Each lot can be linked directly, for example `index.html#lot-08`. The lot sheet has Copy link and Print sheet buttons; printing the page itself produces the full schedule as a document.

## Image sources

Product images come from the manufacturers' own product pages (Siemens Energy, GE Vernova, Ansaldo Energia, Wärtsilä, MTU). They show the model or equipment class, not the specific units offered.
