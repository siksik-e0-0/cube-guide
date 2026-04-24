import { el } from "../util/dom.js";
import { COLOR_GUIDE } from "../data/moves.js";

function mascot(text) {
  return el("div", { class: "mascot" }, [
    el("div", { class: "avatar", text: "큐" }),
    el("div", { class: "bubble", text }),
  ]);
}

function introTitle(title, subtitleEn) {
  return el("div", { class: "slide-title" }, [
    el("div", { class: "big-num", text: "0" }),
    el("div", {}, [
      el("h2", { text: title }),
      el("span", { class: "en", text: subtitleEn }),
    ]),
  ]);
}

export function renderMeetSlide(data) {
  const grid = el("div", { class: "slide-grid", "data-step-id": data.id });

  const left = el("div", { class: "slide-left" });
  const wrap = el("div", { class: "player-wrap" });
  wrap.appendChild(el("div", { class: "player-loading", text: "큐브 준비 중..." }));
  const player = el("twisty-player", {
    puzzle: "3x3x3",
    "control-panel": "none",
    "hint-facelets": "none",
    background: "none",
    alg: "",
  });
  wrap.appendChild(player);
  left.appendChild(wrap);

  const right = el("div", { class: "slide-right" });
  right.appendChild(introTitle(data.title, data.subtitleEn));
  right.appendChild(mascot(data.bubble));

  const pieceGrid = el("div", { class: "piece-grid" });
  (data.pieces || []).forEach((p) => {
    pieceGrid.appendChild(
      el("div", { class: "piece-card" }, [
        el("div", { class: "big-num", text: String(p.count) }),
        el("strong", { text: `${p.name} 조각` }),
        el("p", { class: "move-sub", text: p.note }),
      ]),
    );
  });
  right.appendChild(pieceGrid);

  grid.appendChild(left);
  grid.appendChild(right);
  return { element: grid, player };
}

export function renderColorsSlide(data) {
  const grid = el("div", { class: "slide-grid", "data-step-id": data.id });

  const left = el("div", { class: "slide-left" });
  const wrap = el("div", { class: "player-wrap" });
  wrap.appendChild(el("div", { class: "player-loading", text: "큐브 준비 중..." }));
  const player = el("twisty-player", {
    puzzle: "3x3x3",
    "control-panel": "none",
    "hint-facelets": "none",
    background: "none",
    alg: "",
  });
  wrap.appendChild(player);
  left.appendChild(wrap);

  const right = el("div", { class: "slide-right" });
  right.appendChild(introTitle(data.title, data.subtitleEn));
  right.appendChild(mascot(data.bubble));

  const strip = el("div", { class: "color-strip" });
  COLOR_GUIDE.forEach((c) => {
    const ink = c.face === "U" || c.face === "D" ? "#222" : "#fff";
    strip.appendChild(
      el(
        "div",
        { class: "cell", style: `background:${c.color};color:${ink};` },
        [
          el("div", { text: c.ko }),
          el("div", { class: "move-sub", style: `color:${ink};opacity:.9;`, text: c.text }),
        ],
      ),
    );
  });
  right.appendChild(strip);
  right.appendChild(
    el("p", {
      text: "가운데 조각 색은 절대 바뀌지 않아요. 화면 큐브와 내 큐브 방향을 맞추면 돼요.",
    }),
  );

  grid.appendChild(left);
  grid.appendChild(right);
  return { element: grid, player };
}

export function renderSymbolsSlide(data) {
  const grid = el("div", { class: "slide-grid", "data-step-id": data.id });

  const left = el("div", { class: "slide-left" });
  const notationGrid = el("div", { class: "notation-grid" });
  const players = [];
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
    players.push(p);
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
    notationGrid.appendChild(c);
  });
  left.appendChild(notationGrid);

  const right = el("div", { class: "slide-right" });
  right.appendChild(introTitle(data.title, data.subtitleEn));
  right.appendChild(mascot(data.bubble));
  right.appendChild(
    el("p", {
      text: "기호 이름은 몰라도 괜찮아요. 색 + 화살표 카드만 따라하면 큐브가 맞춰져요.",
    }),
  );

  grid.appendChild(left);
  grid.appendChild(right);
  return { element: grid, player: players[0] };
}
