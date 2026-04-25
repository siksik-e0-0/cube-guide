import { describe, it, expect } from "vitest";
import {
  analyzeStep4,
  analyzeStep5,
  analyzeStep6,
  analyzeStep7,
  getStepStateText,
} from "../lib/lblAnalyzer.js";

function solvedFaces() {
  const faces = {};
  for (const f of ["U", "R", "F", "D", "L", "B"]) faces[f] = Array(9).fill(f);
  return faces;
}

// 특정 위치만 다른 색으로 오버라이드
function withOverride(faces, overrides) {
  const copy = {};
  for (const f of Object.keys(faces)) copy[f] = [...faces[f]];
  for (const [key, val] of Object.entries(overrides)) {
    const [face, idx] = key.split(".");
    copy[face][Number(idx)] = val;
  }
  return copy;
}

// ── 좌표 매핑 정합성 검증 ──────────────────────────────────────────────────
describe("좌표 매핑 정합성 — 완성 큐브 기준", () => {
  it("D면 엣지 좌표: D[1]=DF, D[3]=DL, D[5]=DR, D[7]=DB (완성 큐브에서 모두 D색)", () => {
    const f = solvedFaces();
    expect(f.D[1]).toBe("D"); // DF 엣지
    expect(f.D[3]).toBe("D"); // DL 엣지
    expect(f.D[5]).toBe("D"); // DR 엣지
    expect(f.D[7]).toBe("D"); // DB 엣지
  });

  it("D면 코너 좌표: D[0]=DFL, D[2]=DFR, D[6]=DBL, D[8]=DBR (완성 큐브에서 모두 D색)", () => {
    const f = solvedFaces();
    expect(f.D[0]).toBe("D");
    expect(f.D[2]).toBe("D");
    expect(f.D[6]).toBe("D");
    expect(f.D[8]).toBe("D");
  });

  it("DFR 코너 옆면 스티커: F[8]=F색, R[6]=R색", () => {
    const f = solvedFaces();
    expect(f.F[8]).toBe("F");
    expect(f.R[6]).toBe("R");
  });

  it("DFL 코너 옆면 스티커: F[6]=F색, L[8]=L색", () => {
    const f = solvedFaces();
    expect(f.F[6]).toBe("F");
    expect(f.L[8]).toBe("L");
  });

  it("DF 엣지 옆면 스티커: F[7]=F색", () => {
    const f = solvedFaces();
    expect(f.F[7]).toBe("F");
  });

  it("DR 엣지 옆면 스티커: R[7]=R색", () => {
    const f = solvedFaces();
    expect(f.R[7]).toBe("R");
  });
});

// ── analyzeStep4 ───────────────────────────────────────────────────────────
describe("analyzeStep4 — 노란 십자 패턴", () => {
  it("완성 큐브 → cross", () => {
    expect(analyzeStep4(solvedFaces())).toEqual({ pattern: "cross" });
  });

  it("D 엣지 0개 → dot", () => {
    const f = withOverride(solvedFaces(), { "D.1": "F", "D.3": "L", "D.5": "R", "D.7": "B" });
    expect(analyzeStep4(f)).toEqual({ pattern: "dot" });
  });

  it("DF + DB (반대쪽 2개) → bar", () => {
    const f = withOverride(solvedFaces(), { "D.3": "L", "D.5": "R" }); // DF, DB만 D색
    expect(analyzeStep4(f)).toEqual({ pattern: "bar" });
  });

  it("DL + DR (반대쪽 2개) → bar", () => {
    const f = withOverride(solvedFaces(), { "D.1": "F", "D.7": "B" }); // DL, DR만 D색
    expect(analyzeStep4(f)).toEqual({ pattern: "bar" });
  });

  it("DF + DL (이웃한 2개) → L", () => {
    const f = withOverride(solvedFaces(), { "D.5": "R", "D.7": "B" }); // DF, DL만 D색
    expect(analyzeStep4(f)).toEqual({ pattern: "L" });
  });

  it("DF + DR (이웃한 2개) → L", () => {
    const f = withOverride(solvedFaces(), { "D.3": "L", "D.7": "B" });
    expect(analyzeStep4(f)).toEqual({ pattern: "L" });
  });
});

// ── analyzeStep5 ───────────────────────────────────────────────────────────
describe("analyzeStep5 — 노란 코너 위 방향 개수", () => {
  it("완성 큐브 → yellowUpCount 4", () => {
    expect(analyzeStep5(solvedFaces()).yellowUpCount).toBe(4);
  });

  it("D 코너 없음 → yellowUpCount 0", () => {
    const f = withOverride(solvedFaces(), { "D.0": "F", "D.2": "R", "D.6": "L", "D.8": "B" });
    expect(analyzeStep5(f).yellowUpCount).toBe(0);
  });

  it("D 코너 1개 → yellowUpCount 1", () => {
    const f = withOverride(solvedFaces(), { "D.0": "F", "D.2": "R", "D.6": "L" });
    expect(analyzeStep5(f).yellowUpCount).toBe(1);
  });

  it("D 코너 2개 → yellowUpCount 2", () => {
    const f = withOverride(solvedFaces(), { "D.0": "F", "D.2": "R" });
    expect(analyzeStep5(f).yellowUpCount).toBe(2);
  });
});

// ── analyzeStep6 ───────────────────────────────────────────────────────────
describe("analyzeStep6 — 제자리 코너 탐색", () => {
  it("완성 큐브 → 4개 코너 모두 solved", () => {
    const { solvedCorners } = analyzeStep6(solvedFaces());
    expect(solvedCorners).toHaveLength(4);
    expect(solvedCorners).toContain("DFR");
    expect(solvedCorners).toContain("DFL");
    expect(solvedCorners).toContain("DBR");
    expect(solvedCorners).toContain("DBL");
  });

  it("F[8]을 바꾸면 DFR만 solved 아님 (좌표 격리 검증)", () => {
    const f = withOverride(solvedFaces(), { "F.8": "B" });
    const { solvedCorners } = analyzeStep6(f);
    expect(solvedCorners).not.toContain("DFR");
    expect(solvedCorners).toContain("DFL");
    expect(solvedCorners).toContain("DBR");
    expect(solvedCorners).toContain("DBL");
  });

  it("R[6]을 바꾸면 DFR만 solved 아님", () => {
    const f = withOverride(solvedFaces(), { "R.6": "F" });
    const { solvedCorners } = analyzeStep6(f);
    expect(solvedCorners).not.toContain("DFR");
  });

  it("L[6]을 바꾸면 DBL만 solved 아님", () => {
    const f = withOverride(solvedFaces(), { "L.6": "B" });
    const { solvedCorners } = analyzeStep6(f);
    expect(solvedCorners).not.toContain("DBL");
    expect(solvedCorners).toContain("DFR");
  });

  it("아무 코너도 제자리 아니면 빈 배열", () => {
    const f = withOverride(solvedFaces(), {
      "F.8": "B", "R.6": "F", "F.6": "R", "L.8": "F",
      "B.6": "L", "R.8": "B", "B.8": "R", "L.6": "B",
    });
    expect(analyzeStep6(f).solvedCorners).toHaveLength(0);
  });
});

// ── analyzeStep7 ───────────────────────────────────────────────────────────
describe("analyzeStep7 — 제자리 엣지 탐색", () => {
  it("완성 큐브 → 4개 엣지 모두 solved", () => {
    const { solvedEdges } = analyzeStep7(solvedFaces());
    expect(solvedEdges).toHaveLength(4);
    expect(solvedEdges).toContain("DF");
    expect(solvedEdges).toContain("DR");
    expect(solvedEdges).toContain("DB");
    expect(solvedEdges).toContain("DL");
  });

  it("F[7]을 바꾸면 DF만 solved 아님 (좌표 격리 검증)", () => {
    const f = withOverride(solvedFaces(), { "F.7": "B" });
    const { solvedEdges } = analyzeStep7(f);
    expect(solvedEdges).not.toContain("DF");
    expect(solvedEdges).toContain("DR");
    expect(solvedEdges).toContain("DB");
    expect(solvedEdges).toContain("DL");
  });

  it("R[7]을 바꾸면 DR만 solved 아님", () => {
    const f = withOverride(solvedFaces(), { "R.7": "F" });
    expect(analyzeStep7(f).solvedEdges).not.toContain("DR");
  });

  it("아무 엣지도 제자리 아니면 빈 배열", () => {
    const f = withOverride(solvedFaces(), {
      "F.7": "B", "R.7": "F", "B.7": "R", "L.7": "F",
    });
    expect(analyzeStep7(f).solvedEdges).toHaveLength(0);
  });
});

// ── getStepStateText ───────────────────────────────────────────────────────
describe("getStepStateText — 상태 요약 텍스트", () => {
  it("stage 4 dot → 한국어 설명 포함", () => {
    const f = withOverride(solvedFaces(), { "D.1": "F", "D.3": "L", "D.5": "R", "D.7": "B" });
    expect(getStepStateText(4, f)).toContain("점");
  });

  it("stage 4 cross → cross 설명", () => {
    expect(getStepStateText(4, solvedFaces())).toContain("십자");
  });

  it("stage 5 → 코너 수 포함", () => {
    expect(getStepStateText(5, solvedFaces())).toContain("4");
  });

  it("stage 1~3 → null 반환", () => {
    expect(getStepStateText(1, solvedFaces())).toBeNull();
    expect(getStepStateText(3, solvedFaces())).toBeNull();
  });
});
