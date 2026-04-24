import { el } from "../util/dom.js";

export function renderVideoSlot(youtubeId) {
  const slot = el("div", { class: "video-slot" });
  if (youtubeId && /^[\w-]{6,}$/.test(youtubeId)) {
    slot.appendChild(
      el("iframe", {
        src: `https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?rel=0`,
        title: "튜토리얼 영상",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: "",
        loading: "lazy",
      }),
    );
  } else {
    slot.appendChild(
      el("div", { class: "placeholder" }, [
        el("div", { text: "📺 여기에 영상이 들어가요" }),
        el("div", {
          class: "move-sub",
          text: "보호자용: src/data/steps.js 의 videoYoutubeId 에 영상 ID를 넣으면 자동으로 보여요.",
        }),
      ]),
    );
  }
  return slot;
}
