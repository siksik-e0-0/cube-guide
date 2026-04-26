import { el } from "../util/dom.js";
import { MAIN_STEPS } from "../data/steps.js";
import { generateStepGuide } from "../lib/lblGuide.js";
import { getStepStateText } from "../lib/lblAnalyzer.js";
import { getScrambleAlg } from "../lib/cubeConverter.js";
import { getFaceHex, getFaceKo, FACE_ORDER } from "../lib/cubeState.js";

// 스캔 faces 데이터를 2D 십자 레이아웃으로 렌더링 (3D 변환 실패 시 대체 표시)
// editable=true 시 셀 탭으로 색상 순환 수정 가능
function buildFaceCross(faces, { editable = false, onChange } = {}) {
  const cross = el("div", { class: "pg-face-cross" });
  const order = ["U", "L", "F", "R", "B", "D"];
  for (const face of order) {
    const wrap = el("div", { class: `pg-cross-face pg-cross-${face.toLowerCase()}` });
    const grid = el("div", { class: "pg-cross-grid" });
    (faces[face] || []).forEach((code, idx) => {
      const cell = el("div", {
        class: "pg-cross-cell",
        style: `background:${getFaceHex(code)}`,
        title: getFaceKo(code),
      });
      if (editable) {
        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => {
          // faces[face][idx]로 현재값 읽기 — 초기값만 캡처된 code 대신 최신값 사용
          const next = FACE_ORDER[(FACE_ORDER.indexOf(faces[face][idx]) + 1) % FACE_ORDER.length];
          faces[face][idx] = next;
          cell.style.background = getFaceHex(next);
          cell.title = getFaceKo(next);
          onChange?.();
        });
      }
      grid.appendChild(cell);
    });
    wrap.appendChild(grid);
    wrap.appendChild(el("div", { class: "pg-cross-label", text: face }));
    cross.appendChild(wrap);
  }
  return cross;
}

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

    // 첫 단계 & 변환 실패 → 편집 가능한 2D 그리드 + 다시 3D 생성 버튼
    if (step === startStep && !scrambleAlg) {
      const warnEl = el("div", { class: "pg-convert-warn",
        text: "⚠️ 3D 변환 실패 — 아래 색상을 실제 큐브와 맞게 수정하고 다시 시도해보세요." });
      modal.appendChild(warnEl);

      // 편집용 독립 복사본 (faces를 직접 변경하지 않음)
      const editFaces = {};
      for (const f of FACE_ORDER) editFaces[f] = [...(faces[f] || Array(9).fill(f))];

      modal.appendChild(buildFaceCross(editFaces, { editable: true }));

      const retryBtn = el("button", {
        class: "btn btn-primary pg-retry",
        type: "button",
        text: "🔄 다시 3D 생성",
        onClick: async () => {
          retryBtn.disabled = true;
          retryBtn.textContent = "분석 중...";
          const alg = await getScrambleAlg(editFaces);
          if (alg) {
            // 성공: faces 업데이트 → scrambleAlg 갱신 → renderStep 재호출
            for (const f of FACE_ORDER) faces[f] = [...editFaces[f]];
            scrambleAlg = alg;
            renderStep(step);
          } else {
            retryBtn.disabled = false;
            retryBtn.textContent = "🔄 다시 3D 생성";
            warnEl.textContent = "⚠️ 여전히 3D 변환 실패 — 잘못된 스티커를 더 수정해보세요.";
          }
        },
      });
      modal.appendChild(retryBtn);
    }

    // twisty-player: 첫 단계 & 변환 성공 = 실제 큐브, 나머지 = 표준 setupAlg
    const setup = isMyState ? scrambleAlg : (data.setupAlg || "");
    const alg   = guide?.algorithm || data.algorithm || data.demoAlg || "";
    const wrap = el("div", { class: "pg-player-wrap" });
    wrap.appendChild(el("div", { class: "pg-player-loading", text: "큐브 준비 중..." }));
    const player = playerEl(setup, alg);
    wrap.appendChild(player);
    if (step === startStep && !scrambleAlg) {
      // 변환 실패: 3D는 알고리즘 애니메이션 전용으로 작게 표시
      wrap.style.aspectRatio = "3/2";
      wrap.style.minHeight = "140px";
      wrap.appendChild(el("div", { class: "pg-player-label", text: "알고리즘 애니메이션 (표준 예시)" }));
    }
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

    // 이전 / 다음 네비게이션
    const isFirst = step <= startStep;
    const isLast  = step >= 7;
    const nav = el("div", { class: "pg-nav" });

    const prevBtn = el("button", {
      class: "btn btn-ghost pg-nav-btn",
      type: "button",
      text: "◀ 이전",
      onClick: () => renderStep(step - 1),
    });
    if (isFirst) { prevBtn.disabled = true; prevBtn.style.opacity = "0.3"; }
    nav.appendChild(prevBtn);

    const nextBtn = el("button", {
      class: `btn btn-primary pg-nav-btn${isLast ? " pg-nav-complete" : ""}`,
      type: "button",
      text: isLast ? "🎉 완성!" : "다음 ▶",
      onClick: () => isLast ? renderComplete() : renderStep(step + 1),
    });
    nav.appendChild(nextBtn);
    modal.appendChild(nav);

    // 튜토리얼 바로가기
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
      modal.appendChild(el("div", { class: "pg-loading", text: "큐브 상태 분석 중... (최대 30초 소요)" }));

      // 스크램블 알고리즘 계산 (솔버 비동기, 모바일 WASM 초기화에 시간이 걸릴 수 있음)
      scrambleAlg = await getScrambleAlg(faces);

      renderStep(currentStep);
    },
    close,
  };
}
