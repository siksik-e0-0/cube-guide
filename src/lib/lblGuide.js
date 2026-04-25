import { analyzeStep4, analyzeStep5, analyzeStep6, analyzeStep7 } from "./lblAnalyzer.js";

// ── Step 1~3: 기본 방향 안내 ─────────────────────────────────────────────
function guideStep1() {
  return {
    orient: "하얀(흰색) 면이 위로 오도록 큐브를 잡아요. 초록 면(F)이 나를 향하게 놓으면 준비 완료!",
    algorithm: null,
    note: "튜토리얼 1단계를 따라 하얀 십자(+)를 위에 만들어요.",
  };
}
function guideStep2() {
  return {
    orient: "큐브를 뒤집어요! 하얀 면이 아래, 노란 면이 위로 오게 잡아요. 이 방향을 3~7단계 내내 유지해요.",
    algorithm: null,
    note: "튜토리얼 2단계 — 'R U R' U'' 주문을 반복해서 하얀 귀퉁이를 아래로 내려요.",
  };
}
function guideStep3() {
  return {
    orient: "노란 면이 위, 하얀 면이 아래인 상태 그대로 유지해요. 가운데 층 빈 자리를 옆면에서 찾아요.",
    algorithm: null,
    note: "튜토리얼 3단계 — 노란색 없는 모서리를 찾아 좌/우 주문으로 끼워 넣어요.",
  };
}

// ── Step 4: 노란 십자 ────────────────────────────────────────────────────
function guideStep4(faces) {
  const { pattern } = analyzeStep4(faces);
  if (pattern === "cross") return { done: true };

  const alg = "F R U R' U' F'";

  if (pattern === "dot") {
    return {
      orient: "노란 면이 위로 오게 잡아요. 위에서 내려다보면 가운데만 노란색인 '점(●)' 상태예요. 어느 방향이든 상관없어요.",
      algorithm: alg,
      note: "알고리즘 1번 실행 → 위에서 보면 ㄴ자 또는 선이 나와요 → 계속 단계 진행",
    };
  }

  if (pattern === "bar") {
    const isHorizontal = faces.D[3] === "D" && faces.D[5] === "D";
    if (isHorizontal) {
      return {
        orient: "노란 면이 위로 잡아요. 위에서 보면 노란 선이 이미 가로(←→)예요. 그대로 알고리즘 실행!",
        algorithm: alg,
      };
    }
    return {
      orient: "노란 면이 위로 잡고, 위에서 보며 U를 한 번 돌려요. 그러면 노란 선이 가로(←→)가 돼요. 그 다음 알고리즘 실행!",
      algorithm: alg,
    };
  }

  // pattern === "L"
  const df = faces.D[1] === "D";
  const dl = faces.D[3] === "D";
  const dr = faces.D[5] === "D";
  const db = faces.D[7] === "D";

  let uMove = "";
  let uDesc = "";
  if (dl && db) {
    uMove = "";
    uDesc = "";
  } else if (dl && df) {
    uMove = "U'";
    uDesc = "위에서 보며 U를 반시계(U') 한 번 돌려요.";
  } else if (df && dr) {
    uMove = "U2";
    uDesc = "위에서 보며 U를 두 번(U2) 돌려요.";
  } else if (dr && db) {
    uMove = "U";
    uDesc = "위에서 보며 U를 시계(U) 한 번 돌려요.";
  }

  return {
    orient: `노란 면이 위로 잡아요. 위에서 보면 노란 ㄴ자가 보여요.${uDesc ? " " + uDesc : ""} ㄴ자의 꺾이는 부분(모서리)이 왼쪽-뒤 구석에 오면 알고리즘 실행!`,
    algorithm: alg,
    note: "ㄴ자 꺾인 부분이 왼쪽-뒤(나에게서 먼 왼쪽)가 맞는 위치예요.",
  };
}

// ── Step 5: 노란 면 전체 ─────────────────────────────────────────────────
function guideStep5(faces) {
  const { yellowUpCount } = analyzeStep5(faces);
  if (yellowUpCount === 4) return { done: true };

  const alg = "R U R' U R U2 R'";

  if (yellowUpCount === 0) {
    return {
      orient: "노란 면이 위로 잡아요. 위에서 보면 노란 귀퉁이(꼭짓점)가 하나도 위를 안 보는 상태예요. 어느 방향이든 OK.",
      algorithm: alg,
      note: "1번 실행 후 → 위에서 다시 봐요. 노란 귀퉁이 개수를 세어요.",
    };
  }

  if (yellowUpCount === 1) {
    const corners = [
      { pos: "DFL", hasYellow: faces.D[0] === "D", name: "왼쪽 앞(DFL)" },
      { pos: "DFR", hasYellow: faces.D[2] === "D", name: "오른쪽 앞(DFR)" },
      { pos: "DBL", hasYellow: faces.D[6] === "D", name: "왼쪽 뒤(DBL)" },
      { pos: "DBR", hasYellow: faces.D[8] === "D", name: "오른쪽 뒤(DBR)" },
    ];
    const found = corners.find(c => c.hasYellow);
    const uMoveMap = {
      DFL: { u: "", desc: "이미 왼쪽 앞에 있어요." },
      DFR: { u: "U 한 번", desc: "U를 시계 방향으로 한 번 돌려요." },
      DBL: { u: "U' 한 번", desc: "U를 반시계 방향으로 한 번 돌려요." },
      DBR: { u: "U2", desc: "U를 두 번 돌려요." },
    };
    const mv = found ? uMoveMap[found.pos] : { u: "", desc: "" };
    return {
      orient: `노란 면이 위로 잡아요. 위에서 보면 노란 귀퉁이 1개가 위를 봐요 — 지금 ${found?.name ?? ""}에 있어요. ${mv.desc} 그 귀퉁이가 왼쪽 앞(DFL)으로 오면 알고리즘 실행!`,
      algorithm: alg,
      note: "노란색이 위를 보는 귀퉁이를 왼쪽 앞 귀퉁이로 이동시켜요.",
    };
  }

  if (yellowUpCount === 2) {
    return {
      orient: "노란 면이 위로 잡아요. 노란 귀퉁이 2개가 위를 봐요. 그 2개가 왼쪽 줄(왼쪽 앞·왼쪽 뒤)에 나란히 오도록 U를 돌려요.",
      algorithm: alg,
      note: "U를 1~3번 돌려보며 노란 귀퉁이 2개가 왼쪽에 나란히 올 때 알고리즘 실행.",
    };
  }

  return {
    orient: "노란 면이 위로 잡아요.",
    algorithm: alg,
    note: "1번 실행 후 다시 확인하세요.",
  };
}

// ── Step 6: 코너 위치 ────────────────────────────────────────────────────
function guideStep6(faces) {
  const { solvedCorners } = analyzeStep6(faces);
  if (solvedCorners.length === 4) return { done: true };

  const alg = "U R U' L' U R' U' L";

  const cornerNameMap = {
    DFR: "오른쪽 앞(DFR)",
    DFL: "왼쪽 앞(DFL)",
    DBR: "오른쪽 뒤(DBR)",
    DBL: "왼쪽 뒤(DBL)",
  };

  if (solvedCorners.length === 0) {
    return {
      orient: "노란 면이 위로 잡아요. 옆면 귀퉁이를 봐요 — 귀퉁이 양쪽 색이 모두 해당 면 색과 같은 귀퉁이가 있나요? 없으면 아무 방향으로 알고리즘 실행.",
      algorithm: alg,
      note: "1번 실행 후 → 옆면 귀퉁이를 다시 확인 → 맞는 귀퉁이를 오른쪽 앞으로 이동 후 재실행",
    };
  }

  const target = solvedCorners[0];
  const uMoveMap = {
    DFR: { u: "", desc: "이미 오른쪽 앞에 있어요!" },
    DBR: { u: "U 한 번", desc: "U를 시계 방향으로 한 번 돌려요." },
    DFL: { u: "U' 한 번", desc: "U를 반시계 방향으로 한 번 돌려요." },
    DBL: { u: "U2", desc: "U를 두 번 돌려요." },
  };
  const mv = uMoveMap[target] ?? { u: "", desc: "" };
  return {
    orient: `노란 면이 위로 잡아요. 맞는 귀퉁이가 ${cornerNameMap[target] ?? target}에 있어요. ${mv.desc} 그 귀퉁이가 오른쪽 앞으로 오면 알고리즘 실행!`,
    algorithm: alg,
    note: "'맞는 귀퉁이' = 옆면 양쪽 색이 각 면 가운데 색과 일치하는 귀퉁이예요.",
  };
}

// ── Step 7: 엣지 위치 ────────────────────────────────────────────────────
function guideStep7(faces) {
  const { solvedEdges } = analyzeStep7(faces);
  if (solvedEdges.length === 4) return { done: true };

  const alg = "R U' R U R U R U' R' U' R2";

  const edgeNameMap = {
    DF: "앞쪽(DF)",
    DR: "오른쪽(DR)",
    DB: "뒤쪽(DB)",
    DL: "왼쪽(DL)",
  };

  if (solvedEdges.length === 0) {
    return {
      orient: "노란 면이 위로 잡아요. 옆면 가운데 줄 모서리를 봐요 — 앞뒤 색이 각 면 가운데 색과 같은 모서리가 있나요? 없으면 아무 방향으로 알고리즘 실행.",
      algorithm: alg,
      note: "1번 실행 후 → 맞는 모서리를 찾아 뒤쪽에 두고 다시 실행 → 완성!",
    };
  }

  const target = solvedEdges[0];
  const uMoveMap = {
    DB: { u: "", desc: "이미 뒤쪽에 있어요!" },
    DF: { u: "U2", desc: "U를 두 번 돌려요." },
    DL: { u: "U 한 번", desc: "U를 시계 방향으로 한 번 돌려요." },
    DR: { u: "U' 한 번", desc: "U를 반시계 방향으로 한 번 돌려요." },
  };
  const mv = uMoveMap[target] ?? { u: "", desc: "" };
  return {
    orient: `노란 면이 위로 잡아요. 맞는 모서리가 ${edgeNameMap[target] ?? target}에 있어요. ${mv.desc} 그 모서리가 뒤쪽(나에게서 먼 쪽)으로 오면 알고리즘 실행!`,
    algorithm: alg,
    note: "뒤쪽 = 큐브를 잡았을 때 나에게서 가장 먼 쪽 모서리예요.",
  };
}

// ── 공개 API ──────────────────────────────────────────────────────────────
export function generateStepGuide(stage, faces) {
  switch (stage) {
    case 1: return guideStep1();
    case 2: return guideStep2();
    case 3: return guideStep3();
    case 4: return guideStep4(faces);
    case 5: return guideStep5(faces);
    case 6: return guideStep6(faces);
    case 7: return guideStep7(faces);
    default: return null;
  }
}
