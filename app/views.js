// Deal Sleuth views: turns deal data into HTML strings. No network, no
// framework — plain template strings, escaped where a value could carry markup.

import { VERDICTS, discountOf, savingOf } from "./data.js";

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function money(amount) {
  const cents = Math.round(amount * 100);
  const dollars = Math.floor(cents / 100);
  const rest = String(cents % 100).padStart(2, "0");
  return `$${dollars.toLocaleString("en-US")}.${rest}`;
}

export function checkedLabel(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${d
    .toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} UTC`;
}

export function verdictChip(deal) {
  const info = VERDICTS[deal.verdict];
  return `<span class="verdict verdict-${deal.verdict}" title="${esc(info.note)}">${esc(info.label)}</span>`;
}

export function dealCard(deal) {
  const off = discountOf(deal);
  return `<li class="deal-card" id="deal-${esc(deal.id)}">
    <div class="deal-top"><span class="deal-cat">${esc(deal.category)}</span><span class="deal-store">${esc(deal.store)}</span></div>
    <h2 class="deal-title"><a href="#/deal/${esc(deal.id)}">${esc(deal.title)}</a></h2>
    <div class="price-row">
      <span class="price-now">${money(deal.price)}</span>
      <span class="price-was">${money(deal.was)}</span>
      <span class="discount-badge">${off}% off</span>
    </div>
    <p class="save-line">You save ${money(savingOf(deal))} vs the usual price.</p>
    ${verdictChip(deal)}
    <p class="deal-evidence">${esc(deal.evidence)}</p>
    <div class="deal-meta">Checked ${checkedLabel(deal.checked)} · Source: <a href="${esc(deal.sourceUrl)}" target="_blank" rel="noopener">${esc(deal.source)}</a></div>
    <a class="store-link" href="${esc(deal.url)}" target="_blank" rel="noopener">See it at ${esc(deal.store)} ↗</a>
  </li>`;
}

export function dealRows(list) {
  if (list.length === 0) {
    return `<div class="empty"><h2>No deals match that search.</h2><p>Try a different word, or clear a filter — every deal is still on the board.</p></div>`;
  }
  return `<ul class="deals">${list.map(dealCard).join("")}</ul>`;
}

export function filterBar(categories, stores, state) {
  const catOptions = [`<option value="">All categories</option>`]
    .concat(categories.map((c) => `<option value="${esc(c)}"${state.category === c ? " selected" : ""}>${esc(c)}</option>`))
    .join("");
  const storeOptions = [`<option value="">All stores</option>`]
    .concat(stores.map((s) => `<option value="${esc(s)}"${state.store === s ? " selected" : ""}>${esc(s)}</option>`))
    .join("");
  const minOptions = [0, 20, 30, 40, 50, 60]
    .map((n) => `<option value="${n}"${state.minDiscount === n ? " selected" : ""}>${n === 0 ? "Any discount" : n + "% off or more"}</option>`)
    .join("");
  const sortOptions = [
    ["discount", "Best discount first"],
    ["saving", "Biggest saving first"],
    ["newlow", "New lows first"],
    ["price-low", "Lowest price first"],
    ["price-high", "Highest price first"],
  ]
    .map(([v, label]) => `<option value="${v}"${state.sort === v ? " selected" : ""}>${label}</option>`)
    .join("");
  return `<section class="filters" aria-label="Search and filter deals">
    <div class="filters-row">
      <input class="search" type="search" placeholder="Search deals — try “headphones” or “TV”…" value="${esc(state.query)}" aria-label="Search deals">
      <select data-filter="category" aria-label="Filter by category">${catOptions}</select>
      <select data-filter="store" aria-label="Filter by store">${storeOptions}</select>
      <select data-filter="minDiscount" aria-label="Filter by discount">${minOptions}</select>
      <select data-filter="sort" aria-label="Sort deals">${sortOptions}</select>
    </div>
    <p class="verdict-legend">
      <span><span class="verdict verdict-new-low">New low</span> lowest price tracked</span>
      <span><span class="verdict verdict-strong">Strong price</span> a real saving</span>
      <span><span class="verdict verdict-routine">Routine sale</span> check the list price first</span>
    </p>
  </section>`;
}

export function listView(state, shown, total) {
  const countLine =
    shown.length === total
      ? `<strong>${total} deals</strong>, all checked 27 Nov 2026`
      : `Showing <strong>${shown.length}</strong> of ${total} deals`;
  return `${filterBar(state.categories, state.stores, state)}
    <p class="result-count">${countLine}</p>
    <div class="deals-wrap">${dealRows(shown)}</div>`;
}

export function dealView(deal, sameStore) {
  const off = discountOf(deal);
  const info = VERDICTS[deal.verdict];
  const others = sameStore
    .filter((d) => d.id !== deal.id)
    .slice(0, 3)
    .map((d) => `<a href="#/deal/${esc(d.id)}">${esc(d.title)}</a> (${money(d.price)})`)
    .join(" · ");
  return `<article class="detail">
    <a class="back-link" href="#/">← Back to all deals</a>
    <h1>${esc(deal.title)}</h1>
    <p class="save-line">${esc(deal.category)} · sold by ${esc(deal.store)}</p>
    <div class="price-row">
      <span class="price-now">${money(deal.price)}</span>
      <span class="price-was">usual ${money(deal.was)}</span>
      <span class="discount-badge">${off}% off</span>
    </div>
    <p class="save-line">You save ${money(savingOf(deal))} — ${off}% under the usual price.</p>
    <div class="evidence-box">
      <h2>Is it really a deal? ${esc(info.label)}</h2>
      <p>${esc(deal.evidence)}</p>
    </div>
    <ul class="fact-list">
      <li><span>Store</span><span>${esc(deal.store)}</span></li>
      <li><span>Sale price</span><span>${money(deal.price)}</span></li>
      <li><span>Usual price</span><span>${money(deal.was)}</span></li>
      <li><span>Discount</span><span>${off}% — matches the two prices above</span></li>
      <li><span>Checked</span><span>${checkedLabel(deal.checked)}</span></li>
      <li><span>Price source</span><span><a href="${esc(deal.sourceUrl)}" target="_blank" rel="noopener">${esc(deal.source)}</a></span></li>
    </ul>
    <p><a class="store-link" href="${esc(deal.url)}" target="_blank" rel="noopener">See it at ${esc(deal.store)} ↗</a></p>
    ${others ? `<p class="compare-note">More from ${esc(deal.store)} on this board: ${others}</p>` : ""}
  </article>`;
}

export function missingView(id) {
  return `<div class="empty"><h2>No deal called “${esc(id)}” on this board.</h2><p><a href="#/">Back to all deals</a></p></div>`;
}

export function statsBar(totalDeals, totalSaving, newLows, stores) {
  return `<span><strong>${totalDeals}</strong> deals checked</span>
    <span><strong>${money(totalSaving)}</strong> total savings vs usual prices</span>
    <span><strong>${newLows}</strong> at new all-time lows</span>
    <span>Stores: <strong>${stores.join(" · ")}</strong></span>
    <span>Checked <strong>27 Nov 2026</strong></span>`;
}
