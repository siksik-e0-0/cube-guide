import { el } from "../util/dom.js";
import { moveMeta, moveDiagramSvg } from "../data/moves.js";

export function renderMoveCard(token, index, total, { showNotation = false } = {}) {
  const meta = moveMeta(token);
  const card = el("div", { class: "move-card", dataset: { token, index } });

  card.appendChild(el("span", { class: "badge", text: `${index + 1}/${total}` }));

  const diagram = el("div", { class: "diagram", html: moveDiagramSvg(meta) });
  card.appendChild(diagram);

  card.appendChild(el("div", { class: "move-label", text: meta.label }));

  if (showNotation) {
    card.appendChild(el("span", { class: "notation", text: token }));
  }

  return card;
}

export function highlightCurrent(container, currentIndex) {
  container.querySelectorAll(".move-card").forEach((c) => {
    const i = Number(c.dataset.index);
    c.classList.toggle("is-current", i === currentIndex);
  });
  const current = container.querySelector(".move-card.is-current");
  if (current) {
    current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}
