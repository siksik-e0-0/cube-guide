const FACE_HEX = {
  U: "#FFFFFF",
  D: "#FFD200",
  R: "#B90000",
  L: "#FF5900",
  F: "#009B48",
  B: "#0046AD",
};

// nearestFace() 색상 분류용 WCA 표준 RGB 참조값 (scanner.js에서 import)
export const FACE_RGB = {
  U: [255, 255, 255],
  D: [255, 210, 0],
  R: [185, 0, 0],
  L: [255, 89, 0],
  F: [0, 155, 72],
  B: [0, 70, 173],
};

const FACE_KO = {
  U: "하양", D: "노랑", R: "빨강", L: "주황", F: "초록", B: "파랑",
};

export const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];

export function getFaceHex(code) {
  return FACE_HEX[code] ?? "#888888";
}

export function getFaceKo(code) {
  return FACE_KO[code] ?? code;
}

// Level 1: 색상 개수 확인 (각 6색이 정확히 9개씩)
function checkCounts(faces) {
  const counts = {};
  for (const face of FACE_ORDER) {
    if (!Array.isArray(faces[face]) || faces[face].length !== 9) {
      return [`${face} 면 데이터가 없거나 잘못됐어요.`];
    }
    for (const c of faces[face]) counts[c] = (counts[c] || 0) + 1;
  }
  const errors = [];
  for (const face of FACE_ORDER) {
    const n = counts[face] ?? 0;
    if (n !== 9) errors.push(`${getFaceKo(face)}색이 ${n}개예요 (9개여야 해요).`);
  }
  return errors;
}

// Level 2: 각 면의 가운데 스티커가 해당 면 색인지 확인
function checkCenters(faces) {
  const errors = [];
  for (const face of FACE_ORDER) {
    const center = faces[face]?.[4];
    if (center !== face) {
      const actual = getFaceKo(center);
      const expected = getFaceKo(face);
      errors.push(`${expected}(${face}) 면 가운데가 ${actual}색이에요.`);
    }
  }
  return errors;
}

export function validateCubeState(faces) {
  const l1 = checkCounts(faces);
  if (l1.length > 0) return { valid: false, errors: l1 };

  const l2 = checkCenters(faces);
  return { valid: l2.length === 0, errors: l2 };
}
