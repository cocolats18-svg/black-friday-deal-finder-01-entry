# Deal Sleuth — Black Friday deal finder

[![Black Friday deal finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/cocolats18-svg/black-friday-deal-finder-01-entry/rank.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/cocolats18-svg/black-friday-deal-finder-01-entry/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)

A static deal-finder site for Black Friday and Cyber Monday 2026: **28 real deals**, each checked live on 27 November 2026, with the product, its store, a link to it there, the sale price, the usual price, the discount, when the price was checked, where it was read, and an honest verdict on whether it is really a deal.

## What it does

- Search deals by name, and filter by category, store and minimum discount.
- Sort by best discount, biggest saving, new lows first, or price.
- A detail page for every deal (hash routes) with the evidence behind its verdict and a comparison with other deals from the same store.
- A verdict on each deal — **New low**, **Strong price** or **Routine sale** — with the evidence in plain words, including two deals where the list price was inflated before the sale.
- Works on desktop and on a phone; no framework, no network requests at run time.

## Deals

28 deals from Amazon, Best Buy, Walmart and Target, across audio, TVs, laptops, phones, home, kitchen, gaming, streaming, e-readers, smart home, wearables and accessories. Highlights: AirPods Pro 3 at $149 (all-time low), Sony WH-1000XM5 at $169.99, the TCL 65-inch 4K TV at $229.99, the HP OmniBook 5 OLED laptop at $449.99, and the Nintendo Switch 2 bundle at $499.99.

## How the prices were checked

Each deal was found and checked by the builder on 27 November 2026 (UTC), reading the price at the store or in a deals source that names the store. The deal's own page shows the source and the check time, and a verdict — **New low** (lowest price the trackers have seen), **Strong price** (a real saving), or **Routine sale** (discounted, but the list price may be inflated) — with the evidence behind it. If a price could not be verified on a live page, the deal was left off the board.

## Run it

Serve `app/` with any static server and open it:

```sh
python3 -m http.server 8080 --directory app
```

Then open http://localhost:8080. Or build the hand-in bundle:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## Layout

- `app/index.html` — page shell, header, stats bar and footer
- `app/style.css` — the whole look, in CSS only (no web fonts, no images)
- `app/main.js` — routes, search, filters and sorting
- `app/views.js` — HTML for the deal board and the deal detail page
- `app/data.js` — the 28 checked deals, their prices, sources and verdicts
- `screenshots/` — renders of the site running in a browser
- `main.ts` — the hand-in program
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## License

MIT — see `LICENSE`.
