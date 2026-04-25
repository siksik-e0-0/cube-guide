import { describe, it, expect } from "vitest";
import { generateStepGuide } from "../lib/lblGuide.js";

function solvedFaces() {
  const faces = {};
  for (const f of ["U", "R", "F", "D", "L", "B"]) faces[f] = Array(9).fill(f);
  return faces;
}

function withOverride(faces, overrides) {
  const copy = {};
  for (const f of Object.keys(faces)) copy[f] = [...faces[f]];
  for (const [key, val] of Object.entries(overrides)) {
    const [face, idx] = key.split(".");
    copy[face][Number(idx)] = val;
  }
  return copy;
}

// ── Stage 1~3: 기본 안내 ─────────────────────────────────────────────────
describe("generateStepGuide — stage 1~3", () => {
  it("stage 1: 하얀 면 위 방향 안내", () => {
    const g = generateStepGuide(1, solvedFaces());
    expect(g.orient).toContain("하얀");
    expect(g.algorithm).toBeNull();
  });

  it("stage 2: 노란 면 위 방향 안내", () => {
    const g = generateStepGuide(2, solvedFaces());
    expect(g.orient).toContain("노란");
    expect(g.algorithm).toBeNull();
  });

  it("stage 3: 노란 면 위 방향 안내", () => {
    const g = generateStepGuide(3, solvedFaces());
    expect(g.orient).toContain("노란");
    expect(g.algorithm).toBeNull();
  });

  it("없는 stage → null", () => {
    expect(generateStepGuide(0, solvedFaces())).toBeNull();
    expect(generateStepGuide(8, solvedFaces())).toBeNull();
  });
});

// ── Stage 4: 노란 십자 ───────────────────────────────────────────────────
describe("generateStepGuide — stage 4", () => {
  it("완성 큐브(cross) → done", () => {
    expect(generateStepGuide(4, solvedFaces()).done).toBe(true);
  });

  it("dot 패턴 → F R U R' U' F' 알고리즘", () => {
    const f = withOverride(solvedFaces(), { "D.1": "F", "D.3": "L", "D.5": "R", "D.7": "B" });
    const g = generateStepGuide(4, f);
    expect(g.algorithm).toBe("F R U R' U' F'");
    expect(g.note).toBeTruthy(); // 재확인 안내 포함
  });

  it("bar(가로) 패턴 — DL+DR → '가로' 언급", () => {
    // DL(D[3]), DR(D[5]) 노란색, DF(D[1]), DB(D[7]) 아닌 색
    const f = withOverride(solvedFaces(), { "D.1": "F", "D.7": "B" });
    const g = generateStepGuide(4, f);
    expect(g.orient).toContain("가로");
    expect(g.algorithm).toBe("F R U R' U' F'");
  });

  it("bar(세로) 패턴 — DF+DB → 'U 한 번' 언급", () => {
    // DF(D[1]), DB(D[7]) 노란색, DL(D[3]), DR(D[5]) 아닌 색
    const f = withOverride(solvedFaces(), { "D.3": "L", "D.5": "R" });
    const g = generateStepGuide(4, f);
    expect(g.orient).toContain("U");
    expect(g.algorithm).toBe("F R U R' U' F'");
  });

  it("L 패턴 — 알고리즘 포함, 방향 안내 있음", () => {
    // DF+DL만 노란색 (L 패턴)
    const f = withOverride(solvedFaces(), { "D.5": "R", "D.7": "B" });
    const g = generateStepGuide(4, f);
    expect(g.algorithm).toBe("F R U R' U' F'");
    expect(g.orient).toBeTruthy();
  });
});

// ── Stage 5: 노란 면 전체 ────────────────────────────────────────────────
describe("generateStepGuide — stage 5", () => {
  it("완성 큐브(4개 위) → done", () => {
    expect(generateStepGuide(5, solvedFaces()).done).toBe(true);
  });

  it("0개 → R U R' U R U2 R' 알고리즘 + 재확인 note", () => {
    const f = withOverride(solvedFaces(), { "D.0": "F", "D.2": "R", "D.6": "L", "D.8": "B" });
    const g = generateStepGuide(5, f);
    expect(g.algorithm).toBe("R U R' U R U2 R'");
    expect(g.note).toBeTruthy();
  });

  it("1개(DFL) → '왼쪽 앞' 언급, U 이동 없음", () => {
    // D[0]=DFL만 노란색 위를 봄
    const f = withOverride(solvedFaces(), { "D.2": "R", "D.6": "L", "D.8": "B" });
    const g = generateStepGuide(5, f);
    expect(g.orient).toContain("왼쪽 앞");
    expect(g.orient).not.toContain("돌린 후"); // 이미 DFL 위치
  });

  it("1개(DFR) → U 이동 안내 포함", () => {
    // D[2]=DFR만 노란색
    const f = withOverride(solvedFaces(), { "D.0": "F", "D.6": "L", "D.8": "B" });
    const g = generateStepGuide(5, f);
    expect(g.orient).toContain("돌린 후");
  });
});

// ── Stage 6: 코너 위치 ──────────────────────────────────────────────────
describe("generateStepGuide — stage 6", () => {
  it("완성 큐브(4코너) → done", () => {
    expect(generateStepGuide(6, solvedFaces()).done).toBe(true);
  });

  it("맞는 코너 없음 → U R U' L' U R' U' L 알고리즘 + note", () => {
    const f = withOverride(solvedFaces(), {
      "F.8": "B", "R.6": "F", "F.6": "R", "L.8": "F",
      "B.6": "L", "R.8": "B", "B.8": "R", "L.6": "B",
    });
    const g = generateStepGuide(6, f);
    expect(g.algorithm).toBe("U R U' L' U R' U' L");
    expect(g.note).toBeTruthy();
  });

  it("DFR 제자리 → U 이동 없이 '오른쪽 앞' 안내", () => {
    // DFR만 맞고 나머지는 틀리게 설정
    const f = withOverride(solvedFaces(), {
      "F.6": "R", "L.8": "F",
      "B.6": "L", "R.8": "B",
      "B.8": "R", "L.6": "B",
    });
    const g = generateStepGuide(6, f);
    expect(g.algorithm).toBe("U R U' L' U R' U' L");
    expect(g.orient).toContain("DFR");
    expect(g.orient).not.toContain("돌린 후");
  });

  it("DFL 제자리 → U 이동 안내 포함", () => {
    const f = withOverride(solvedFaces(), {
      "F.8": "B", "R.6": "F",
      "B.6": "L", "R.8": "B",
      "B.8": "R", "L.6": "B",
    });
    const g = generateStepGuide(6, f);
    expect(g.orient).toContain("DFL");
    expect(g.orient).toContain("돌린 후");
  });
});

// ── Stage 7: 엣지 위치 ──────────────────────────────────────────────────
describe("generateStepGuide — stage 7", () => {
  it("완성 큐브(4엣지) → done", () => {
    expect(generateStepGuide(7, solvedFaces()).done).toBe(true);
  });

  it("맞는 엣지 없음 → R U' R U R U R U' R' U' R2 알고리즘 + note", () => {
    const f = withOverride(solvedFaces(), {
      "F.7": "B", "R.7": "F", "B.7": "R", "L.7": "F",
    });
    const g = generateStepGuide(7, f);
    expect(g.algorithm).toBe("R U' R U R U R U' R' U' R2");
    expect(g.note).toBeTruthy();
  });

  it("DB 제자리 → U 이동 없이 '뒤쪽' 안내", () => {
    const f = withOverride(solvedFaces(), { "F.7": "B", "R.7": "F", "L.7": "F" });
    const g = generateStepGuide(7, f);
    expect(g.orient).toContain("DB");
    expect(g.orient).not.toContain("돌린 후");
  });

  it("DF 제자리 → U2 이동 안내 포함", () => {
    const f = withOverride(solvedFaces(), { "R.7": "F", "B.7": "R", "L.7": "F" });
    const g = generateStepGuide(7, f);
    expect(g.orient).toContain("DF");
    expect(g.orient).toContain("U2");
  });
});
