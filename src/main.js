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
  // twisty-player 커스텀 엘리먼트 등록을 기다리지 않으면 play() 가 실패하므로
  // idle 지연 없이 즉시 로드한다. 번들은 dynamic import 로 분리 유지.
  import("cubing/twisty").catch((err) => {
    console.error("cubing/twisty 로드 실패", err);
  });
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

  const verEl = qs("#app-version");
  if (verEl) verEl.textContent = `빌드 ${__BUILD_HASH__} · ${__BUILD_TIME__}`;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
