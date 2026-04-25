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

// faces → KPatternData 변환. 유효하지 않은 faces이면 null 반환.
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
  const patternData = facesToKPatternData(faces);
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
