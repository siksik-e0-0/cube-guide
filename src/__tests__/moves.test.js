import { describe, it, expect } from "vitest";
import { parseAlgorithm, moveMeta, moveDiagramSvg } from "../data/moves.js";

describe("parseAlgorithm", () => {
  it("빈 문자열이면 빈 배열 반환", () => {
    expect(parseAlgorithm("")).toEqual([]);
    expect(parseAlgorithm(null)).toEqual([]);
    expect(parseAlgorithm(undefined)).toEqual([]);
  });

  it("단일 토큰 파싱", () => {
    expect(parseAlgorithm("R")).toEqual(["R"]);
  });

  it("공백으로 분리된 복수 토큰 파싱", () => {
    expect(parseAlgorithm("R U R' U'")).toEqual(["R", "U", "R'", "U'"]);
  });

  it("앞뒤 공백 및 다중 공백 무시", () => {
    expect(parseAlgorithm("  R  U  R'  ")).toEqual(["R", "U", "R'"]);
  });

  it("2회전(2) 표기 파싱", () => {
    expect(parseAlgorithm("R2 U2")).toEqual(["R2", "U2"]);
  });

  it("전체 LBL 알고리즘 토큰 수 확인", () => {
    expect(parseAlgorithm("F R U R' U' F'")).toHaveLength(6);
    expect(parseAlgorithm("R U R' U R U2 R'")).toHaveLength(7);
    expect(parseAlgorithm("R U' R U R U R U' R' U' R2")).toHaveLength(11);
  });
});

describe("moveMeta", () => {
  it("알 수 없는 면 토큰은 null 반환", () => {
    expect(moveMeta("M")).toBeNull();
    expect(moveMeta("E")).toBeNull();
    expect(moveMeta("S")).toBeNull();
    expect(moveMeta("")).toBeNull();
  });

  it("R: 오른쪽 면, 시계 방향", () => {
    const meta = moveMeta("R");
    expect(meta).not.toBeNull();
    expect(meta.face).toBe("R");
    expect(meta.faceKo).toBe("오른쪽");
    expect(meta.dirKey).toBe("cw");
    expect(meta.arrow).toBe("↻");
    expect(meta.isWide).toBe(false);
  });

  it("R': 오른쪽 면, 반시계 방향", () => {
    const meta = moveMeta("R'");
    expect(meta.dirKey).toBe("ccw");
    expect(meta.arrow).toBe("↺");
  });

  it("R2: 오른쪽 면, 180도", () => {
    const meta = moveMeta("R2");
    expect(meta.dirKey).toBe("180");
    expect(meta.arrow).toBe("↻↻");
  });

  it("소문자(와이드 무브) 처리", () => {
    const meta = moveMeta("r");
    expect(meta).not.toBeNull();
    expect(meta.face).toBe("R");
    expect(meta.isWide).toBe(true);
    expect(meta.label).toContain("두 층");
  });

  it("6개 모든 면(U D R L F B) 처리", () => {
    const faces = ["U", "D", "R", "L", "F", "B"];
    for (const f of faces) {
      const meta = moveMeta(f);
      expect(meta).not.toBeNull();
      expect(meta.face).toBe(f);
    }
  });

  it("label, spoken 필드 포함", () => {
    const meta = moveMeta("U");
    expect(typeof meta.label).toBe("string");
    expect(meta.label.length).toBeGreaterThan(0);
    expect(typeof meta.spoken).toBe("string");
    expect(meta.spoken.length).toBeGreaterThan(0);
  });

  it("faceColor 는 유효한 hex 색상", () => {
    const meta = moveMeta("R");
    expect(meta.faceColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("moveDiagramSvg", () => {
  it("null 이면 빈 문자열 반환", () => {
    expect(moveDiagramSvg(null)).toBe("");
    expect(moveDiagramSvg(undefined)).toBe("");
  });

  it("SVG 문자열 반환", () => {
    const meta = moveMeta("R");
    const svg = moveDiagramSvg(meta);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("aria-label 에 label 포함", () => {
    const meta = moveMeta("U");
    const svg = moveDiagramSvg(meta);
    expect(svg).toContain(meta.label);
  });

  it("6개 면 모두 SVG 생성 가능", () => {
    const faces = ["U", "D", "R", "L", "F", "B"];
    for (const f of faces) {
      const meta = moveMeta(f);
      const svg = moveDiagramSvg(meta);
      expect(svg).toContain("<svg");
    }
  });

  it("F 면은 circle 배지로 표시", () => {
    const meta = moveMeta("F");
    const svg = moveDiagramSvg(meta);
    expect(svg).toContain("<circle");
  });
});
