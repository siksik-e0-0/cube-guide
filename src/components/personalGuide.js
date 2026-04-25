import { el } from "../util/dom.js";
import { MAIN_STEPS } from "../data/steps.js";
import { generateStepGuide } from "../lib/lblGuide.js";
import { getStepStateText } from "../lib/lblAnalyzer.js";
import { getScrambleAlg } from "../lib/cubeConverter.js";

function stepData(step) {
  return MAIN_STEPS.find(s => s.no === step) ?? null;
}

function playerEl(setupAlg, alg) {
  const attrs = {
    puzzle: "3x3x3",
    "control-panel": "none",
    "hint-facelets": "none",
    "tempo-scale": "0.5",
    background: "none",
    visualization: "3D",
    alg: alg || "",
  };
  if (setupAlg) attrs["experimental-setup-alg"] = setupAlg;
  return el("twisty-player", attrs);
}

function guideBlock(guide, stateText) {
  if (!guide && !stateText) return null;
  const box = el("div", { class: "pg-guide-box" });
  if (stateText) box.appendChild(el("div", { class: "pg-state-text", text: stateText }));
  if (guide && !guide.done) {
    if (guide.orient) {
      box.appendChild(el("div", { class: "pg-guide-row" }, [
        el("span", { class: "pg-guide-label", text: "잡는 방법" }),
        el("span", { text: guide.orient }),
      ]));
    }
    if (guide.algorithm) {
      box.appendChild(el("div", { class: "pg-guide-row" }, [
        el("span", { class: "pg-guide-label", text: "알고리즘" }),
        el("code", { class: "pg-alg", text: guide.algorithm }),
      ]));
    }
    if (guide.note) {
      box.appendChild(el("div", { class: "pg-note", text: guide.note }));
    }
  }
  return box;
}

export function createPersonalGuide({ faces, startStep, onJumpToStep }) {
  const overlay = el("div", { class: "pg-overlay" });
  overlay.hidden = true;
  document.body.appendChild(overlay);

  const modal = el("div", { class: "pg-modal" });
  overlay.appendChild(modal);

  let scrambleAlg = null;
  let currentStep = startStep;

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  function renderStep(step) {
    modal.innerHTML = "";
    const data = stepData(step);
    if (!data) { renderComplete(); return; }

    const guide = generateStepGuide(step, faces);
    const stateText = getStepStateText(step, faces);

    // 헤더
    const hdr = el("div", { class: "pg-header" });
    hdr.appendChild(el("span", { class: "pg-progress", text: `${step} / 7 단계` }));
    hdr.appendChild(el("button", { class: "pg-close", type: "button", text: "✕", onClick: () => close() }));
    modal.appendChild(hdr);

    // 단계 제목 + 3D 상태 배지
    const titleRow = el("div", { class: "pg-title-row" });
    titleRow.appendChild(el("h2", { class: "pg-title", text: data.title }));
    const isMyState = step === startStep && !!scrambleAlg;
    titleRow.appendChild(el("span", {
      class: isMyState ? "pg-badge pg-badge-my" : "pg-badge pg-badge-std",
      text: isMyState ? "내 큐브 3D" : "표준 3D",
      title: isMyState ? "실제 큐브 상태를 표시합니다" : "3D 변환에 실패해 표준 상태를 표시합니다. 스캔 화면에서 스티커를 수정해주세요.",
    }));
    modal.appendChild(titleRow);

    if (step === startStep && !scrambleAlg) {
      modal.appendChild(el("div", { class: "pg-convert-warn",
        text: "⚠️ 큐브 3D 변환에 실패했어요. 잘못 인식된 스티커가 있을 수 있어요." }));
    }

    // twisty-player: 첫 단계는 사용자 실제 큐브 (scrambleAlg), 이후는 표준 setupAlg
    const setup = isMyState ? scrambleAlg : (data.setupAlg || "");
    const alg   = guide?.algorithm || data.algorithm || data.demoAlg || "";
    const wrap = el("div", { class: "pg-player-wrap" });
    wrap.appendChild(el("div", { class: "pg-player-loading", text: "큐브 준비 중..." }));
    const player = playerEl(setup, alg);
    wrap.appendChild(player);
    modal.appendChild(wrap);

    // 재생 버튼
    if (alg) {
      const playBtn = el("button", { class: "btn btn-yellow btn-lg pg-play", type: "button", text: "▶ 재생" });
      playBtn.addEventListener("click", () => {
        customElements.whenDefined("twisty-player").then(() => {
          try { player.timestamp = 0; player.play(); } catch {}
        });
      });
      modal.appendChild(playBtn);
    }

    // 가이드 텍스트
    const gBox = guideBlock(guide, stateText);
    if (gBox) modal.appendChild(gBox);

    // 다음 단계 버튼
    const isLast = step >= 7;
    const nextBtn = el("button", {
      class: "btn btn-primary btn-lg pg-next",
      type: "button",
      text: isLast ? "🎉 큐브 완성!" : `${step}단계 완료 → ${step + 1}단계`,
      onClick: () => isLast ? renderComplete() : renderStep(step + 1),
    });
    modal.appendChild(nextBtn);

    // 튜토리얼 바로가기 (슬라이드쇼 연결)
    const toSlide = el("button", {
      class: "btn btn-ghost pg-slide-btn",
      type: "button",
      text: "전체 튜토리얼 보기",
      onClick: () => { close(); onJumpToStep?.(step); },
    });
    modal.appendChild(toSlide);
  }

  function renderComplete() {
    modal.innerHTML = "";
    const hdr = el("div", { class: "pg-header" });
    hdr.appendChild(el("span", { class: "pg-progress", text: "완성!" }));
    hdr.appendChild(el("button", { class: "pg-close", type: "button", text: "✕", onClick: () => close() }));
    modal.appendChild(hdr);
    modal.appendChild(el("div", { class: "pg-complete" }, [
      el("div", { class: "pg-complete-icon", text: "🎉" }),
      el("div", { class: "pg-complete-msg", text: "큐브가 완성됐어요!" }),
      el("button", { class: "btn btn-primary btn-lg", type: "button", text: "닫기", onClick: () => close() }),
    ]));
  }

  return {
    async open() {
      currentStep = startStep;
      overlay.hidden = false;
      document.body.style.overflow = "hidden";

      // 로딩 표시
      modal.innerHTML = "";
      modal.appendChild(el("div", { class: "pg-loading", text: "큐브 상태 분석 중..." }));

      // 스크램블 알고리즘 계산 (솔버 비동기)
      scrambleAlg = await getScrambleAlg(faces);

      renderStep(currentStep);
    },
    close,
  };
}
