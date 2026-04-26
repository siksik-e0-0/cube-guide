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
  it("8개의 메인 단계 존재", () => {
    expect(MAIN_STEPS).toHaveLength(8);
  });

  it("no 필드가 1~8 순서대로", () => {
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
        expect(s.setupAlg).not.toBe(s.algorithm + " " + s.algorithm);
        expect(s.setupAlg).not.toBe(s.algorithm + " " + s.algorithm + " " + s.algorithm);
      }
    }
  });

  it("step3(흰색 층) setupAlg: U R U' R'", () => {
    const step3 = MAIN_STEPS.find((s) => s.id === "step3");
    expect(step3.setupAlg).toBe("U R U' R'");
  });

  it("step4(가운데 층) setupAlg: F' U' F U R U' R' U", () => {
    const step4 = MAIN_STEPS.find((s) => s.id === "step4");
    expect(step4.setupAlg).toBe("F' U' F U R U' R' U");
  });

  it("step5(노란 십자) setupAlg: F U R U' R' F'", () => {
    const step5 = MAIN_STEPS.find((s) => s.id === "step5");
    expect(step5.setupAlg).toBe("F U R U' R' F'");
  });

  it("마지막 단계(step8)에 isFinal: true", () => {
    const last = MAIN_STEPS[MAIN_STEPS.length - 1];
    expect(last.isFinal).toBe(true);
  });

  it("step3 에 altAlgorithm 존재 (왼쪽 공식)", () => {
    const step3 = MAIN_STEPS.find((s) => s.id === "step3");
    expect(step3).toHaveProperty("altAlgorithm");
    expect(step3.altAlgorithm.length).toBeGreaterThan(0);
  });

  it("step4 에 altAlgorithm 존재 (왼쪽 공식)", () => {
    const step4 = MAIN_STEPS.find((s) => s.id === "step4");
    expect(step4).toHaveProperty("altAlgorithm");
    expect(step4.altAlgorithm.length).toBeGreaterThan(0);
  });

  it("step1(데이지) 단계 존재 및 subtitleEn 확인", () => {
    const step1 = MAIN_STEPS.find((s) => s.id === "step1");
    expect(step1).toBeDefined();
    expect(step1.subtitleEn).toBe("Build a Daisy");
  });

  it("step8(완성) 단계 존재 및 isFinal 확인", () => {
    const step8 = MAIN_STEPS.find((s) => s.id === "step8");
    expect(step8).toBeDefined();
    expect(step8.isFinal).toBe(true);
  });
});

describe("ALL_STEPS 병합 검증", () => {
  it("전체 11개 = 인트로 3 + 메인 8", () => {
    expect(ALL_STEPS).toHaveLength(11);
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
