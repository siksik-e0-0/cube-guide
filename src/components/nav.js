import { el } from "../util/dom.js";
import { getProgress, onProgressChange } from "./progress.js";
import { ALL_STEPS } from "../data/steps.js";

export function renderNav() {
  const nav = el("nav", { class: "nav", "aria-label": "단계 목록" });
  const progressLabel = el("div", { class: "nav-progress" });
  const list = el("ol");

  ALL_STEPS.forEach((s, i) => {
    const li = el("li");
    const a = el("a", { href: `#${s.id}`, "data-step-id": s.id }, [
      el("span", { class: "nav-num" }, [
        el("span", { class: "nav-num-text", text: s.kind === "step" ? String(s.no) : "·" }),
      ]),
      el("span", { text: s.title }),
    ]);
    li.appendChild(a);
    list.appendChild(li);
  });

  nav.appendChild(progressLabel);
  nav.appendChild(list);

  function refresh() {
    const done = getProgress();
    let completed = 0;
    const steps = ALL_STEPS.filter((s) => s.kind === "step");
    steps.forEach((s) => {
      if (done[s.id]) completed++;
    });
    progressLabel.textContent = `진행: ${completed} / ${steps.length}`;
    nav.querySelectorAll("a").forEach((a) => {
      const id = a.dataset.stepId;
      a.classList.toggle("is-done", !!done[id]);
    });
  }

  refresh();
  onProgressChange(refresh);

  // Scroll spy
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          nav.querySelectorAll("a").forEach((a) => {
            a.classList.toggle("is-current", a.dataset.stepId === id);
          });
        }
      });
    },
    { rootMargin: "-35% 0px -55% 0px" },
  );

  // Called by main after sections mount.
  nav.observeSections = () => {
    document.querySelectorAll("section[data-step-id]").forEach((s) => obs.observe(s));
  };

  return nav;
}
