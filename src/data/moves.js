// Map cube notation tokens to kid-friendly Korean labels and diagram hints.
// 표준 큐브 잡는 법: 하양이 위(U), 노랑이 아래(D), 빨강 오른쪽(R), 주황 왼쪽(L),
// 초록 앞(F), 파랑 뒤(B) — WCA 표준 색 배치 기준.

const FACES = {
  U: { ko: "위",    en: "Up",    color: "#FFFFFF" },
  D: { ko: "아래",  en: "Down",  color: "#FFD43B" },
  R: { ko: "오른쪽", en: "Right", color: "#E03131" },
  L: { ko: "왼쪽",  en: "Left",  color: "#FD7E14" },
  F: { ko: "앞",    en: "Front", color: "#37B24D" },
  B: { ko: "뒤",    en: "Back",  color: "#1C7ED6" },
};

const DIRS = {
  cw:  { arrow: "↻", ko: "한 번",     spoken: "한 번 돌려요" },
  ccw: { arrow: "↺", ko: "반대로",    spoken: "반대로 돌려요" },
  "180": { arrow: "↻↻", ko: "두 번",  spoken: "두 번 돌려요" },
};

// Parse algorithm string like "R U R' U'" or "F R U R' U' F'" into tokens.
export function parseAlgorithm(alg) {
  if (!alg) return [];
  return alg.trim().split(/\s+/).filter(Boolean);
}

// Get display metadata for one token (e.g. "R'", "U2", "F").
export function moveMeta(token) {
  if (!token) return null;
  // Handle wide moves (lowercase) as same face but labelled "두 층".
  const isWide = /^[rludfb]/.test(token);
  const letter = token[0].toUpperCase();
  const face = FACES[letter];
  if (!face) return null;

  let dirKey = "cw";
  if (token.includes("'")) dirKey = "ccw";
  else if (token.includes("2")) dirKey = "180";
  const dir = DIRS[dirKey];

  const widePrefix = isWide ? "두 층 " : "";
  const label = `${widePrefix}${face.ko}을 ${dir.ko}`;
  const spoken = `${widePrefix}${face.ko}쪽을 ${dir.spoken}`;

  return {
    token,
    face: letter,
    faceKo: face.ko,
    faceColor: face.color,
    dirKey,
    arrow: dir.arrow,
    label,
    spoken,
    isWide,
  };
}

// Render a small SVG diagram showing a cube with the relevant face highlighted
// and a rotation arrow. Returns an SVG string.
export function moveDiagramSvg(meta) {
  if (!meta) return "";
  const c = meta.faceColor;
  const stroke = "#222";

  // We draw a simple isometric-ish cube silhouette using 3 rhombus faces:
  // top, left, right. Then overlay an arrow on the highlighted face.
  // For clarity we don't try to render all 6 faces; instead we tint the
  // relevant face and label it with its Korean name.

  const arrow = meta.arrow;
  const highlightLabel = meta.faceKo;

  return `
    <svg viewBox="0 0 120 120" role="img" aria-label="${meta.label}">
      <!-- base cube (three visible faces) -->
      <polygon points="60,10 105,32 60,54 15,32" fill="#EFE7CB" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="15,32 60,54 60,108 15,80" fill="#D9CFA8" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="105,32 60,54 60,108 105,80" fill="#C7BD88" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>

      <!-- highlighted face overlay -->
      ${faceOverlay(meta.face, c, stroke)}

      <!-- arrow + label -->
      <text x="60" y="118" text-anchor="middle" font-size="12" font-weight="700" fill="#222">${highlightLabel} ${arrow}</text>
    </svg>
  `;
}

function faceOverlay(face, color, stroke) {
  switch (face) {
    case "U":
      return `<polygon points="60,10 105,32 60,54 15,32" fill="${color}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    case "L":
      return `<polygon points="15,32 60,54 60,108 15,80" fill="${color}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    case "R":
      return `<polygon points="105,32 60,54 60,108 105,80" fill="${color}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
    case "F":
      // F is hidden in this projection; show a small badge instead.
      return `<circle cx="60" cy="72" r="18" fill="${color}" stroke="${stroke}" stroke-width="2"/>
              <text x="60" y="77" text-anchor="middle" font-size="16" font-weight="700" fill="#222">앞</text>`;
    case "B":
      return `<circle cx="60" cy="24" r="14" fill="${color}" stroke="${stroke}" stroke-width="2"/>
              <text x="60" y="29" text-anchor="middle" font-size="12" font-weight="700" fill="#222">뒤</text>`;
    case "D":
      return `<rect x="34" y="95" width="52" height="14" fill="${color}" stroke="${stroke}" stroke-width="2"/>
              <text x="60" y="106" text-anchor="middle" font-size="11" font-weight="700" fill="#222">아래</text>`;
    default:
      return "";
  }
}

export const COLOR_GUIDE = [
  { face: "U", ko: "위",     color: FACES.U.color, text: "하양" },
  { face: "D", ko: "아래",   color: FACES.D.color, text: "노랑" },
  { face: "F", ko: "앞",     color: FACES.F.color, text: "초록" },
  { face: "B", ko: "뒤",     color: FACES.B.color, text: "파랑" },
  { face: "R", ko: "오른쪽", color: FACES.R.color, text: "빨강" },
  { face: "L", ko: "왼쪽",   color: FACES.L.color, text: "주황" },
];
