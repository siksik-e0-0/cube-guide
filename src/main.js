import { qs } from "./util/dom.js";
import { INTRO_STEPS, MAIN_STEPS } from "./data/steps.js";
import { renderStepSection } from "./components/stepCard.js";
import {
  renderMeetSection,
  renderColorsSection,
  renderSymbolsSection,
} from "./components/introSections.js";
import { renderNav } from "./components/nav.js";
import { isTtsOn, setTtsOn } from "./components/speech.js";

function mountSections() {
  const mount = qs("#sections-mount");
  const introRenderers = {
    meet: renderMeetSection,
    colors: renderColorsSection,
    symbols: renderSymbolsSection,
  };
  INTRO_STEPS.forEach((s) => {
    const r = introRenderers[s.id];
    if (r) mount.appendChild(r(s));
  });
  MAIN_STEPS.forEach((s) => mount.appendChild(renderStepSection(s)));
}

function mountNav() {
  const nav = renderNav();
  qs("#nav-mount").replaceWith(nav);
  requestAnimationFrame(() => nav.observeSections());
}

function wireTtsToggle() {
  const box = qs("#tts-toggle");
  if (!box) return;
  box.checked = isTtsOn();
  box.addEventListener("change", () => setTtsOn(box.checked));
}

async function loadCubing() {
  // cubing/twisty is heavy; defer until idle so first paint is fast.
  const run = () =>
    import("cubing/twisty").catch((err) => {
      console.error("cubing/twisty 로드 실패", err);
    });
  if ("requestIdleCallback" in window) {
    requestIdleCallback(run, { timeout: 1500 });
  } else {
    setTimeout(run, 200);
  }
}

function init() {
  mountSections();
  mountNav();
  wireTtsToggle();
  loadCubing();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
