import { analyzeStep4, analyzeStep5, analyzeStep6, analyzeStep7 } from "./lblAnalyzer.js";

// U 회전을 이용해 특정 위치(target)로 피스를 옮기는 최소 U 이동 설명
// positions: 피스 현재 위치 → 목표 위치까지 시계방향 U 회전 횟수
const U_MOVE_KO = { 0: "", 1: "U 한 번", 2: "U2", 3: "U' 한 번" };

function uMovesTo(from, positions) {
  const idx = positions.indexOf(from);
  if (idx === -1) return "";
  return U_MOVE_KO[idx] ?? "";
}

// ── Step 1~3: 기본 방향 안내 ─────────────────────────────────────────────
function guideStep1() {
  return { orient: "하얀 면을 위로 잡아요", algorithm: null, note: "튜토리얼 1단계 설명을 따라하세요" };
}
function guideStep2() {
  return { orient: "하얀 면을 아래로, 노란 면이 위로 잡아요", algorithm: null, note: "튜토리얼 2단계 설명을 따라하세요" };
}
function guideStep3() {
  return { orient: "하얀 면을 아래로, 노란 면이 위로 잡아요", algorithm: null, note: "튜토리얼 3단계 설명을 따라하세요" };
}

// ── Step 4: 노란 십자 ────────────────────────────────────────────────────
function guideStep4(faces) {
  const { pattern } = analyzeStep4(faces);
  if (pattern === "cross") return { done: true };

  const alg = "F R U R' U' F'";

  if (pattern === "dot") {
    return {
      orient: "노란 면이 위, 아무 방향으로 잡아요",
      algorithm: alg,
      note: "1번 실행 후 패턴(선 또는 ㄴ자)을 다시 확인하세요",
    };
  }

  if (pattern === "bar") {
    // DL+DR = 가로(bar horizontal), DF+DB = 세로(bar vertical)
    const isHorizontal = faces.D[3] === "D" && faces.D[5] === "D";
    return {
      orient: isHorizontal
        ? "노란 면이 위, 선이 가로가 되도록 잡아요"
        : "노란 면이 위, U 한 번 돌려서 선이 가로가 되게 잡아요",
      algorithm: alg,
    };
  }

  // pattern === "L"
  const df = faces.D[1] === "D";
  const dl = faces.D[3] === "D";
  const dr = faces.D[5] === "D";
  const db = faces.D[7] === "D";

  // ㄴ자가 왼쪽-뒤(DL+DB)에 있으면 U 이동 없음 (표준 위치)
  // 각 L 조합별 필요한 U 회전: 목표=DL+DB
  let uMove = "";
  if (dl && db) uMove = "";        // 이미 표준 위치
  else if (dl && df) uMove = "U'"; // DL+DF → U' → DL+DB
  else if (df && dr) uMove = "U2"; // DF+DR → U2 → DB+DL
  else if (dr && db) uMove = "U";  // DR+DB → U → DL+DF... 다시 U' → DL+DB

  const uNote = uMove ? `U ${uMove === "U" ? "한 번" : uMove === "U'" ? "반대로 한 번" : "2번"} 돌린 후` : "";

  return {
    orient: `노란 면이 위${uNote ? ", " + uNote : ""} ㄴ자가 왼쪽-뒤에 오도록 잡아요`,
    algorithm: alg,
  };
}

// ── Step 5: 노란 면 전체 ─────────────────────────────────────────────────
function guideStep5(faces) {
  const { yellowUpCount } = analyzeStep5(faces);
  if (yellowUpCount === 4) return { done: true };

  const alg = "R U R' U R U2 R'";

  if (yellowUpCount === 0) {
    return {
      orient: "노란 면이 위, 아무 방향으로 잡아요",
      algorithm: alg,
      note: "1번 실행 후 다시 확인하세요",
    };
  }

  if (yellowUpCount === 1) {
    // 위를 보는 코너를 왼쪽 앞(DFL)에 위치시킴
    // DFL=D[0], DFR=D[2], DBL=D[6], DBR=D[8]
    const corners = [
      { pos: "DFL", hasYellow: faces.D[0] === "D" },
      { pos: "DFR", hasYellow: faces.D[2] === "D" },
      { pos: "DBL", hasYellow: faces.D[6] === "D" },
      { pos: "DBR", hasYellow: faces.D[8] === "D" },
    ];
    const found = corners.find(c => c.hasYellow);
    // DFL→0, DFR→U, DBL→U', DBR→U2 (시계방향 순서로 DFL에 오게)
    const uMoveMap = { DFL: "", DFR: "U 한 번 돌린 후", DBL: "U' 한 번 돌린 후", DBR: "U2 돌린 후" };
    const uNote = found ? uMoveMap[found.pos] : "";
    return {
      orient: `노란 면이 위${uNote ? ", " + uNote : ""} 노란 코너가 왼쪽 앞(DFL)에 오도록`,
      algorithm: alg,
    };
  }

  if (yellowUpCount === 2) {
    return {
      orient: "노란 면이 위, 노란 코너 2개가 왼쪽 줄(DFL·DBL)에 오도록 잡아요",
      algorithm: alg,
      note: "맞지 않으면 U 한 번씩 돌려 위치를 바꿔보세요",
    };
  }

  return { orient: "노란 면이 위", algorithm: alg, note: "1번 실행 후 다시 확인하세요" };
}

// ── Step 6: 코너 위치 ────────────────────────────────────────────────────
function guideStep6(faces) {
  const { solvedCorners } = analyzeStep6(faces);
  if (solvedCorners.length === 4) return { done: true };

  const alg = "U R U' L' U R' U' L";

  if (solvedCorners.length === 0) {
    return {
      orient: "노란 면이 위, 아무 방향으로 잡아요",
      algorithm: alg,
      note: "1번 실행 후 맞는 코너를 찾아 다시 실행하세요",
    };
  }

  // 맞는 코너를 DFR(오른쪽 앞)에 배치
  // DFR→0회전, DBR→U, DFL→U', DBL→U2
  const uMoveMap = { DFR: "", DBR: "U 한 번 돌린 후", DFL: "U' 한 번 돌린 후", DBL: "U2 돌린 후" };
  const target = solvedCorners[0];
  const uNote = uMoveMap[target] ?? "";
  return {
    orient: `노란 면이 위${uNote ? ", " + uNote : ""} 맞는 코너(${target})가 오른쪽 앞에 오도록`,
    algorithm: alg,
  };
}

// ── Step 7: 엣지 위치 ────────────────────────────────────────────────────
function guideStep7(faces) {
  const { solvedEdges } = analyzeStep7(faces);
  if (solvedEdges.length === 4) return { done: true };

  const alg = "R U' R U R U R U' R' U' R2";

  if (solvedEdges.length === 0) {
    return {
      orient: "노란 면이 위, 아무 방향으로 잡아요",
      algorithm: alg,
      note: "1번 실행 후 맞는 모서리를 찾아 뒤쪽(DB)에 두고 다시 실행하세요",
    };
  }

  // 맞는 엣지를 DB(뒤)에 배치
  // DB→0회전, DF→U2, DL→U 한 번, DR→U' 한 번
  const uMoveMap = { DB: "", DF: "U2 돌린 후", DL: "U 한 번 돌린 후", DR: "U' 한 번 돌린 후" };
  const target = solvedEdges[0];
  const uNote = uMoveMap[target] ?? "";
  return {
    orient: `노란 면이 위${uNote ? ", " + uNote : ""} 맞는 모서리(${target})가 뒤쪽에 오도록`,
    algorithm: alg,
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
