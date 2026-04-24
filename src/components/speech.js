// 한국어 TTS 간단 래퍼. on/off 토글을 localStorage에 저장.
const KEY = "cubeGuide.tts";

export function isTtsOn() {
  return localStorage.getItem(KEY) === "1";
}

export function setTtsOn(on) {
  localStorage.setItem(KEY, on ? "1" : "0");
}

export function speak(text) {
  if (!isTtsOn()) return;
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.95;
  u.pitch = 1.0;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
