import { el } from "../util/dom.js";

export function createTutorialSelect({ onDaisyFresh, onDaisyContinue, onLayer3 }) {
  const overlay = el("div", { class: "tsel-overlay" });
  overlay.hidden = true;

  const modal = el("div", { class: "tsel-modal" });
  modal.appendChild(el("h2", { class: "tsel-title", text: "어떤 방법으로 배울까요?" }));

  const cards = [
    {
      icon: "🌼",
      title: "처음하기",
      desc: "데이지 방식\n처음부터 새로 시작",
      btnText: "처음하기 ▶",
      btnClass: "btn btn-primary",
      onClick: () => { close(); onDaisyFresh(); },
    },
    {
      icon: "📖",
      title: "기존",
      desc: "데이지 방식\n이어서 계속하기",
      btnText: "이어서 ▶",
      btnClass: "btn btn-primary",
      onClick: () => { close(); onDaisyContinue(); },
    },
    {
      icon: "🔲",
      title: "Layer3",
      desc: "층별(LBL) 방식\n7단계 공식",
      btnText: "Layer3 시작 ▶",
      btnClass: "btn btn-yellow",
      onClick: () => { close(); onLayer3(); },
    },
  ];

  const row = el("div", { class: "tsel-row" });
  cards.forEach((card) => {
    const cardEl = el("div", { class: "tsel-card" });
    cardEl.appendChild(el("div", { class: "tsel-icon", text: card.icon }));
    cardEl.appendChild(el("div", { class: "tsel-card-title", text: card.title }));
    const descEl = el("div", { class: "tsel-card-desc" });
    card.desc.split("\n").forEach((line, i) => {
      if (i > 0) descEl.appendChild(document.createElement("br"));
      descEl.appendChild(document.createTextNode(line));
    });
    cardEl.appendChild(descEl);
    cardEl.appendChild(
      el("button", { class: card.btnClass, type: "button", text: card.btnText, onClick: card.onClick }),
    );
    row.appendChild(cardEl);
  });

  modal.appendChild(row);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  function open() {
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  return { open, close };
}
