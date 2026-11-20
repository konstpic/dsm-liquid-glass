(() => {
  "use strict";
  const root = document.documentElement;
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const key = "local.dsm.themes.v1";
  function apply() {
    let theme;
    try { theme = JSON.parse(localStorage.getItem(key))?.theme; } catch {}
    const dark = theme === "graphite" || (theme !== "frost" && scheme.matches);
    root.dataset.dsmMobileGlass = dark ? "dark" : "light";
  }
  apply();
  window.addEventListener("storage", event => { if (event.key === key || !event.key) apply(); });
  scheme.addEventListener("change", apply);
  const style = document.createElement("style");
  style.textContent = `
    html[data-dsm-mobile-glass] {
      --mobile-page: #eaf1f7; --mobile-row: #f6fafe; --mobile-ink: #20344c;
      --mobile-muted: #485d72; --mobile-accent: #185ba7; --mobile-rule: #cad6e1;
      --mobile-bar: rgb(236 245 253 / .94);
    }
    html[data-dsm-mobile-glass=dark] {
      color-scheme: dark; --mobile-page: #172331; --mobile-row: #203042;
      --mobile-ink: #eef4fc; --mobile-muted: #bdccdb; --mobile-accent: #99c6ff;
      --mobile-rule: #405267; --mobile-bar: rgb(28 43 60 / .95);
    }
    .syno-mobile-body, .syno-mobile-body :is(.syno-mobile-list,.x-form,.x-list-normal) {
      background: var(--mobile-page) !important; color: var(--mobile-ink);
    }
    .syno-mobile-body :is(.syno-mobile-content-navigation-bar,.x-tabbar) {
      background: var(--mobile-bar) !important; color: var(--mobile-ink);
      border-color: var(--mobile-rule) !important; box-shadow: none !important;
      -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
    }
    .syno-mobile-body :is(.x-title,.syno-mobile-mainmenu-item-name,.packagecenter-list-item-name,.x-form-label) {
      color: var(--mobile-ink) !important; text-shadow: none !important;
    }
    .syno-mobile-body :is(.x-list-item,.x-list-item-body,.x-list-item-inner) {
      background-color: var(--mobile-row) !important; border-color: var(--mobile-rule) !important;
    }
    .syno-mobile-body :is(.packagecenter-list-item-version,.x-list-header,.x-form-fieldset-title,.x-tab .x-button-label) {
      color: var(--mobile-muted) !important; text-shadow: none !important;
    }
    .syno-mobile-body .x-list-header { background: var(--mobile-page) !important; }
    .syno-mobile-body .x-tab-active .x-button-label { color: var(--mobile-accent) !important; }
    .syno-mobile-body .syno-ux-button-green-fill { background: #256544 !important; color: white !important; }
    html[data-dsm-mobile-glass=dark] .syno-mobile-body .packagecenter-list-item-status { color: #96dbad; }
    html[data-dsm-mobile-glass=dark] .syno-mobile-icon-nav,
    html[data-dsm-mobile-glass=dark] .x-tab-active .x-button-icon { filter: brightness(1.8); }
    .syno-mobile-body .x-button { border-radius: 10px; }
    .syno-mobile-body .syno-mobile-titlebar-button { color: var(--mobile-accent) !important; }
    .syno-mobile-body :is(input[type=checkbox],input[type=radio]) { accent-color: var(--mobile-accent); }
  `;
  (document.head || root).append(style);
})();
