# Power equipment listing page

A single static page that presents the available power generation equipment as a catalogue. There is no build step: open `index.html` in a browser, or serve the folder from any static host.

## Files

- `index.html`: page structure
- `styles.css`: all styling
- `listings.js`: the inventory, one entry per lot, plus the "as of" date and the contact address
- `app.js`: renders the cards, filters, sorting and the lot detail panel
- `images/`: product images, one `.webp` per file name used in `listings.js`
- `fonts/`: Inter and Instrument Serif (SIL Open Font License)

## Editing

- **Listings**: edit `listings.js`. Lot numbers follow the order of the list. The header comment in that file explains each field.
- **Enquiries**: set `contactEmail` in `listings.js`. Every "Request details" button then opens a pre-filled email that names the lot. While it is empty the buttons show "Enquiries open shortly".
- **Images**: add a `.webp` to `images/` and put its name (without extension) in the listing's `img` field. A listing with `img: null` shows a line drawing with "Photographs on request".

Each lot can be linked directly, for example `index.html#lot-08`.

## Image sources

Product images come from the manufacturers' own product pages (Siemens Energy, GE Vernova, Ansaldo Energia, Wärtsilä, MTU). They show the model or equipment class, not the specific units offered.
