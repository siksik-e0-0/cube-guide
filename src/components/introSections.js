import { el } from "../util/dom.js";
import { COLOR_GUIDE } from "../data/moves.js";

export function renderMeetSection(data) {
  const section = el("section", { class: "section", id: data.id, "data-step-id": data.id });
  const card = el("div", { class: "step-card" });

  card.appendChild(
    el("div", { class: "head" }, [
      el("div", { class: "big-num", text: "0" }),
      el("div", {}, [
        el("h2", { text: data.title }),
        el("span", { class: "en", text: data.subtitleEn }),
      ]),
    ]),
  );
  card.appendChild(
    el("div", { class: "mascot" }, [
      el("div", { class: "avatar", text: "큐" }),
      el("div", { class: "bubble", text: data.bubble }),
    ]),
  );

  const playerWrap = el("div", { class: "player-wrap" });
  playerWrap.appendChild(el("div", { class: "player-loading", text: "큐브 준비 중..." }));
  const player = el("twisty-player", {
    puzzle: "3x3x3",
    "control-panel": "none",
    "hint-facelets": "none",
    background: "none",
    alg: "",
  });
  player.style.width = "100%";
  player.style.height = "280px";
  playerWrap.appendChild(player);
  card.appendChild(playerWrap);

  const grid = el("div", { class: "piece-grid" });
  (data.pieces || []).forEach((p) => {
    grid.appendChild(
      el("div", { class: "piece-card" }, [
        el("div", { class: "big-num", text: String(p.count) }),
        el("strong", { text: `${p.name} 조각` }),
        el("p", { class: "move-sub", text: p.note }),
      ]),
    );
  });
  card.appendChild(grid);

  section.appendChild(card);
  return section;
}

export function renderColorsSection(data) {
  const section = el("section", { class: "section", id: data.id, "data-step-id": data.id });
  const card = el("div", { class: "step-card" });

  card.appendChild(
    el("div", { class: "head" }, [
      el("div", { class: "big-num", text: "0" }),
      el("div", {}, [
        el("h2", { text: data.title }),
        el("span", { class: "en", text: data.subtitleEn }),
      ]),
    ]),
  );
  card.appendChild(
    el("div", { class: "mascot" }, [
      el("div", { class: "avatar", text: "큐" }),
      el("div", { class: "bubble", text: data.bubble }),
    ]),
  );

  const strip = el("div", { class: "color-strip" });
  COLOR_GUIDE.forEach((c) => {
    const ink = c.face === "U" ? "#222" : c.face === "D" ? "#222" : "#fff";
    strip.appendChild(
      el("div", {
        class: "cell",
        style: `background:${c.color};color:${ink};`,
      }, [
        el("div", { text: c.ko }),
        el("div", { class: "move-sub", style: `color:${ink};opacity:.9;`, text: c.text }),
      ]),
    );
  });
  card.appendChild(strip);

  card.appendChild(
    el("p", {
      class: "move-sub",
      text: "가운데 조각 색은 절대 바뀌지 않아요. 앞으로 이 자리에 이 색이라고 생각하고 따라오면 돼요.",
    }),
  );

  section.appendChild(card);
  return section;
}

export function renderSymbolsSection(data) {
  const section = el("section", { class: "section", id: data.id, "data-step-id": data.id });
  const card = el("div", { class: "step-card" });

  card.appendChild(
    el("div", { class: "head" }, [
      el("div", { class: "big-num", text: "0" }),
      el("div", {}, [
        el("h2", { text: data.title }),
        el("span", { class: "en", text: data.subtitleEn }),
      ]),
    ]),
  );
  card.appendChild(
    el("div", { class: "mascot" }, [
      el("div", { class: "avatar", text: "큐" }),
      el("div", { class: "bubble", text: data.bubble }),
    ]),
  );

  const grid = el("div", { class: "notation-grid" });
  (data.moves || []).forEach((m) => {
    const c = el("div", { class: "notation-card" });
    c.appendChild(el("div", { class: "sym", text: m.token }));
    const p = el("twisty-player", {
      puzzle: "3x3x3",
      "control-panel": "none",
      "hint-facelets": "none",
      background: "none",
      alg: m.token,
    });
    p.style.width = "100%";
    p.style.height = "140px";
    c.appendChild(p);
    c.appendChild(el("div", { text: m.tip, class: "move-sub" }));
    c.appendChild(
      el("button", {
        class: "btn btn-primary",
        type: "button",
        text: "돌려보기 ▶",
        onClick: () => {
          try {
            p.timestamp = 0;
            p.play();
          } catch {}
        },
      }),
    );
    grid.appendChild(c);
  });
  card.appendChild(grid);

  section.appendChild(card);
  return section;
}
