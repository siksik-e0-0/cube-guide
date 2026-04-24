import { describe, it, expect } from "vitest";
import { renderVideoSlot } from "../components/videoSlot.js";

describe("renderVideoSlot", () => {
  it("유효한 YouTube ID 로 iframe 렌더링", () => {
    const slot = renderVideoSlot("dQw4w9WgXcQ");
    const iframe = slot.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe.src).toContain("dQw4w9WgXcQ");
  });

  it("YouTube embed URL 에 rel=0 포함", () => {
    const slot = renderVideoSlot("abcDEF12345");
    const iframe = slot.querySelector("iframe");
    expect(iframe.src).toContain("rel=0");
  });

  it("loading=lazy 속성 포함", () => {
    const slot = renderVideoSlot("abcDEF12345");
    const iframe = slot.querySelector("iframe");
    expect(iframe.getAttribute("loading")).toBe("lazy");
  });

  it("빈 문자열이면 placeholder 표시", () => {
    const slot = renderVideoSlot("");
    expect(slot.querySelector("iframe")).toBeNull();
    expect(slot.querySelector(".placeholder")).not.toBeNull();
  });

  it("null 이면 placeholder 표시", () => {
    const slot = renderVideoSlot(null);
    expect(slot.querySelector("iframe")).toBeNull();
    expect(slot.querySelector(".placeholder")).not.toBeNull();
  });

  it("너무 짧은 ID(<6자)는 placeholder 표시", () => {
    const slot = renderVideoSlot("abc");
    expect(slot.querySelector("iframe")).toBeNull();
  });

  it("특수문자 포함 ID 는 iframe 미생성 (보안)", () => {
    const slot = renderVideoSlot("../evil<script>");
    expect(slot.querySelector("iframe")).toBeNull();
  });

  it("반환값은 div.video-slot 엘리먼트", () => {
    const slot = renderVideoSlot("");
    expect(slot.tagName).toBe("DIV");
    expect(slot.classList.contains("video-slot")).toBe(true);
  });
});
