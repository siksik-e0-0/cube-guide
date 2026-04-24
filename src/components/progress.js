const KEY = "cubeGuide.progress.v1";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("progress-change", { detail: data }));
}

export function getProgress() {
  return read();
}

export function isDone(id) {
  return !!read()[id];
}

export function setDone(id, done) {
  const data = read();
  if (done) data[id] = true;
  else delete data[id];
  write(data);
}

export function onProgressChange(handler) {
  window.addEventListener("progress-change", (e) => handler(e.detail));
}
