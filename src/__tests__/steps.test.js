import { describe, it, expect } from "vitest";
import { INTRO_STEPS, MAIN_STEPS, ALL_STEPS } from "../data/steps.js";

describe("INTRO_STEPS 구조 검증", () => {
  it("3개의 인트로 단계 존재", () => {
    expect(INTRO_STEPS).toHaveLength(3);
  });

  it("필수 필드 포함 (id, kind, title, bubble)", () => {
    for (const s of INTRO_STEPS) {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("kind", "intro");
      expect(s).toHaveProperty("title");
      expect(s).toHaveProperty("bubble");
    }
  });

  it("id 중복 없음", () => {
    const ids = INTRO_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("symbols 단계에 moves 배열 포함", () => {
    const symbols = INTRO_STEPS.find((s) => s.id === "symbols");
    expect(symbols).toBeDefined();
    expect(Array.isArray(symbols.moves)).toBe(true);
    expect(symbols.moves.length).toBeGreaterThan(0);
  });

  it("meet 단계에 pieces 배열 포함 (3종류)", () => {
    const meet = INTRO_STEPS.find((s) => s.id === "meet");
    expect(meet.pieces).toHaveLength(3);
  });
});

describe("MAIN_STEPS 구조 검증", () => {
  it("7개의 메인 단계 존재", () => {
    expect(MAIN_STEPS).toHaveLength(7);
  });

  it("no 필드가 1~7 순서대로", () => {
    MAIN_STEPS.forEach((s, i) => {
      expect(s.no).toBe(i + 1);
    });
  });

  it("모든 단계에 kind: step", () => {
    for (const s of MAIN_STEPS) {
      expect(s.kind).toBe("step");
    }
  });

  it("필수 콘텐츠 필드 포함", () => {
    for (const s of MAIN_STEPS) {
      expect(s).toHaveProperty("id");
      expect(s).toHaveProperty("title");
      expect(s).toHaveProperty("bubble");
      expect(s).toHaveProperty("tips");
      expect(s).toHaveProperty("checkpoint");
      expect(Array.isArray(s.tips)).toBe(true);
    }
  });

  it("id 중복 없음", () => {
    const ids = MAIN_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("setupAlg 은 algorithm 자체와 다름 (버그 수정 검증)", () => {
    for (const s of MAIN_STEPS) {
      if (s.algorithm) {
        expect(s.setupAlg).not.toBe(s.algorithm);
      }
    }
  });

  it("setupAlg 이 algorithm 의 단순 반복이 아님 (버그 수정 검증)", () => {
    for (const s of MAIN_STEPS) {
      if (s.algorithm && s.setupAlg) {
        const algPart = s.algorithm + " " + s.algorithm;
        expect(s.setupAlg).not.toBe(algPart);
        expect(s.setupAlg).not.toBe(s.algorithm + " " + s.algorithm + " " + s.algorithm);
      }
    }
  });

  it("step2 setupAlg: U R U' R' (R U R' U' 의 역순)", () => {
    const step2 = MAIN_STEPS.find((s) => s.id === "step2");
    expect(step2.setupAlg).toBe("U R U' R'");
  });

  it("step4 setupAlg: F U R U' R' F' (F R U R' U' F' 의 역순)", () => {
    const step4 = MAIN_STEPS.find((s) => s.id === "step4");
    expect(step4.setupAlg).toBe("F U R U' R' F'");
  });

  it("step5 setupAlg: R U2 R' U' R U' R'", () => {
    const step5 = MAIN_STEPS.find((s) => s.id === "step5");
    expect(step5.setupAlg).toBe("R U2 R' U' R U' R'");
  });

  it("마지막 단계(step7)에 isFinal: true", () => {
    const last = MAIN_STEPS[MAIN_STEPS.length - 1];
    expect(last.isFinal).toBe(true);
  });

  it("step3 에 altAlgorithm 존재", () => {
    const step3 = MAIN_STEPS.find((s) => s.id === "step3");
    expect(step3).toHaveProperty("altAlgorithm");
    expect(step3.altAlgorithm.length).toBeGreaterThan(0);
  });
});

describe("ALL_STEPS 병합 검증", () => {
  it("전체 10개 = 인트로 3 + 메인 7", () => {
    expect(ALL_STEPS).toHaveLength(10);
  });

  it("인트로가 먼저, 메인이 뒤에 배치", () => {
    expect(ALL_STEPS[0].kind).toBe("intro");
    expect(ALL_STEPS[3].kind).toBe("step");
  });

  it("전체 id 중복 없음", () => {
    const ids = ALL_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
