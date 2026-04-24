import { describe, it, expect, beforeEach, vi } from "vitest";

// localStorage 모킹
const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = val; }),
  removeItem: vi.fn((key) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

// progress.js 는 window 이벤트에 의존하므로 window 전역 보장
globalThis.window = globalThis;

import { getProgress, isDone, setDone, onProgressChange } from "../components/progress.js";

const KEY = "cubeGuide.progress.v1";

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("isDone", () => {
  it("저장된 기록 없으면 false", () => {
    expect(isDone("step1")).toBe(false);
  });

  it("setDone(true) 후 true", () => {
    setDone("step1", true);
    expect(isDone("step1")).toBe(true);
  });

  it("setDone(false) 후 false", () => {
    setDone("step1", true);
    setDone("step1", false);
    expect(isDone("step1")).toBe(false);
  });
});

describe("getProgress", () => {
  it("빈 상태면 빈 객체 반환", () => {
    expect(getProgress()).toEqual({});
  });

  it("여러 단계 완료 후 반영", () => {
    setDone("step1", true);
    setDone("step2", true);
    const progress = getProgress();
    expect(progress["step1"]).toBe(true);
    expect(progress["step2"]).toBe(true);
  });

  it("localStorage 손상 데이터도 {} 로 안전하게 반환", () => {
    store[KEY] = "not-valid-json{{{";
    expect(getProgress()).toEqual({});
  });
});

describe("setDone", () => {
  it("true 로 설정 시 localStorage 에 저장", () => {
    setDone("step3", true);
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(isDone("step3")).toBe(true);
  });

  it("false 로 설정 시 키 삭제", () => {
    setDone("step3", true);
    setDone("step3", false);
    const saved = JSON.parse(store[KEY] || "{}");
    expect(saved["step3"]).toBeUndefined();
  });

  it("여러 단계 독립 관리", () => {
    setDone("step1", true);
    setDone("step2", true);
    setDone("step1", false);
    expect(isDone("step1")).toBe(false);
    expect(isDone("step2")).toBe(true);
  });
});

describe("onProgressChange", () => {
  it("setDone 호출 시 핸들러 실행", () => {
    const handler = vi.fn();
    onProgressChange(handler);
    setDone("step1", true);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("핸들러에 현재 progress 객체 전달", () => {
    let received;
    onProgressChange((detail) => { received = detail; });
    setDone("step2", true);
    expect(received).toHaveProperty("step2", true);
  });
});
