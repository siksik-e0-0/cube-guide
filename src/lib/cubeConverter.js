// cubing.js 3x3x3 kpuzzle 피스 순서 (Node.js 실험으로 검증):
// CORNERS: UFR(0) UBR(1) UBL(2) UFL(3) DFR(4) DLF(5) DBL(6) DRB(7)
// EDGES:   UF(0)  UR(1)  UB(2)  UL(3)  DF(4)  DR(5)  DB(6)  DL(7)
//          FR(8)  FL(9)  BR(10) BL(11)
//
// 방향(orientation) = CW 순서로 나열된 피스 홈 스티커 중
// 현재 슬롯의 primary face에 위치한 스티커의 인덱스.
// U/D 면이 primary, 이후 CW 방향으로 두 번째, 세 번째 스티커.

// 코너 홈 스티커 순서 (sticker 0=primary, 1=CW 다음, 2=CW 그다음)
const CORNER_HOME = [
  ["U","F","R"], // 0: UFR
  ["U","R","B"], // 1: UBR
  ["U","B","L"], // 2: UBL
  ["U","L","F"], // 3: UFL
  ["D","R","F"], // 4: DFR
  ["D","F","L"], // 5: DLF
  ["D","L","B"], // 6: DBL
  ["D","B","R"], // 7: DRB
];
const CORNER_MAP = new Map(CORNER_HOME.map((s, i) => [[...s].sort().join(""), i]));

// 코너 슬롯별 스캔 좌표 [sticker-0, sticker-1, sticker-2]
const CORNER_SLOTS = [
  [["U",8],["F",2],["R",0]], // slot 0: UFR
  [["U",2],["R",2],["B",0]], // slot 1: UBR
  [["U",0],["B",2],["L",0]], // slot 2: UBL
  [["U",6],["L",2],["F",0]], // slot 3: UFL
  [["D",2],["R",6],["F",8]], // slot 4: DFR
  [["D",0],["F",6],["L",8]], // slot 5: DLF
  [["D",6],["L",6],["B",8]], // slot 6: DBL
  [["D",8],["B",6],["R",8]], // slot 7: DRB
];

// 엣지 홈 스티커 순서 (sticker 0=primary)
const EDGE_HOME = [
  ["U","F"], // 0: UF
  ["U","R"], // 1: UR
  ["U","B"], // 2: UB
  ["U","L"], // 3: UL
  ["D","F"], // 4: DF
  ["D","R"], // 5: DR
  ["D","B"], // 6: DB
  ["D","L"], // 7: DL
  ["F","R"], // 8: FR
  ["F","L"], // 9: FL
  ["B","R"], // 10: BR
  ["B","L"], // 11: BL
];
const EDGE_MAP = new Map(EDGE_HOME.map((s, i) => [[...s].sort().join(""), i]));

// 엣지 슬롯별 스캔 좌표 [sticker-0, sticker-1]
const EDGE_SLOTS = [
  [["U",7],["F",1]], // slot 0: UF
  [["U",5],["R",1]], // slot 1: UR
  [["U",1],["B",1]], // slot 2: UB
  [["U",3],["L",1]], // slot 3: UL
  [["D",1],["F",7]], // slot 4: DF
  [["D",5],["R",7]], // slot 5: DR
  [["D",7],["B",7]], // slot 6: DB
  [["D",3],["L",7]], // slot 7: DL
  [["F",5],["R",3]], // slot 8: FR
  [["F",3],["L",5]], // slot 9: FL
  [["B",3],["R",5]], // slot 10: BR
  [["B",5],["L",3]], // slot 11: BL
];

// 유효하지 않은 코너/엣지(잘못된 색 조합 OR 중복 조각)의 스티커 위치를
// "Face.idx" 형식 Set으로 반환
export function findInvalidStickers(faces) {
  const bad = new Set();

  // 코너: 잘못된 조합 + 중복 조각 감지
  const cornerSeen = new Map(); // key → firstSlotStickers
  for (const slot of CORNER_SLOTS) {
    const [[f0,i0],[f1,i1],[f2,i2]] = slot;
    const c = [faces[f0][i0], faces[f1][i1], faces[f2][i2]];
    const key = [...c].sort().join("");
    if (!CORNER_MAP.has(key)) {
      bad.add(`${f0}.${i0}`); bad.add(`${f1}.${i1}`); bad.add(`${f2}.${i2}`);
    } else if (cornerSeen.has(key)) {
      // 중복 조각: 이전 슬롯도 함께 표시
      const prev = cornerSeen.get(key);
      prev.forEach(s => bad.add(s));
      bad.add(`${f0}.${i0}`); bad.add(`${f1}.${i1}`); bad.add(`${f2}.${i2}`);
    } else {
      cornerSeen.set(key, [`${f0}.${i0}`, `${f1}.${i1}`, `${f2}.${i2}`]);
    }
  }

  // 엣지: 잘못된 조합 + 중복 조각 감지
  const edgeSeen = new Map();
  for (const slot of EDGE_SLOTS) {
    const [[f0,i0],[f1,i1]] = slot;
    const c0 = faces[f0][i0], c1 = faces[f1][i1];
    const key = [c0, c1].sort().join("");
    if (!EDGE_MAP.has(key)) {
      bad.add(`${f0}.${i0}`); bad.add(`${f1}.${i1}`);
    } else if (edgeSeen.has(key)) {
      const prev = edgeSeen.get(key);
      prev.forEach(s => bad.add(s));
      bad.add(`${f0}.${i0}`); bad.add(`${f1}.${i1}`);
    } else {
      edgeSeen.set(key, [`${f0}.${i0}`, `${f1}.${i1}`]);
    }
  }

  return bad;
}

// ── 면 회전 유틸 ────────────────────────────────────────────────────────────

// 3×3 면 배열을 90° 시계방향으로 회전
function rotateFace90CW(arr) {
  return [
    arr[6], arr[3], arr[0],
    arr[7], arr[4], arr[1],
    arr[8], arr[5], arr[2],
  ];
}

function rotateFaceN(arr, n) {
  let r = [...arr];
  for (let i = 0; i < (n % 4); i++) r = rotateFace90CW(r);
  return r;
}

// ── 풀이 가능 여부 검사 ─────────────────────────────────────────────────────

function permutationParity(perm) {
  const visited = new Array(perm.length).fill(false);
  let parity = 0;
  for (let i = 0; i < perm.length; i++) {
    if (!visited[i]) {
      let len = 0, j = i;
      while (!visited[j]) { visited[j] = true; j = perm[j]; len++; }
      if (len % 2 === 0) parity ^= 1;
    }
  }
  return parity;
}

// 큐브 상태 풀이 가능 조건:
// 1) 엣지 방향 합 % 2 === 0
// 2) 코너 방향 합 % 3 === 0
// 3) 코너 치환 홀짝 === 엣지 치환 홀짝
function isSolvable(pd) {
  const eSum = pd.EDGES.orientation.reduce((a, b) => a + b, 0);
  if (eSum % 2 !== 0) return false;
  const cSum = pd.CORNERS.orientation.reduce((a, b) => a + b, 0);
  if (cSum % 3 !== 0) return false;
  return permutationParity(pd.CORNERS.pieces) === permutationParity(pd.EDGES.pieces);
}

// U/D 면만 4×4=16 조합 시도.
// 옆면(R/F/L/B)은 항상 "하양(U)이 위"로 촬영하도록 안내하므로 회전 시도 제외.
// 옆면까지 임의 회전하면 물리적으로 잘못된 상태를 "유효"로 오인할 수 있음.
export function findSolvableKPatternData(faces) {
  for (let uR = 0; uR < 4; uR++) {
    for (let dR = 0; dR < 4; dR++) {
      const pd = facesToKPatternData({
        ...faces,
        U: rotateFaceN(faces.U, uR),
        D: rotateFaceN(faces.D, dR),
      });
      if (pd && isSolvable(pd)) return pd;
    }
  }
  return null;
}

// ── faces → KPatternData 변환. 유효하지 않은 faces이면 null 반환. ──────────
export function facesToKPatternData(faces) {
  const cPieces = [], cOrient = [];
  for (const [[f0,i0],[f1,i1],[f2,i2]] of CORNER_SLOTS) {
    const c = [faces[f0][i0], faces[f1][i1], faces[f2][i2]];
    const pi = CORNER_MAP.get([...c].sort().join(""));
    if (pi === undefined) return null;
    cPieces.push(pi);
    cOrient.push(CORNER_HOME[pi].indexOf(c[0]));
  }
  const ePieces = [], eOrient = [];
  for (const [[f0,i0],[f1,i1]] of EDGE_SLOTS) {
    const c0 = faces[f0][i0], c1 = faces[f1][i1];
    const pi = EDGE_MAP.get([c0, c1].sort().join(""));
    if (pi === undefined) return null;
    ePieces.push(pi);
    eOrient.push(EDGE_HOME[pi][0] === c0 ? 0 : 1);
  }
  return {
    EDGES:   { pieces: ePieces, orientation: eOrient },
    CORNERS: { pieces: cPieces, orientation: cOrient },
    CENTERS: { pieces: [0,1,2,3,4,5], orientation: [0,0,0,0,0,0], orientationMod: [1,1,1,1,1,1] },
  };
}

// faces → 스크램블 알고리즘 문자열. cubing/search를 사용해 현재 상태 → 솔루션을 찾고 역산.
export async function getScrambleAlg(faces) {
  // 16가지 U/D 회전 조합 중 풀이 가능한 상태를 자동으로 선택
  const patternData = findSolvableKPatternData(faces);
  if (!patternData) return null;
  try {
    const { cube3x3x3 } = await import("cubing/puzzles");
    const { KPattern } = await import("cubing/kpuzzle");
    const { experimentalSolve3x3x3IgnoringCenters } = await import("cubing/search");
    const kpuzzle = await cube3x3x3.kpuzzle();
    const kpattern = new KPattern(kpuzzle, patternData);
    const solution = await experimentalSolve3x3x3IgnoringCenters(kpattern);
    return solution.invert().toString();
  } catch (err) {
    console.error("[cubeConverter] getScrambleAlg 실패:", err);
    return null;
  }
}
