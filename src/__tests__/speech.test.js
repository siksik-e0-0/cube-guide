import { describe, it, expect, beforeEach, vi } from "vitest";

// localStorage 모킹
const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = val; }),
  clear: vi.fn(() => { for (const k in store) delete store[k]; }),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// SpeechSynthesis 모킹
const cancelMock = vi.fn();
const speakMock = vi.fn();
globalThis.window = globalThis;
globalThis.speechSynthesis = { cancel: cancelMock, speak: speakMock };
globalThis.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; this.lang = ""; this.rate = 1; this.pitch = 1; }
};

import { isTtsOn, setTtsOn, speak, stopSpeaking } from "../components/speech.js";

const KEY = "cubeGuide.tts";

beforeEach(() => {
  localStorageMock.clear();
  cancelMock.mockClear();
  speakMock.mockClear();
});

describe("isTtsOn", () => {
  it("기본값은 false (저장 없음)", () => {
    expect(isTtsOn()).toBe(false);
  });

  it("'1' 로 저장된 경우 true", () => {
    store[KEY] = "1";
    expect(isTtsOn()).toBe(true);
  });

  it("'0' 으로 저장된 경우 false", () => {
    store[KEY] = "0";
    expect(isTtsOn()).toBe(false);
  });
});

describe("setTtsOn", () => {
  it("true 전달 시 '1' 저장", () => {
    setTtsOn(true);
    expect(store[KEY]).toBe("1");
  });

  it("false 전달 시 '0' 저장", () => {
    setTtsOn(false);
    expect(store[KEY]).toBe("0");
  });

  it("on/off 토글 가능", () => {
    setTtsOn(true);
    expect(isTtsOn()).toBe(true);
    setTtsOn(false);
    expect(isTtsOn()).toBe(false);
  });
});

describe("speak", () => {
  it("TTS 꺼져 있으면 speak 호출 안 함", () => {
    setTtsOn(false);
    speak("안녕");
    expect(speakMock).not.toHaveBeenCalled();
  });

  it("TTS 켜져 있으면 cancel → speak 순서로 호출", () => {
    setTtsOn(true);
    speak("큐브 완성");
    expect(cancelMock).toHaveBeenCalled();
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it("speak 에 전달된 Utterance 의 lang 이 ko-KR", () => {
    setTtsOn(true);
    speak("테스트");
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.lang).toBe("ko-KR");
  });

  it("rate 가 1 이하로 느린 속도 설정", () => {
    setTtsOn(true);
    speak("테스트");
    const utterance = speakMock.mock.calls[0][0];
    expect(utterance.rate).toBeLessThanOrEqual(1);
    expect(utterance.rate).toBeGreaterThan(0);
  });
});

describe("stopSpeaking", () => {
  it("speechSynthesis.cancel 호출", () => {
    stopSpeaking();
    expect(cancelMock).toHaveBeenCalledTimes(1);
  });
});
