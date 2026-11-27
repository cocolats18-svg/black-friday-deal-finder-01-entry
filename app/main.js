// Deal Sleuth — app shell. Hash routes, search, filters and sorting all run
// in the browser over the deals in data.js; nothing is fetched at run time.
//
//   #/              the deal board, with search + filters
//   #/deal/<id>     one deal, with its evidence and source
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { CATEGORIES, STORES, deals, discountOf, savingOf } from "./data.js";
import { dealRows, dealView, listView, missingView, statsBar } from "./views.js";

const app = document.getElementById("app");
const stats = document.getElementById("statsbar");

const state = {
  query: "",
  category: "",
  store: "",
  minDiscount: 0,
  sort: "discount",
  categories: CATEGORIES,
  stores: STORES,
};

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  let shown = deals.filter((d) => {
    if (state.category && d.category !== state.category) return false;
    if (state.store && d.store !== state.store) return false;
    if (discountOf(d) < state.minDiscount) return false;
    if (q && !(d.title + " " + d.store + " " + d.category).toLowerCase().includes(q)) return false;
    return true;
  });
  const byDiscount = (a, b) => discountOf(b) - discountOf(a) || savingOf(b) - savingOf(a);
  const bySaving = (a, b) => savingOf(b) - savingOf(a) || discountOf(b) - discountOf(a);
  const rankVerdict = (d) => (d.verdict === "new-low" ? 0 : d.verdict === "strong" ? 1 : 2);
  if (state.sort === "discount") shown.sort(byDiscount);
  else if (state.sort === "saving") shown.sort(bySaving);
  else if (state.sort === "newlow") shown.sort((a, b) => rankVerdict(a) - rankVerdict(b) || byDiscount(a, b));
  else if (state.sort === "price-low") shown.sort((a, b) => a.price - b.price);
  else if (state.sort === "price-high") shown.sort((a, b) => b.price - a.price);
  return shown;
}

function renderStats() {
  const totalSaving = deals.reduce((sum, d) => sum + savingOf(d), 0);
  const newLows = deals.filter((d) => d.verdict === "new-low").length;
  stats.innerHTML = statsBar(deals.length, totalSaving, newLows, STORES);
}

function wireList() {
  const search = app.querySelector(".search");
  const wrap = app.querySelector(".deals-wrap");
  const count = app.querySelector(".result-count");
  const refresh = () => {
    const shown = applyFilters();
    wrap.innerHTML = dealRows(shown);
    count.innerHTML =
      shown.length === deals.length
        ? `<strong>${deals.length} deals</strong>, all checked 27 Nov 2026`
        : `Showing <strong>${shown.length}</strong> of ${deals.length} deals`;
  };
  search.addEventListener("input", () => {
    state.query = search.value;
    refresh();
  });
  app.querySelectorAll("select[data-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      const key = select.dataset.filter;
      state[key] = key === "minDiscount" ? Number(select.value) : select.value;
      refresh();
    });
  });
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    const found = deals.find((d) => d.id === id);
    document.title = found ? `${found.title} | Deal Sleuth` : "Not found | Deal Sleuth";
    app.innerHTML = found
      ? dealView(found, deals.filter((d) => d.store === found.store))
      : missingView(id);
  } else {
    document.title = "Deal Sleuth — Real Black Friday & Cyber Monday deals, checked 27 Nov 2026";
    const shown = applyFilters();
    app.innerHTML = listView(state, shown, deals.length);
    wireList();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

renderStats();
window.addEventListener("hashchange", render);
render();
