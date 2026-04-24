import { el } from "../util/dom.js";
import { ALL_STEPS, INTRO_STEPS, MAIN_STEPS } from "../data/steps.js";
import { renderStepSlide } from "./stepCard.js";
import {
  renderMeetSlide,
  renderColorsSlide,
  renderSymbolsSlide,
} from "./introSections.js";
import { isDone, onProgressChange } from "./progress.js";
import { isTtsOn, setTtsOn, stopSpeaking } from "./speech.js";

const INTRO_RENDERERS = {
  meet: renderMeetSlide,
  colors: renderColorsSlide,
  symbols: renderSymbolsSlide,
};

export function createSlideshow(mountRoot) {
  const container = el("div", { class: "slideshow", hidden: true, "aria-modal": "true", role: "dialog" });

  const dots = el("div", { class: "ss-dots" });
  const ttsLabel = el("label", {}, []);
  const ttsBox = el("input", { type: "checkbox" });
  ttsBox.checked = isTtsOn();
  ttsBox.addEventListener("change", () => setTtsOn(ttsBox.checked));
  ttsLabel.appendChild(ttsBox);
  ttsLabel.appendChild(document.createTextNode("🔊 음성"));
  const closeBtn = el("button", {
    class: "ss-close",
    type: "button",
    "aria-label": "닫기",
    text: "×",
    onClick: () => close(),
  });
  const top = el("div", { class: "ss-top" }, [
    dots,
    el("div", { class: "ss-tools" }, [ttsLabel, closeBtn]),
  ]);

  const track = el("div", { class: "ss-track" });
  const main = el("div", { class: "ss-main" }, [track]);

  const prevBtn = el("button", {
    class: "ss-nav-btn ghost",
    type: "button",
    text: "◀ 이전",
    onClick: () => go(currentIndex - 1),
  });
  const nextBtn = el("button", {
    class: "ss-nav-btn",
    type: "button",
    text: "다음 ▶",
    onClick: () => go(currentIndex + 1),
  });
  const counter = el("span", { class: "ss-counter" });
  const bottom = el("div", { class: "ss-bottom" }, [prevBtn, counter, nextBtn]);

  container.appendChild(top);
  container.appendChild(main);
  container.appendChild(bottom);
  mountRoot.appendChild(container);

  // Build all slide shells upfront; render inner content lazily per slide.
  const slides = ALL_STEPS.map((s) => {
    const slideEl = el("section", { class: "ss-slide", "data-step-id": s.id });
    track.appendChild(slideEl);
    return { data: s, el: slideEl, rendered: false, player: null };
  });

  // Build dots
  slides.forEach((s, idx) => {
    const dot = el("button", {
      class: "ss-dot",
      type: "button",
      "aria-label": `${idx + 1}번 슬라이드로 이동`,
      onClick: () => go(idx),
    });
    dot.dataset.index = idx;
    dots.appendChild(dot);
  });

  let currentIndex = 0;

  function renderSlide(idx) {
    const slot = slides[idx];
    if (!slot || slot.rendered) return;
    const data = slot.data;
    let rendered;
    if (data.kind === "intro") {
      const r = INTRO_RENDERERS[data.id];
      if (r) rendered = r(data);
    } else {
      rendered = renderStepSlide(data, { onComplete: () => go(idx + 1) });
    }
    if (rendered) {
      slot.el.appendChild(rendered.element);
      slot.player = rendered.player;
      slot.rendered = true;
    }
  }

  function pauseAllPlayers(exceptIdx = -1) {
    slides.forEach((s, i) => {
      if (i === exceptIdx) return;
      try {
        s.player?.pause?.();
      } catch {}
    });
  }

  function updateDots() {
    const progress = { ...localProgress() };
    const dotsArr = Array.from(dots.children);
    dotsArr.forEach((d, i) => {
      d.classList.toggle("is-current", i === currentIndex);
      d.classList.toggle("is-done", !!progress[slides[i].data.id]);
    });
  }

  function localProgress() {
    try {
      return JSON.parse(localStorage.getItem("cubeGuide.progress.v1") || "{}");
    } catch {
      return {};
    }
  }

  function updateNav() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === slides.length - 1;
    counter.textContent = `${currentIndex + 1} / ${slides.length}`;
  }

  function go(idx) {
    if (idx < 0 || idx >= slides.length) return;
    currentIndex = idx;
    // Lazy render target ±1.
    renderSlide(idx);
    renderSlide(idx + 1);
    renderSlide(idx - 1);
    track.style.transform = `translateX(-${idx * 100}%)`;
    pauseAllPlayers(idx);
    stopSpeaking();
    updateDots();
    updateNav();
  }

  function open() {
    container.hidden = false;
    document.body.style.overflow = "hidden";
    renderSlide(0);
    renderSlide(1);
    go(0);
    // Focus the Next button for keyboard users.
    setTimeout(() => nextBtn.focus(), 50);
  }

  function close() {
    container.hidden = true;
    document.body.style.overflow = "";
    pauseAllPlayers();
    stopSpeaking();
  }

  // Keyboard navigation
  container.addEventListener("keydown", (e) => {
    if (container.hidden) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(currentIndex + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(currentIndex - 1); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  });
  container.tabIndex = -1;

  // Touch swipe
  let touchStartX = 0;
  let touchStartY = 0;
  track.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      go(currentIndex + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  // Update dots when progress changes elsewhere.
  onProgressChange(updateDots);

  return { open, close, go };
}
