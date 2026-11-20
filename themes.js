(() => {
  "use strict";

  const root = document.documentElement;
  const preferencesKey = "local.dsm.themes.v1";
  const entryClass = "dsm-local-theme-entry";
  const dialogId = "dsm-local-theme-dialog";
  const lensId = "dsm-local-liquid-glass";
  const waterId = "dsm-local-wallpaper-water";
  const chromium = /\bChrom(?:e|ium)\//.test(navigator.userAgent) &&
    CSS.supports("backdrop-filter", `url(#${lensId})`);
  const systemAppearance = window.matchMedia("(prefers-color-scheme: dark)");
  const themes = Object.freeze({
    frost: "Светлая",
    graphite: "Тёмная",
    auto: "Авто",
  });

  if (root.dataset.dsmLocalThemesLoaded) return;
  root.dataset.dsmLocalThemesLoaded = "1";

  const styles = document.createElement("style");
  const windowSurfaces = ".v-window, .x-window";
  const menuSurfaces = [
    ".x-menu", ".x-combo-list", ".x-tip", ".v-menu-content", ".v-dropdown-menu", ".v-popover-content",
    ".v-notification-panel", ".sds-taskbar-menu", ".sds-widget-panel", ".sds-tray-panel",
    ".sds-start-menu", ".sds-main-menu", ".start-menu-wrapper", ".main-menu-wrapper", ".syno-sds-appview",
  ].join(", ");
  styles.textContent = `
    html[data-dsm-local-theme="frost"] {
      color-scheme: light;
      --dsm-theme-surface: rgb(246 251 255 / .66);
      --dsm-theme-panel: rgb(237 247 255 / .75);
      --dsm-theme-tint: #97c9ff;
      --dsm-theme-blur: 9px;
      --dsm-theme-saturation: 140%;
      --dsm-theme-glint: .40;
      --dsm-theme-edge: rgb(255 255 255 / .67);
      --dsm-theme-shadow: rgb(23 51 80 / .24);
      --dsm-theme-ink: #172c45;
      --dsm-theme-hover: rgb(112 159 213 / .18);
    }
    html[data-dsm-local-theme="graphite"] {
      color-scheme: dark;
      --dsm-theme-surface: rgb(19 27 43 / .82);
      --dsm-theme-panel: rgb(21 31 51 / .88);
      --dsm-theme-tint: #536ea1;
      --dsm-theme-blur: 13px;
      --dsm-theme-saturation: 120%;
      --dsm-theme-glint: .16;
      --dsm-theme-edge: rgb(198 216 242 / .25);
      --dsm-theme-shadow: rgb(9 20 37 / .37);
      --dsm-theme-ink: #e6efff;
      --dsm-theme-hover: rgb(123 169 238 / .24);
    }
    html[data-dsm-local-theme] {
      --dsm-theme-radius: 15px;
    }
    @media (prefers-reduced-motion: no-preference) {
      html[data-dsm-local-theme]:has(#sds-desktop-shortcut) #sds-wallpaper {
        visibility: visible !important;
        filter: url(#${waterId});
        transform: scale(1.028);
      }
      html[data-dsm-local-theme] #sds-wallpaper::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image: var(--dsm-wallpaper-image, none);
        background-size: var(--dsm-wallpaper-size, cover);
        background-position: var(--dsm-wallpaper-position, center);
        background-repeat: var(--dsm-wallpaper-repeat, no-repeat);
      }
    }
    html[data-dsm-local-theme] :is(.taskbar-wrapper, .sds-taskbar) {
      background:
        linear-gradient(112deg, rgb(255 255 255 / calc(var(--dsm-theme-glint) * .19)), transparent 39%, transparent 74%, rgb(255 255 255 / calc(var(--dsm-theme-glint) * .19))),
        color-mix(in srgb, rgb(21 35 53 / .72), var(--dsm-theme-tint) 7%) !important;
      color: #f1f6ff !important;
      border-color: var(--dsm-theme-edge) !important;
      box-shadow: inset 0 1px rgb(255 255 255 / var(--dsm-theme-glint));
    }
    html[data-dsm-local-theme] :is(.taskbar-wrapper, .sds-taskbar, ${windowSurfaces}, ${menuSurfaces}) {
      -webkit-backdrop-filter: blur(var(--dsm-theme-blur)) saturate(var(--dsm-theme-saturation));
      backdrop-filter: blur(1px) var(--dsm-theme-filter) blur(var(--dsm-theme-blur)) saturate(var(--dsm-theme-saturation));
    }
    html[data-dsm-local-theme] :is(${windowSurfaces}, ${menuSurfaces}) {
      background:
        linear-gradient(136deg, rgb(255 255 255 / calc(var(--dsm-theme-glint) * .48)), transparent 31%, transparent 78%, rgb(255 255 255 / calc(var(--dsm-theme-glint) * .28))),
        color-mix(in srgb, var(--dsm-theme-surface), var(--dsm-theme-tint) 8%) !important;
      border-color: var(--dsm-theme-edge) !important;
      border-radius: var(--dsm-theme-radius);
      box-shadow:
        inset 0 0 0 1px rgb(255 255 255 / .32),
        inset 1px 2px 8px rgb(255 255 255 / calc(var(--dsm-theme-glint) * .35)),
        0 15px 44px var(--dsm-theme-shadow) !important;
    }
    html[data-dsm-local-theme] .syno-sds-appview {
      --dsm-theme-surface: rgb(24 40 58 / .72);
      border-radius: 0 0 var(--dsm-theme-radius) var(--dsm-theme-radius);
    }
    html[data-dsm-local-theme] :is(.x-window-body, .v-window-body, .x-window-mc, .x-window-bwrap,
      .x-menu-list, .x-combo-list-inner, .v-window .v-layout.layout-window-page-list-app,
      .v-notification-wrapper .v-notification, .sds-tray-panel .x-panel-body,
      .taskbar-wrapper .taskbar-left-wrapper, .taskbar-wrapper .tray-container,
      .taskbar-wrapper .system-tray-wrapper, .v-window-header-wrapper, .x-window-header) {
      background: transparent !important;
      border-color: transparent !important;
      box-shadow: none;
    }
    html[data-dsm-local-theme] :is(.v-window, .x-window) :is(
      .v-module-list, .module-list-layout, .v-module-list .v-scrollbar, .v-module-list .module-item,
      .x-tree, .x-grid3, .x-grid3-viewport, .x-grid3-scroller, .x-panel-body, .v-dialog-body,
      .syno-ux-formpanel, .x-toolbar, .x-panel-footer, .v-window-footer, .x-grid3-header, .x-grid3-header-inner,
      .x-tab-panel-header, .x-tab-strip-wrap, .x-tab-strip-spacer, .x-grid3-body
    ) {
      background: transparent !important;
      box-shadow: none;
    }
    html[data-dsm-local-theme] :is(
      .syno-app-admin-center .app-modules-wrapper, .syno-app-admin-center .app-module-fieldset,
      .syno-app-admin-center .v-fieldset-title-wrapper, .syno-app-admin-center .v-fieldset-title,
      .syno-app-admin-center .v-fieldset-body, .syno-app-admin-center .module-items-wrapper,
      .x-window .x-toolbar, .x-window .x-grid3-header, .x-window .x-grid3-row,
      .x-window .x-panel-footer, .v-window .v-window-footer, .v-window .v-module-list,
      .v-window .x-tab-panel-header, .v-window .x-tab-strip-spacer
    ) {
      background: transparent !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }
    html[data-dsm-local-theme] .syno-app-admin-center :is(.app-module-fieldset, .v-fieldset-title-wrapper, .v-fieldset-title)::before,
    html[data-dsm-local-theme] .syno-app-admin-center :is(.app-module-fieldset, .v-fieldset-title-wrapper, .v-fieldset-title)::after {
      background: transparent !important;
      border-color: transparent !important;
    }
    html[data-dsm-local-theme] :is(.v-window-header-wrapper, .x-window-header) {
      border-radius: var(--dsm-theme-radius) var(--dsm-theme-radius) 0 0;
      color: var(--dsm-theme-ink);
    }
    html[data-dsm-local-theme] :is(.v-window-header-wrapper, .x-window-header)
      :is(.app-window-header-title, .v-window-title, .x-window-header-text, .v-icon) {
      color: var(--dsm-theme-ink) !important;
    }
    html[data-dsm-local-theme] :is(.x-menu, .x-combo-list, .sds-tray-panel, .v-notification-panel, .syno-sds-widget) {
      --dsm-theme-surface: var(--dsm-theme-panel);
      color: var(--dsm-theme-ink);
    }
    html[data-dsm-local-theme] :is(.v-notification-panel, .sds-notify-tray-panel) {
      border-radius: var(--dsm-theme-radius) !important;
      overflow: hidden;
      isolation: isolate;
      background-clip: padding-box !important;
      box-shadow: inset 0 0 0 1px var(--dsm-theme-edge), 0 7px 22px var(--dsm-theme-shadow) !important;
    }
    html[data-dsm-local-theme] .v-notification-container {
      overflow: visible !important;
    }
    html[data-dsm-local-theme] :is(
      .sds-notify-tray-panel .x-panel-bbar, .sds-notify-tray-panel .x-toolbar,
      .sds-notify-tray-panel .x-panel-bbar .x-toolbar-ct,
      .v-notification-panel .v-notification-wrapper, .v-notification-panel .v-notification-footer-wrapper
    ) {
      border-color: transparent !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    html[data-dsm-local-theme="graphite"] :is(${windowSurfaces}, ${menuSurfaces}) {
      color: var(--dsm-theme-ink);
    }
    html[data-dsm-local-theme="graphite"] :is(${windowSurfaces}, ${menuSurfaces})
      :is(p, label, .module-item-title, .module-item-option, .x-tree-node-anchor span, .x-grid3-cell-inner,
      .x-grid3-hd-inner, .x-menu-item-text, .x-toolbar-text, .x-panel-header-text, .x-form-item-label,
      .x-tab-strip-text, .v-fieldset-title, .v-notification-title, .v-notification-body, .sds-notify-empty-text) {
      color: var(--dsm-theme-ink) !important;
    }
    html[data-dsm-local-theme="graphite"] :is(${windowSurfaces}, ${menuSurfaces})
      :is(input:not([type="checkbox"], [type="radio"]), textarea, select, .x-btn:not(.syno-ux-button-blue), .v-btn-grey) {
      background-color: rgb(43 58 84 / .84);
      color: var(--dsm-theme-ink);
      border-color: rgb(178 203 242 / .28);
    }
    html[data-dsm-local-theme="graphite"] :is(${windowSurfaces}, ${menuSurfaces})
      :is(a:not(.x-menu-item, .x-tree-node-anchor), .v-fieldset-title) {
      color: #a5caff;
    }
    html[data-dsm-local-theme="graphite"] .syno-app-admin-center .admin-center-search-box {
      background: rgb(43 58 84 / .84) !important;
      color: var(--dsm-theme-ink);
      border-color: rgb(178 203 242 / .28);
    }
    html[data-dsm-local-theme="graphite"] .syno-app-admin-center .admin-center-search-box input {
      background: transparent;
    }
    html[data-dsm-local-theme="graphite"] .syno-app-admin-center .admin-center-search-box input::placeholder {
      color: #bdcee8;
    }
    html[data-dsm-local-theme] :is(.x-menu .x-menu-list-item, .x-menu .x-menu-sep,
      .syno-sds-widget .v-widget-item, .syno-sds-widget .v-widget-item-content, .syno-sds-widget .v-widget-item-header,
      .syno-sds-widget .x-panel-body, .sds-tray-panel .x-panel-body, .sds-tray-panel .sds-notify-tray-panel-dataview) {
      background: transparent !important;
      border-color: transparent !important;
      box-shadow: none !important;
    }
    html[data-dsm-local-theme] :is(.x-menu .x-menu-item-active, .v-window .module-item-option.activated,
      .v-window .module-item-option:hover, .syno-app-admin-center .module-items-wrapper > .module-item:hover,
      .x-window .x-grid3-row-over, .x-window .x-grid3-row-selected) {
      background: var(--dsm-theme-hover) !important;
      border-radius: 7px;
    }
    html[data-dsm-local-theme] :is(.taskbar-wrapper .start-button, .taskbar-wrapper .tray-item) {
      color: #f1f6ff;
      background-color: transparent;
      border-color: transparent;
    }
    html[data-dsm-local-theme] .taskbar-wrapper :is(.taskbar-left-wrapper, .tray-container) :is(button, button > div) {
      border-color: transparent;
    }
    html[data-dsm-local-theme] :is(.taskbar-wrapper .start-button, .taskbar-wrapper .tray-item):hover {
      background-color: var(--dsm-theme-hover);
    }
    .${entryClass} {
      flex: 0 0 auto;
      margin-inline-start: 10px;
      padding: 3px 10px;
      border: 1px solid #b7c7dd;
      border-radius: 8px;
      background: #f4f8fe;
      color: #263f5d;
      font: 600 12px/1.45 system-ui, sans-serif;
      cursor: pointer;
    }
    .${entryClass}:hover { background: #e4efff; }
    .dsm-local-theme-module .${entryClass} {
      display: flex;
      align-items: center;
      width: 100%;
      margin: 0;
      border: 0;
      background: transparent;
      color: var(--dsm-theme-ink);
      font: inherit;
      text-align: start;
    }
    .dsm-local-theme-module .module-item-icon { display: inline-grid; place-items: center; color: inherit; }
    html[data-dsm-local-theme] :is(.admin-center-search-box, .syno-ux-textfilter-text, .x-form-field-wrap:has(.syno-ux-textfilter-text)) {
      border-radius: 999px !important;
    }
    html[data-dsm-local-theme] :is(.x-menu-floating, .x-combo-list, .v-select2-dropdown) {
      border-radius: 13px !important;
      background-clip: padding-box;
    }
    html[data-dsm-local-theme] .x-menu-floating .x-menu-list { border-radius: inherit; }
    html[data-dsm-local-theme="graphite"] :is(.syno-pkglist-title, .syno-pkglist-header, .syno-pkglist-title + *, .x-toolbar .x-btn:not(.syno-ux-button-blue) .x-btn-text, .x-form-empty-field, .module-item-text) {
      color: var(--dsm-theme-ink) !important;
    }
    html[data-dsm-local-theme="frost"] { --dsm-search-hint: #3e4a58; }
    html[data-dsm-local-theme="graphite"] { --dsm-search-hint: #bfcee3; }
    html[data-dsm-local-theme] :is(.admin-center-search-box input, .syno-ux-textfilter-text)::placeholder,
    html[data-dsm-local-theme] input.x-form-empty-field.syno-ux-textfilter-text {
      color: var(--dsm-search-hint) !important;
      opacity: 1;
    }
    .dsm-local-theme-tile.${entryClass} {
      margin: 0;
      border: 0;
      padding: 0;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    .dsm-local-theme-tile.${entryClass}:hover { background: #e4efff; }
    .dsm-local-theme-tile .module-item-icon {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 13px;
      background: linear-gradient(145deg, #ecfaff, #a7cdfd 54%, #567bd5);
      box-shadow: inset 0 1px 2px #fff, 0 3px 8px #5577b34d;
      color: #234b95;
      font: 26px/1 system-ui, sans-serif;
    }
    .${entryClass}:focus-visible, #${dialogId} :focus-visible {
      outline: 2px solid #2467cf;
      outline-offset: 2px;
    }
    #${dialogId} {
      width: min(500px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      box-sizing: border-box;
      padding: 24px;
      border: 1px solid rgba(255,255,255,.86);
      border-radius: 18px;
      background: linear-gradient(140deg, #fff9, transparent 40%), rgba(231,244,255,.82);
      color: #172b45;
      box-shadow: 0 22px 72px rgba(12,34,62,.33);
      backdrop-filter: blur(1px) var(--dsm-theme-filter) blur(14px) saturate(145%);
      font: 14px/1.45 system-ui, sans-serif;
      overflow: auto;
      z-index: 2147483000;
    }
    #${dialogId}::backdrop { background: rgba(14,31,54,.32); }
    #${dialogId} h1 { margin: 0 0 6px; font-size: 21px; }
    #${dialogId} p { margin: 0 0 14px; color: #405870; }
    #${dialogId} fieldset { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; margin: 0; padding: 0; border: 0; }
    #${dialogId} .dsm-theme-choice { position: relative; padding: 8px; border: 1px solid #a5bad5; border-radius: 11px; cursor: pointer; }
    #${dialogId} .dsm-theme-choice:has(input:checked) { border-color: #2467cf; background: #adcfff38; }
    #${dialogId} .dsm-theme-choice:focus-within { outline: 2px solid #2467cf; outline-offset: 2px; }
    #${dialogId} .dsm-theme-choice input { position: absolute; opacity: 0; }
    #${dialogId} .dsm-theme-sample { display: block; height: 38px; margin-bottom: 7px; border-radius: 6px; background: linear-gradient(150deg,#fff,#b5d6fa); }
    #${dialogId} [data-preset="graphite"] .dsm-theme-sample { background: linear-gradient(150deg,#45638e,#111c33); }
    #${dialogId} [data-preset="auto"] .dsm-theme-sample { background: linear-gradient(120deg,#dceeff 0 50%,#385475 51% 100%); }
    html[data-dsm-local-theme="graphite"] #${dialogId} { background: var(--dsm-theme-panel); color: var(--dsm-theme-ink); border-color: var(--dsm-theme-edge); }
    html[data-dsm-local-theme="graphite"] #${dialogId} p { color: #bdcee8; }
    #${dialogId} .dsm-theme-actions { display: flex; justify-content: end; gap: 8px; margin-top: 18px; }
    #${dialogId} button {
      padding: 7px 13px;
      border: 1px solid #a9bdd6;
      border-radius: 8px;
      background: #fff;
      color: #192c46;
      cursor: pointer;
      font: inherit;
    }
    #${dialogId} button[type="submit"] { border-color: #265cb3; background: #265cb3; color: #fff; }
    html[data-dsm-local-theme="frost"] {
      --control-fill: #f3f8fd; --control-line: #8799ac; --control-accent: #185ba7;
      --rule: rgb(63 88 113 / .22);
    }
    html[data-dsm-local-theme="graphite"] {
      --control-fill: #29394d; --control-line: #93a8c0; --control-accent: #326aaa;
      --rule: rgb(176 199 227 / .23);
    }
    html[data-dsm-local-theme] .x-window > .x-window-tl,
    html[data-dsm-local-theme] .v-window .v-window-header-wrapper {
      background: var(--dsm-theme-panel) !important;
      border-radius: var(--dsm-theme-radius) var(--dsm-theme-radius) 0 0 !important;
    }
    html[data-dsm-local-theme] .x-window :is(.x-window-bl,.x-window-br,.x-window-bc,.x-panel-fbar) {
      background: transparent !important;
    }
    html[data-dsm-local-theme="graphite"] .x-window :is(.x-form-display-field,.x-fieldset-header-text) {
      color: var(--dsm-theme-ink) !important;
    }
    html[data-dsm-local-theme] .x-window .x-window-header,
    html[data-dsm-local-theme] .v-window .v-window-header-wrapper {
      background: linear-gradient(to bottom, color-mix(in srgb,var(--control-fill) 74%,transparent), transparent) !important;
      box-shadow: inset 0 -1px var(--rule) !important;
    }
    html[data-dsm-local-theme] :is(.x-window-header-text,.app-window-header-title) {
      font-weight: 600; text-shadow: none !important;
    }
    html[data-dsm-local-theme] .syno-ux-button:is(.syno-ux-button-grey,.syno-ux-button-blue) {
      border-radius: 10px !important; background: var(--control-fill) !important;
      color: var(--dsm-theme-ink) !important; box-shadow: inset 0 0 0 1px var(--rule) !important;
    }
    html[data-dsm-local-theme] .syno-ux-button.syno-ux-button-blue {
      background: var(--control-accent) !important; color: #fff !important;
    }
    html[data-dsm-local-theme] .syno-ux-button:is(.syno-ux-button-grey,.syno-ux-button-blue) button { color: inherit !important; }
    html[data-dsm-local-theme] .syno-ux-button:not(.x-item-disabled):hover { filter: brightness(1.08); }
    html[data-dsm-local-theme] .syno-ux-button:has(button:focus-visible) { outline: 2px solid var(--control-line); outline-offset: 2px; }
    html[data-dsm-local-theme] .syno-ux-button:is(.x-item-disabled,:has(button:disabled)) { opacity: .58; filter: none; }
    html[data-dsm-local-theme] input[type=checkbox] + div.syno-ux-checkbox-icon {
      box-sizing: border-box; border: 1.5px solid var(--control-line); border-radius: 5px;
      background: var(--control-fill) !important; position: relative;
    }
    html[data-dsm-local-theme] input:is(:checked,:indeterminate) + div.syno-ux-checkbox-icon {
      background: var(--control-accent) !important; border-color: var(--control-accent);
    }
    html[data-dsm-local-theme] input:checked + div.syno-ux-checkbox-icon::after {
      content: ""; position: absolute; left: 32%; top: 9%; width: 25%; height: 56%;
      border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
    }
    html[data-dsm-local-theme] input:indeterminate + div.syno-ux-checkbox-icon::after {
      content: ""; position: absolute; inset: 44% 20% auto; height: 2px; background: white; border: 0; transform: none;
    }
    html[data-dsm-local-theme] input:disabled + div.syno-ux-checkbox-icon { opacity: .5; }
    html[data-dsm-local-theme] input:focus-visible + div.syno-ux-checkbox-icon { outline: 2px solid var(--control-line); outline-offset: 2px; }
    html[data-dsm-local-theme] :is(.x-menu .x-menu-sep,.x-window .x-fieldset-header,.x-window .x-grid-group-hd) {
      border-color: var(--rule) !important; box-shadow: none !important;
    }
    html[data-dsm-local-theme] .x-menu .x-menu-sep { height: 1px; background: var(--rule) !important; border: 0 !important; }
    html[data-dsm-local-theme] .synopkg-window :is(.syno-pkglist-list,.syno-pkglist-card,.syno-pkglist-related-card) {
      outline: none !important;
    }
    html[data-dsm-local-theme] .synopkg-window :is(.syno-pkglist-list,.syno-pkglist-card,.syno-pkglist-related-card):focus-visible {
      outline: 2px solid var(--control-line) !important;
      outline-offset: -2px;
    }
    html[data-dsm-local-theme] .syno-pkg-term-field .syno-pkg-term-content {
      background: color-mix(in srgb, var(--control-fill) 94%, transparent) !important;
      color: var(--dsm-theme-ink) !important;
      border-color: transparent !important;
      border-radius: 12px;
      overflow: hidden;
    }
    html[data-dsm-local-theme] .syno-pkg-term-field .syno-pkg-term-content-inner {
      background: transparent !important;
      color: var(--dsm-theme-ink) !important;
      line-height: 1.55;
    }
    html[data-dsm-local-theme] .syno-pkg-term-field :is(.syno-pkg-term-title,.syno-pkg-term-subtitle,h1,h2,h3,h4,h5,h6,p,li,strong,label) {
      color: var(--dsm-theme-ink) !important;
    }
    html[data-dsm-local-theme] .syno-pkg-term-content a {
      color: var(--dsm-reading-link, #185ba7) !important;
      text-decoration: underline;
    }
    html[data-dsm-local-theme="graphite"] .syno-pkg-term-field { --dsm-reading-link: #a5caff; }
    @media (prefers-reduced-transparency: reduce) {
      html[data-dsm-local-theme] :is(.taskbar-wrapper, .sds-taskbar, ${windowSurfaces}, ${menuSurfaces}) {
        backdrop-filter: none;
        background-color: color-mix(in srgb, var(--dsm-theme-surface) 30%, Canvas) !important;
      }
    }
  `;
  (document.head || root).append(styles);

  let activeMode;
  function readMode() {
    try {
      const mode = JSON.parse(localStorage.getItem(preferencesKey))?.theme;
      if (Object.prototype.hasOwnProperty.call(themes, mode)) return mode;
    } catch {
      // Storage may be unavailable in private browsing.
    }
    return "auto";
  }

  let lensBezel;
  function prepareLens(bezel) {
    if (!chromium || lensBezel === bezel) return;
    const map = document.createElement("canvas");
    map.width = 128;
    map.height = 64;
    const ctx = map.getContext("2d");
    if (!ctx) return;
    const pixels = ctx.createImageData(map.width, map.height);
    const edge = (position) => {
      const rim = Math.max(0, 1 - Math.min(position, 1 - position) / (bezel / 100));
      return (position < 0.5 ? 1 : -1) * Math.sin(rim * Math.PI * 0.9) * 118;
    };
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const index = 4 * (y * map.width + x);
        pixels.data[index] = 128 + edge(x / (map.width - 1));
        pixels.data[index + 1] = 128 + edge(y / (map.height - 1));
        pixels.data[index + 3] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    const image = document.querySelector(`#${lensId} feImage`);
    lensBezel = bezel;
    if (image) {
      image.setAttribute("href", map.toDataURL());
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    wrapper.setAttribute("aria-hidden", "true");
    const channels = ["red", "green", "blue"];
    const channelFilters = channels.map((channel, i) => {
      const matrix = Array(20).fill(0);
      matrix[6 * i] = matrix[18] = 1;
      return `<feDisplacementMap in="SourceGraphic" in2="rim" scale="0" xChannelSelector="R" yChannelSelector="G"/>
        <feColorMatrix type="matrix" values="${matrix.join(" ")}" result="${channel}"/>`;
    }).join("");
    wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><filter id="${lensId}" x="0" y="0" width="100%" height="100%" primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB"><feImage href="${map.toDataURL()}" x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="rim"/>${channelFilters}<feBlend in="red" in2="green" mode="screen" result="rg"/><feBlend in="rg" in2="blue" mode="screen"/></filter></svg>`;
    document.body.append(wrapper);
  }

  function installWallpaperFilter() {
    const map = document.createElement("canvas");
    map.width = map.height = 256;
    const ctx = map.getContext("2d");
    if (!ctx) return;
    const pixels = ctx.createImageData(map.width, map.height);
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const dx = 2 * x / (map.width - 1) - 1;
        const dy = 2 * y / (map.height - 1) - 1;
        const radius = Math.hypot(dx, dy);
        const outer = (radius - .67) / .09;
        const inner = (radius - .43) / .10;
        const taper = Math.max(0, Math.min(1, (1 - radius) / .14, radius / .18));
        const force = taper * (125 * outer * Math.exp(-.5 * outer * outer) + 54 * inner * Math.exp(-.5 * inner * inner));
        const index = 4 * (y * map.width + x);
        pixels.data[index] = 128 + force * dx / (radius || 1);
        pixels.data[index + 1] = 128 + force * dy / (radius || 1);
        pixels.data[index + 3] = 255;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    const defs = document.createElement("div");
    defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    defs.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true">
      <filter id="${waterId}" x="-3%" y="-3%" width="106%" height="106%" primitiveUnits="objectBoundingBox"
        color-interpolation-filters="sRGB">
        <feFlood flood-color="#808000" result="flat"/>
        <feImage href="${map.toDataURL()}" x=".56" y=".48" width=".08" height=".08" result="rings">
          <animate attributeName="x" values=".56;-.18;-.18" dur="14s" repeatCount="indefinite" keyTimes="0;.74;1"/>
          <animate attributeName="y" values=".48;-.26;-.26" dur="14s" repeatCount="indefinite" keyTimes="0;.74;1"/>
          <animate attributeName="width" values=".08;1.56;1.56" dur="14s" repeatCount="indefinite" keyTimes="0;.74;1"/>
          <animate attributeName="height" values=".08;1.56;1.56" dur="14s" repeatCount="indefinite" keyTimes="0;.74;1"/>
        </feImage>
        <feMerge result="waves"><feMergeNode in="flat"/><feMergeNode in="rings"/></feMerge>
        <feDisplacementMap in="SourceGraphic" in2="waves" scale="0" xChannelSelector="R" yChannelSelector="G">
          <animate attributeName="scale" values="0;.041;.025;0;0" dur="14s" repeatCount="indefinite"
            calcMode="spline" keyTimes="0;.08;.48;.74;1" keySplines=".24 0 .43 1;.33 0 .67 1;.33 0 .67 1;0 0 1 1"/>
        </feDisplacementMap>
      </filter>
    </svg>`;
    document.body.append(defs);
  }

  let wallpaper;
  const wallpaperChanges = new MutationObserver(syncWallpaperSource);

  function syncWallpaperSource() {
    const current = document.getElementById("sds-wallpaper");
    if (wallpaper !== current) {
      wallpaperChanges.disconnect();
      wallpaper = current;
      if (wallpaper) wallpaperChanges.observe(wallpaper, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
    }
    if (!wallpaper) return;
    const source = wallpaper.querySelector("img[src]")?.getAttribute("src");
    const nativeImage = source && !/\/s\.gif(?:[?#]|$)/i.test(source);
    const background = getComputedStyle(root);
    const properties = {
      image: nativeImage || getComputedStyle(wallpaper).backgroundImage !== "none" ? "none" : background.backgroundImage,
      size: background.backgroundSize,
      position: background.backgroundPosition,
      repeat: background.backgroundRepeat,
    };
    for (const [key, value] of Object.entries(properties)) {
      const name = `--dsm-wallpaper-${key}`;
      if (wallpaper.style.getPropertyValue(name) !== value) wallpaper.style.setProperty(name, value);
    }
  }

  function applyMode(mode) {
    activeMode = mode;
    const theme = mode === "auto" ? (systemAppearance.matches ? "graphite" : "frost") : mode;
    root.dataset.dsmLocalTheme = theme;
    prepareLens(13);
    const channels = document.querySelectorAll(`#${lensId} feDisplacementMap`);
    const strength = theme === "graphite" ? 16 : 20;
    channels.forEach((channel, index) => channel.setAttribute("scale", String((strength + 1 - index) / 250)));
    root.style.setProperty("--dsm-theme-filter", channels.length ? `url(#${lensId})` : "blur(0px)");
  }

  function openSettings() {
    const previousDialog = document.getElementById(dialogId);
    if (previousDialog?.open) return;
    const saved = activeMode;
    const dialog = document.createElement("dialog");
    dialog.id = dialogId;
    dialog.setAttribute("aria-labelledby", "dsm-local-theme-title");
    dialog.innerHTML = `
      <form>
        <h1 id="dsm-local-theme-title">Темы</h1>
        <p>«Авто» следует светлому или тёмному режиму устройства.</p>
        <fieldset aria-label="Тема"></fieldset>
        <div class="dsm-theme-actions">
          <button type="button">Отмена</button>
          <button type="submit">Сохранить</button>
        </div>
      </form>`;
    const form = dialog.querySelector("form");
    const choices = form.querySelector("fieldset");
    let submitted = false;

    for (const [id, title] of Object.entries(themes)) {
      const label = document.createElement("label");
      label.className = "dsm-theme-choice";
      label.dataset.preset = id;
      const sample = document.createElement("span");
      sample.className = "dsm-theme-sample";
      sample.setAttribute("aria-hidden", "true");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "theme";
      input.value = id;
      input.checked = saved === id;
      label.append(input, sample, title);
      choices.append(label);
    }

    function preview() {
      const mode = form.elements.namedItem("theme").value;
      applyMode(mode);
      return mode;
    }

    form.addEventListener("input", preview);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const mode = preview();
      try {
        localStorage.setItem(preferencesKey, JSON.stringify({ theme: mode }));
      } catch {
        // The selected appearance remains active for this page.
      }
      submitted = true;
      dialog.close();
    });
    form.querySelector('button[type="button"]').addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      if (!submitted) applyMode(saved);
      dialog.remove();
    });
    document.body.append(dialog);
    preview();
    dialog.showModal();
  }

  function createSettingsEntry() {
    const entry = document.createElement("button");
    entry.type = "button";
    entry.className = entryClass;
    entry.textContent = "Темы";
    entry.setAttribute("aria-haspopup", "dialog");
    entry.addEventListener("pointerdown", (event) => event.stopPropagation());
    entry.addEventListener("click", (event) => {
      event.stopPropagation();
      openSettings();
    });
    return entry;
  }

  function addSettingsEntries() {
    for (const panel of document.querySelectorAll(".syno-app-admin-center")) {
      for (const system of panel.querySelectorAll('.v-module-list [role="group"], .v-fieldset[role="group"]')) {
        if (!/^(?:Система|System)$/iu.test(system.getAttribute("aria-label"))) continue;
        const options = system.querySelector(".module-options, .module-items-wrapper");
        if (!options || options.querySelector(`.${entryClass}`)) continue;
        const entry = createSettingsEntry();
        if (options.classList.contains("module-items-wrapper")) {
          entry.classList.add("module-item", "dsm-local-theme-tile");
          entry.innerHTML = '<span class="module-item-icon" aria-hidden="true">◈</span><span class="module-item-title">Темы</span>';
          options.append(entry);
          continue;
        }
        const row = document.createElement("div");
        row.className = "module-item-wrapper module-item-option-wrapper dsm-local-theme-module";
        entry.classList.add("module-item-option", "module-item-option-normal");
        entry.setAttribute("role", "menuitem");
        entry.innerHTML = '<i aria-hidden="true" class="module-item-icon v-icon v-icon-size-normal">◈</i><span class="module-item-text">Темы</span>';
        row.append(entry);
        options.append(row);
      }
    }
  }

  window.addEventListener("storage", (event) => {
    if (event.key === preferencesKey) applyMode(readMode());
  });
  systemAppearance.addEventListener("change", () => {
    if (activeMode === "auto") applyMode("auto");
  });

  let queued = false;
  function queueSettingsScan() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      addSettingsEntries();
      syncWallpaperSource();
    });
  }

  function start() {
    installWallpaperFilter();
    applyMode(readMode());
    addSettingsEntries();
    syncWallpaperSource();
    new MutationObserver(syncWallpaperSource).observe(root, { attributes: true, attributeFilter: ["style", "class"] });
    new MutationObserver(queueSettingsScan).observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
