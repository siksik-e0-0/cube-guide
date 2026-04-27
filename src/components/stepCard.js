import { el } from "../util/dom.js";
import { isDone, setDone, onProgressChange } from "./progress.js";
import { speak } from "./speech.js";

function mascot(text) {
  return el("div", { class: "mascot" }, [
    el("div", { class: "avatar", text: "큐" }),
    el("div", { class: "bubble", text }),
  ]);
}

// setupAlg 만 사용한다. displayRotation 을 붙이면 3D 큐브에서
// F/B 면이 뒤바뀌어 이동 카드(F=초록)와 색이 맞지 않는다.
function buildSetupAlg(data) {
  return (data.setupAlg || "").trim();
}

function playerBlock(data) {
  const wrap = el("div", { class: "player-wrap" });
  wrap.appendChild(el("div", { class: "player-loading", text: "큐브 준비 중..." }));
  const setupAlg = buildSetupAlg(data);
  const attrs = {
    puzzle: "3x3x3",
    "control-panel": "bottom-row",
    "hint-facelets": "none",
    "tempo-scale": "0.5",
    background: "none",
    visualization: "3D",
    alg: data.algorithm || data.demoAlg || "",
  };
  if (setupAlg) attrs["experimental-setup-alg"] = setupAlg;
  const player = el("twisty-player", attrs);
  wrap.appendChild(player);
  return { wrap, player };
}

function playerControls(player) {
  const row = el("div", { class: "player-controls" });
  const playBtn = el("button", {
    class: "btn btn-lg btn-yellow",
    type: "button",
    text: "돌려보기 ▶",
    onClick: () => {
      // twisty-player 커스텀 엘리먼트가 등록된 뒤에만 play() 호출
      customElements.whenDefined("twisty-player").then(() => {
        try { player.timestamp = 0; player.play(); } catch {}
      });
    },
  });
  const resetBtn = el("button", {
    class: "btn btn-lg btn-ghost",
    type: "button",
    text: "↺ 다시",
    onClick: () => {
      customElements.whenDefined("twisty-player").then(() => {
        try { player.timestamp = 0; player.pause(); } catch {}
      });
    },
  });
  row.appendChild(playBtn);
  row.appendChild(resetBtn);
  return row;
}

function completeRow(data, { onComplete } = {}) {
  const row = el("div", { class: "complete-row" });
  const id = `done-${data.id}`;
  const box = el("input", { type: "checkbox", id });
  box.checked = isDone(data.id);
  box.addEventListener("change", () => {
    setDone(data.id, box.checked);
    if (box.checked) {
      const celebrate = el("div", { class: "celebrate" }, [
        el("div", { class: "big", text: data.isFinal ? "🎉 큐브 완성!" : "잘했어요!" }),
      ]);
      row.insertAdjacentElement("afterend", celebrate);
      setTimeout(() => celebrate.remove(), 2800);
      speak(data.isFinal ? "큐브 완성! 정말 잘했어요" : "잘했어요. 다음 단계로 가요");
      if (onComplete) setTimeout(onComplete, 900);
    }
  });

  onProgressChange(() => {
    box.checked = isDone(data.id);
  });

  const label = el("label", { for: id, text: data.isFinal ? "큐브 완성! ✅" : "이 단계 다 했어요!" });
  row.appendChild(box);
  row.appendChild(label);
  return row;
}

function caseBlock(c) {
  const wrap = el("div", { class: "case-block" });
  wrap.appendChild(el("div", { class: "case-label", text: c.label }));

  const playerWrap = el("div", { class: "case-player-wrap" });
  playerWrap.appendChild(el("div", { class: "player-loading case-loading", text: "..." }));
  const attrs = {
    puzzle: "3x3x3",
    "control-panel": "bottom-row",
    "hint-facelets": "none",
    "tempo-scale": "0.5",
    background: "none",
    visualization: "3D",
    alg: c.algorithm || "",
  };
  if (c.setupAlg) attrs["experimental-setup-alg"] = c.setupAlg;
  const player = el("twisty-player", attrs);

  // 강조할 피스만 컬러로, 나머지는 회색 처리
  // CENTERS: ULFRBD 순서 → piece 5 = D = 노란색
  if (c.maskEdge !== undefined || c.maskCorner !== undefined) {
    customElements.whenDefined("twisty-player").then(() => {
      try {
        const edges = Array(12).fill("dim");
        if (c.maskEdge !== undefined) edges[c.maskEdge] = "regular";
        const corners = Array(8).fill("dim");
        if (c.maskCorner !== undefined) corners[c.maskCorner] = "regular";
        const centers = Array(6).fill("dim");
        centers[5] = "regular";  // piece 5 = D center = 노란색
        player.experimentalStickerMask = {
          orbits: {
            CORNERS: { pieces: corners },
            EDGES: { pieces: edges },
            CENTERS: { pieces: centers },
          },
        };
      } catch {}
    });
  }

  playerWrap.appendChild(player);
  wrap.appendChild(playerWrap);

  // 재생 버튼
  const playBtn = el("button", {
    class: "btn btn-yellow case-play-btn",
    type: "button",
    text: "▶",
    title: "돌려보기",
    onClick: () => {
      customElements.whenDefined("twisty-player").then(() => {
        try { player.timestamp = 0; player.play(); } catch {}
      });
    },
  });
  wrap.appendChild(playBtn);

  return wrap;
}

export function renderStepSlide(data, { onComplete } = {}) {
  const grid = el("div", { class: "slide-grid", "data-step-id": data.id });

  // LEFT: cube + player controls + move sequence
  const left = el("div", { class: "slide-left" });
  const hasAlg = !!(data.algorithm || data.demoAlg);
  const hasCases = Array.isArray(data.cases) && data.cases.length > 0;

  let player = null;

  // 케이스별 3D 큐브 (cases 배열)
  if (hasCases) {
    const casesSection = el("div", { class: "cases-section" });
    data.cases.forEach(c => casesSection.appendChild(caseBlock(c)));
    left.appendChild(casesSection);
  }

  // RIGHT: title + mascot + orientation + tips + checkpoint + video + complete
  const right = el("div", { class: "slide-right" });
  right.appendChild(
    el("div", { class: "slide-title" }, [
      el("div", { class: "big-num", text: String(data.no) }),
      el("div", {}, [
        el("h2", { text: data.title }),
        el("span", { class: "en", text: data.subtitleEn }),
      ]),
    ]),
  );
  right.appendChild(mascot(data.bubble));
  if (data.orientation) {
    right.appendChild(
      el("div", { class: "orientation-hint", text: `🟡 잡는 법: ${data.orientation}` }),
    );
  }
  if (data.tips?.length) {
    const ul = el("ul", { class: "tips" });
    data.tips.forEach((t) => ul.appendChild(el("li", { text: t })));
    right.appendChild(ul);
  }
  if (data.checkpoint) {
    right.appendChild(
      el("div", { class: "checkpoint" }, [
        el("strong", { text: "확인! " }),
        el("span", { text: data.checkpoint }),
      ]),
    );
  }
  right.appendChild(completeRow(data, { onComplete }));

  grid.appendChild(left);
  grid.appendChild(right);
  return { element: grid, player };
}
