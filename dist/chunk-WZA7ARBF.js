import {
  zIndex
} from "./chunk-WBGATSQU.js";

// src/core/layer.ts
var hosts = /* @__PURE__ */ new WeakMap();
function getLayer(position, host = document.body, z = zIndex.floating) {
  let byKey = hosts.get(host);
  if (!byKey) hosts.set(host, byKey = /* @__PURE__ */ new Map());
  const key = `${position}:${z}`;
  const cached = byKey.get(key);
  if (cached?.isConnected) return cached;
  const el = document.createElement("div");
  el.className = `fdk-layer fdk-layer--${position}`;
  el.style.setProperty("--fdk-z", String(z));
  if (host !== document.body) {
    el.classList.add("fdk-layer--scoped");
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
  }
  host.appendChild(el);
  byKey.set(key, el);
  return el;
}

export {
  getLayer
};
