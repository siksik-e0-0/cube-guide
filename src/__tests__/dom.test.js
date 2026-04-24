import { describe, it, expect } from "vitest";
import { el, qs, qsa } from "../util/dom.js";

describe("el()", () => {
  it("지정 태그로 엘리먼트 생성", () => {
    const node = el("div");
    expect(node.tagName).toBe("DIV");
  });

  it("class 속성 적용", () => {
    const node = el("span", { class: "foo bar" });
    expect(node.className).toBe("foo bar");
  });

  it("text 속성 → textContent 설정", () => {
    const node = el("p", { text: "안녕" });
    expect(node.textContent).toBe("안녕");
  });

  it("html 속성 → innerHTML 설정", () => {
    const node = el("div", { html: "<b>굵게</b>" });
    expect(node.querySelector("b")).not.toBeNull();
  });

  it("onClick 핸들러 등록", () => {
    let clicked = false;
    const btn = el("button", { onClick: () => { clicked = true; } });
    btn.click();
    expect(clicked).toBe(true);
  });

  it("null/false 속성값은 무시", () => {
    const node = el("div", { "data-test": null, hidden: false });
    expect(node.getAttribute("data-test")).toBeNull();
    expect(node.hasAttribute("hidden")).toBe(false);
  });

  it("자식 Node 배열 추가", () => {
    const child = el("span", { text: "자식" });
    const parent = el("div", {}, [child]);
    expect(parent.children.length).toBe(1);
    expect(parent.textContent).toBe("자식");
  });

  it("문자열 자식은 TextNode 로 추가", () => {
    const node = el("p", {}, ["텍스트"]);
    expect(node.textContent).toBe("텍스트");
  });

  it("null 자식은 무시", () => {
    const node = el("div", {}, [null, el("span"), false]);
    expect(node.children.length).toBe(1);
  });

  it("dataset 속성 적용", () => {
    const node = el("div", { dataset: { token: "R", index: "0" } });
    expect(node.dataset.token).toBe("R");
    expect(node.dataset.index).toBe("0");
  });
});

describe("qs()", () => {
  it("document 에서 첫 번째 매칭 엘리먼트 반환", () => {
    const div = el("div", { class: "target" });
    document.body.appendChild(div);
    const found = qs(".target");
    expect(found).toBe(div);
    div.remove();
  });

  it("없으면 null 반환", () => {
    expect(qs("#nonexistent-id-xyz")).toBeNull();
  });

  it("root 지정 가능", () => {
    const parent = el("div");
    const child = el("span", { class: "inner" });
    parent.appendChild(child);
    expect(qs(".inner", parent)).toBe(child);
  });
});

describe("qsa()", () => {
  it("모든 매칭 엘리먼트 배열 반환", () => {
    const wrapper = el("div");
    wrapper.appendChild(el("li", { text: "a" }));
    wrapper.appendChild(el("li", { text: "b" }));
    document.body.appendChild(wrapper);
    const items = qsa("li", wrapper);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(2);
    wrapper.remove();
  });

  it("없으면 빈 배열 반환", () => {
    expect(qsa(".no-match-xyz")).toEqual([]);
  });
});
