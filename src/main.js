import { qs } from "./util/dom.js";
import { createSlideshow } from "./components/slideshow.js";
import { isTtsOn, setTtsOn } from "./components/speech.js";
import { createScanner } from "./components/scanner.js";
import { createTutorialSelect } from "./components/tutorialSelect.js";
import { ALL_STEPS } from "./data/steps.js";
import { ALL_STEPS_L3 } from "./data/stepsLayer3.js";
import { clearProgress } from "./components/progress.js";

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
  // cubing/search WASM 솔버를 미리 로드 — 스캔 후 3D 변환 시 초기화 지연 방지
  import("cubing/search").catch(() => {});
}

function init() {
  const slideshowRoot = qs("#slideshow-root");
  const slideshowDaisy = createSlideshow(slideshowRoot, ALL_STEPS);
  const slideshowLayer3 = createSlideshow(slideshowRoot, ALL_STEPS_L3);

  const tutorialSelect = createTutorialSelect({
    onDaisyFresh: () => {
      clearProgress();
      slideshowDaisy.open();
    },
    onDaisyContinue: () => {
      slideshowDaisy.open();
    },
    onLayer3: () => {
      slideshowLayer3.open();
    },
  });

  const startBtn = qs("#start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      tutorialSelect.open();
    });
  }

  const scanner = createScanner({
    onJumpToStep: (stepNo) => {
      // step1~7 → daisy 슬라이드쇼에서 인트로 3개 다음부터
      slideshowDaisy.open();
      // 인트로 3개 이후가 step1 → 인덱스 = 3 + stepNo - 1
      setTimeout(() => slideshowDaisy.go(2 + stepNo), 80);
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
