# Power equipment listing page

A single static page that presents the available power generation equipment as a dark, off-market schedule: an annotated hero, principal lots, stated capacity by class, a sortable board of every lot and a full-screen sheet for each lot. There is no build step: open `index.html` in a browser, or serve the folder from any static host.

## Files

- `index.html`: page structure
- `styles.css`: all styling
- `listings.js`: the inventory, one entry per lot, plus the "as of" date and the contact address
- `app.js`: renders the hero callouts, figures, principal lots, capacity, the board with its filters and sorting, the lot sheet, and the engraved rosette behind the enquiry panel
- `images/`: product images, one `.webp` per file name used in `listings.js`
- `images/thumbs/`: 360 px wide copies used in the schedule table
- `fonts/`: Newsreader, Archivo and IBM Plex Mono (SIL Open Font License)

## Editing

- **Listings**: edit `listings.js`. Lot numbers follow the order of the list. The header comment in that file explains each field.
- **Enquiries**: set `contactEmail` in `listings.js`. Every "Request details" button then opens a pre-filled email that names the lot. While it is empty the buttons show "Enquiries open shortly".
- **Images**: add a `.webp` to `images/` and put its name (without extension) in the listing's `img` field. Add a 360 px wide copy with the same name to `images/thumbs/` for the board; without one the board falls back to the full image. The page is dark, so product shots on a white background should be cut out to a transparent `.webp` and given `fit: "cut"` (the `-cut` files in `images/` were made this way). Photographs use `fit: "photo"`. Images appear in monochrome on the page and in colour on hover and in the lot sheet. A listing with `img: null` shows a line drawing with "Photographs on request".
- **Totals**: the summary and capacity figures are calculated from `units` and `mw` in `listings.js`, and only count lots that state a figure.

Each lot can be linked directly, for example `index.html#lot-08`. The lot sheet has Copy link and Print sheet buttons, and the arrow keys move between lots. Printing switches to a light layout: the page prints as the full schedule, and Print sheet prints a single lot.

## Image sources

Product images come from the manufacturers' own product pages (Siemens Energy, GE Vernova, Ansaldo Energia, Wärtsilä, MTU). They show the model or equipment class, not the specific units offered.

## PDF brochure

`brochure/Power-Equipment-Schedule.pdf` is the printable version of the schedule in the same dark style: cover, overview with stated capacity and contents, one page per principal lot, the full board on one page, a sheet for every lot (two per page) and the terms of circulation. It is generated from `listings.js`, so regenerate it whenever the inventory changes:

```
node brochure/build.js
```

This needs Node and Playwright with Chromium (`npm i -g playwright` and `npx playwright install chromium`). The layout lives in `brochure/brochure.html`, `brochure.css` and `brochure.js`. If `contactEmail` is set in `listings.js` it is printed on the back page.

