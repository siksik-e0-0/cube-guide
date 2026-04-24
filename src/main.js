import { qs } from "./util/dom.js";
import { createSlideshow } from "./components/slideshow.js";
import { isTtsOn, setTtsOn } from "./components/speech.js";
import { createScanner } from "./components/scanner.js";

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
  const slideshowRoot = qs("#slideshow-root");
  const slideshow = createSlideshow(slideshowRoot);

  const startBtn = qs("#start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      slideshow.open();
    });
  }

  const scanner = createScanner({
    onJumpToStep: (stepNo) => {
      // step1~7 → ALL_STEPS 에서 인트로 3개 다음부터
      slideshow.open();
      // 인트로 3개 이후가 step1 → 인덱스 = 3 + stepNo - 1
      setTimeout(() => slideshow.go(2 + stepNo), 80);
    },
  });

  const scanBtn = qs("#scan-btn");
  if (scanBtn) {
    scanBtn.addEventListener("click", (e) => {
      e.preventDefault();
      scanner.open();
    });
  }

  wireTtsToggle();
  loadCubing();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
