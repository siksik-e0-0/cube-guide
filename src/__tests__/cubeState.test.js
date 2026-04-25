import { describe, it, expect } from "vitest";
import { validateCubeState, getFaceHex, getFaceKo, FACE_ORDER } from "../lib/cubeState.js";

// 완성된 큐브 — 각 면의 9개 스티커가 모두 해당 면 색
function solvedFaces() {
  const faces = {};
  for (const f of ["U", "R", "F", "D", "L", "B"]) {
    faces[f] = Array(9).fill(f);
  }
  return faces;
}

describe("getFaceHex", () => {
  it("known face codes return hex color", () => {
    expect(getFaceHex("U")).toBe("#FFFFFF");
    expect(getFaceHex("D")).toBe("#FFD200");
    expect(getFaceHex("R")).toBe("#B90000");
    expect(getFaceHex("L")).toBe("#FF5900");
    expect(getFaceHex("F")).toBe("#009B48");
    expect(getFaceHex("B")).toBe("#0046AD");
  });
  it("unknown code returns fallback", () => {
    expect(getFaceHex("X")).toBe("#888888");
  });
});

describe("getFaceKo", () => {
  it("returns Korean name", () => {
    expect(getFaceKo("U")).toBe("하양");
    expect(getFaceKo("D")).toBe("노랑");
  });
  it("unknown code returns code itself", () => {
    expect(getFaceKo("X")).toBe("X");
  });
});

describe("validateCubeState", () => {
  it("완성된 큐브는 valid", () => {
    const result = validateCubeState(solvedFaces());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("faces 데이터 없으면 invalid", () => {
    const result = validateCubeState({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("특정 면 배열이 짧으면 invalid", () => {
    const faces = solvedFaces();
    faces.U = ["U", "U", "U"]; // 9개 미만
    const result = validateCubeState(faces);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("U"))).toBe(true);
  });

  it("색상 개수 오류 — 한 색이 9개 초과/미만", () => {
    const faces = solvedFaces();
    // U 면의 스티커 하나를 R(빨강)으로 바꿈 → U색 8개, R색 10개
    faces.U[0] = "R";
    const result = validateCubeState(faces);
    expect(result.valid).toBe(false);
    const errText = result.errors.join(" ");
    expect(errText).toMatch(/하양|U/);
    expect(errText).toMatch(/빨강|R/);
  });

  it("가운데 스티커 오류 — 중앙(index 4)이 해당 면 색이 아님", () => {
    const faces = solvedFaces();
    // R 면 가운데를 F(초록)으로 교체, F 면 가운데를 R로 교체 (카운트 유지)
    faces.R[4] = "F";
    faces.F[4] = "R";
    const result = validateCubeState(faces);
    expect(result.valid).toBe(false);
    // 오류 메시지에 면 정보 포함
    expect(result.errors.some(e => e.includes("빨강") || e.includes("R"))).toBe(true);
  });

  it("색상 개수 오류가 있으면 가운데 검증 전에 반환", () => {
    const faces = solvedFaces();
    faces.U[0] = "R"; // 색상 수 불균형 + 가운데는 정상
    const result = validateCubeState(faces);
    expect(result.valid).toBe(false);
    // Level 1 오류만 반환 (Level 2는 생략)
    expect(result.errors.every(e => !e.includes("가운데"))).toBe(true);
  });

  it("FACE_ORDER는 6개 면 코드", () => {
    expect(FACE_ORDER).toHaveLength(6);
    expect(FACE_ORDER).toContain("U");
    expect(FACE_ORDER).toContain("D");
  });
});
