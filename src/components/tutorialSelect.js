import { el } from "../util/dom.js";

export function createTutorialSelect({ onDaisyFresh, onLayer1, onLayer2, onLayer3 }) {
  const overlay = el("div", { class: "tsel-overlay" });
  overlay.hidden = true;

  const modal = el("div", { class: "tsel-modal" });
  modal.appendChild(el("h2", { class: "tsel-title", text: "어떤 방법으로 배울까요?" }));

  const cards = [
    {
      icon: "🌼",
      title: "처음하기",
      desc: "큐브 기초\n용어·기호 배우기",
      btnText: "처음하기 ▶",
      btnClass: "btn btn-primary",
      onClick: () => { close(); onDaisyFresh(); },
    },
    {
      icon: "1️⃣",
      title: "Layer 1",
      desc: "흰색 층 완성\n(데이지·십자·층)",
      btnText: "Layer1 ▶",
      btnClass: "btn btn-primary",
      onClick: () => { close(); onLayer1(); },
    },
    {
      icon: "2️⃣",
      title: "Layer 2",
      desc: "가운데 층 완성\n(모서리 끼우기)",
      btnText: "Layer2 ▶",
      btnClass: "btn btn-orange",
      onClick: () => { close(); onLayer2(); },
    },
    {
      icon: "3️⃣",
      title: "Layer 3",
      desc: "노란 층 완성\n(마지막 층 4단계)",
      btnText: "Layer3 ▶",
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
