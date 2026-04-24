import { el } from "../util/dom.js";
import { renderMoveSequence } from "./moveSequence.js";
import { renderVideoSlot } from "./videoSlot.js";
import { isDone, setDone, onProgressChange } from "./progress.js";
import { speak } from "./speech.js";

function mascot(text) {
  return el("div", { class: "mascot" }, [
    el("div", { class: "avatar", text: "큐" }),
    el("div", { class: "bubble", text }),
  ]);
}

function playerBlock(data) {
  const wrap = el("div", { class: "player-wrap" });
  wrap.appendChild(el("div", { class: "player-loading", text: "큐브 준비 중..." }));
  const player = el("twisty-player", {
    puzzle: "3x3x3",
    "control-panel": "bottom-row",
    "hint-facelets": "none",
    "tempo-scale": "0.5",
    background: "none",
    "visualization": "3D",
    ...(data.setupAlg ? { "experimental-setup-alg": data.setupAlg } : {}),
    alg: data.algorithm || data.demoAlg || "",
  });
  player.style.width = "100%";
  player.style.height = "320px";
  wrap.appendChild(player);
  return { wrap, player };
}

function playerControls(player, { playText = "돌려보기 ▶" } = {}) {
  const row = el("div", { class: "player-controls" });
  const playBtn = el("button", {
    class: "btn btn-yellow",
    type: "button",
    text: playText,
    onClick: () => {
      try {
        player.timestamp = 0;
        player.play();
      } catch {}
    },
  });
  const resetBtn = el("button", {
    class: "btn btn-ghost",
    type: "button",
    text: "↺ 다시",
    onClick: () => {
      try {
        player.timestamp = 0;
        player.pause();
      } catch {}
    },
  });
  row.appendChild(playBtn);
  row.appendChild(resetBtn);
  return row;
}

function completeRow(data) {
  const row = el("div", { class: "complete-row" });
  const id = `done-${data.id}`;
  const box = el("input", { type: "checkbox", id });
  box.checked = isDone(data.id);
  box.addEventListener("change", () => {
    setDone(data.id, box.checked);
    if (box.checked) {
      const celebrate = el("div", { class: "celebrate" }, [
        el("div", { class: "big", text: data.isFinal ? "🎉 큐브 완성!" : "잘했어요! 다음으로 가요" }),
      ]);
      row.insertAdjacentElement("afterend", celebrate);
      setTimeout(() => celebrate.remove(), 3500);
      speak(data.isFinal ? "큐브 완성! 정말 잘했어요" : "잘했어요. 다음 단계로 가요");
    }
  });

  // Keep in sync if cleared elsewhere.
  onProgressChange(() => {
    box.checked = isDone(data.id);
  });

  const label = el("label", { for: id, text: data.isFinal ? "큐브 완성! ✅" : "이 단계 다 했어요!" });
  row.appendChild(box);
  row.appendChild(label);
  return row;
}

export function renderStepSection(data) {
  const section = el("section", {
    class: "section",
    id: data.id,
    "data-step-id": data.id,
    "aria-labelledby": `${data.id}-title`,
  });

  const head = el("div", { class: "head" }, [
    el("div", { class: "big-num", text: String(data.no) }),
    el("div", {}, [
      el("h2", { id: `${data.id}-title`, text: data.title }),
      el("span", { class: "en", text: data.subtitleEn }),
    ]),
  ]);

  const card = el("div", { class: "step-card" });
  card.appendChild(head);
  card.appendChild(mascot(data.bubble));

  if (data.orientation) {
    card.appendChild(
      el("div", { class: "move-sub", text: `잡는 법: ${data.orientation}` }),
    );
  }

  const { wrap, player } = playerBlock(data);
  card.appendChild(wrap);
  card.appendChild(playerControls(player));

  if (data.algorithm) {
    const seq = renderMoveSequence(data.algorithm, { label: "같이 해봐요 (동작을 하나씩 눌러요)" });
    card.appendChild(seq.element);
  }
  if (data.altAlgorithm) {
    const alt = renderMoveSequence(data.altAlgorithm, {
      label: data.altLabel || "다른 방향일 때",
    });
    card.appendChild(alt.element);
  }

  if (data.tips?.length) {
    const ul = el("ul");
    data.tips.forEach((t) => ul.appendChild(el("li", { text: t })));
    card.appendChild(ul);
  }

  if (data.checkpoint) {
    card.appendChild(
      el("div", { class: "checkpoint" }, [
        el("div", { class: "avatar", text: "✓", style: "background:#37B24D;color:#fff;" }),
        el("div", {}, [
          el("strong", { text: "확인! " }),
          el("span", { text: data.checkpoint }),
        ]),
      ]),
    );
  }

  card.appendChild(renderVideoSlot(data.videoYoutubeId));
  card.appendChild(completeRow(data));

  section.appendChild(card);
  return section;
}
