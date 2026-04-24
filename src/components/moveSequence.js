import { el } from "../util/dom.js";
import { parseAlgorithm, moveMeta } from "../data/moves.js";
import { renderMoveCard, highlightCurrent } from "./moveCard.js";
import { speak } from "./speech.js";

export function renderMoveSequence(algorithm, { label = "같이 해봐요", showNotation = false } = {}) {
  const wrap = el("div", { class: "moves" });
  const tokens = parseAlgorithm(algorithm);

  const head = el("div", { class: "moves-head" }, [
    el("span", { text: label }),
    el("span", { class: "move-sub", text: `${tokens.length}개 동작` }),
  ]);
  wrap.appendChild(head);

  const scroll = el("div", { class: "moves-scroll" });
  tokens.forEach((t, i) => scroll.appendChild(renderMoveCard(t, i, tokens.length, { showNotation })));
  wrap.appendChild(scroll);

  const controls = el("div", { class: "player-controls" });
  let current = -1;

  const prevBtn = el("button", {
    class: "btn btn-ghost",
    type: "button",
    text: "◀ 이전",
    onClick: () => step(-1),
  });
  const nextBtn = el("button", {
    class: "btn btn-primary",
    type: "button",
    text: "다음 ▶",
    onClick: () => step(1),
  });
  const resetBtn = el("button", {
    class: "btn btn-ghost",
    type: "button",
    text: "↺ 처음으로",
    onClick: reset,
  });

  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(resetBtn);
  wrap.appendChild(controls);

  function step(delta) {
    const next = Math.max(0, Math.min(tokens.length - 1, current + delta));
    current = next;
    highlightCurrent(scroll, current);
    const meta = moveMeta(tokens[current]);
    if (meta) speak(meta.spoken);
  }

  function reset() {
    current = -1;
    scroll.querySelectorAll(".move-card").forEach((c) => c.classList.remove("is-current"));
    scroll.scrollTo({ left: 0, behavior: "smooth" });
  }

  return { element: wrap, step, reset, tokens };
}
