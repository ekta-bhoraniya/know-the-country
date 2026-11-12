# Know the State

Spin an astrolabe wheel, watch the globe land on a random country, and read a passport-style card about it. MVP and v1 info card, Vintage Explorer design direction.

## Run it

Open `index.html` in a browser. It is a single self-contained page; d3 and topojson load from cdnjs and fonts from Google Fonts.

## What's here

- `index.html`: the built page, with all map and country data embedded.
- `scripts/template.html`: page source; the build inserts the data at `/*DATA*/`.
- `scripts/build.js`: merges borders and country facts into the data bundle.
- `data/curated.json`: leaders, population, GDP and "Did you know?" facts for 20 polished countries.
- `data/v1.json`: About summaries, standout facts and detail fields (FR18–FR21) for the same 20.

## Data sources

- Borders: Natural Earth 10m admin-0 (India point of view) and admin-1, simplified with mapshaper.
- Country basics: the `world-countries` npm package.
- Time zones: the IANA `zone.tab`. The time at the pin uses the nearest zone city in that country.
- Curated figures and text: drafted by hand and still need human review before launch.

The build expects simplified borders in `build/` (made with mapshaper from the Natural Earth GeoJSON) and `world-countries` installed. The paths are at the top of `scripts/build.js`.
