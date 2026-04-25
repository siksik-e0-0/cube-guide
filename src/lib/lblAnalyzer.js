// 스캔 방향 규칙 기반 D면 좌표 (이번 Phase 2 테스트로 정합성 검증):
// D[0]=DFL D[1]=DF D[2]=DFR
// D[3]=DL  D[4]=DC D[5]=DR
// D[6]=DBL D[7]=DB D[8]=DBR

// Step 4: 노란 십자 패턴 감지
// D면(노란면) 엣지 4개의 색 확인 → dot / L / bar / cross
export function analyzeStep4(faces) {
  const df = faces.D[1] === "D";
  const dl = faces.D[3] === "D";
  const dr = faces.D[5] === "D";
  const db = faces.D[7] === "D";
  const count = [df, dl, dr, db].filter(Boolean).length;

  if (count === 4) return { pattern: "cross" };
  if (count === 0) return { pattern: "dot" };
  if (count === 2) {
    if ((df && db) || (dl && dr)) return { pattern: "bar" };
    return { pattern: "L" };
  }
  return { pattern: "dot" };
}

// Step 5: 노란 코너 중 D면을 향한(위를 보는) 개수
// D면 코너: D[0]=DFL D[2]=DFR D[6]=DBL D[8]=DBR
export function analyzeStep5(faces) {
  const yellowUpCount = [faces.D[0], faces.D[2], faces.D[6], faces.D[8]]
    .filter(c => c === "D").length;
  return { yellowUpCount };
}

// Step 6: 옆면 스티커 2개가 모두 해당 면 가운데 색인 코너 탐색
// 코너 스티커 좌표:
//   DFR → F[8], R[6]   DFL → F[6], L[8]
//   DBR → B[6], R[8]   DBL → B[8], L[6]
export function analyzeStep6(faces) {
  const candidates = [
    { name: "DFR", ok: () => faces.F[8] === faces.F[4] && faces.R[6] === faces.R[4] },
    { name: "DFL", ok: () => faces.F[6] === faces.F[4] && faces.L[8] === faces.L[4] },
    { name: "DBR", ok: () => faces.B[6] === faces.B[4] && faces.R[8] === faces.R[4] },
    { name: "DBL", ok: () => faces.B[8] === faces.B[4] && faces.L[6] === faces.L[4] },
  ];
  return { solvedCorners: candidates.filter(c => c.ok()).map(c => c.name) };
}

// Step 7: 옆면 스티커가 해당 면 가운데 색인 엣지 탐색
// 엣지 스티커 좌표:
//   DF → F[7]   DR → R[7]   DB → B[7]   DL → L[7]
export function analyzeStep7(faces) {
  const candidates = [
    { name: "DF", ok: () => faces.F[7] === faces.F[4] },
    { name: "DR", ok: () => faces.R[7] === faces.R[4] },
    { name: "DB", ok: () => faces.B[7] === faces.B[4] },
    { name: "DL", ok: () => faces.L[7] === faces.L[4] },
  ];
  return { solvedEdges: candidates.filter(e => e.ok()).map(e => e.name) };
}

// 단계별 현재 상태를 한국어로 요약
export function getStepStateText(stage, faces) {
  if (stage === 4) {
    const { pattern } = analyzeStep4(faces);
    const ko = { dot: "점 (노란 엣지 0개)", L: "ㄴ자 모양", bar: "선 모양", cross: "십자 완성" };
    return `노란 십자 현재 상태: ${ko[pattern]}`;
  }
  if (stage === 5) {
    const { yellowUpCount } = analyzeStep5(faces);
    return `노란 코너 ${yellowUpCount}개가 위를 보고 있어요`;
  }
  if (stage === 6) {
    const { solvedCorners } = analyzeStep6(faces);
    return solvedCorners.length === 0
      ? "제자리인 코너 없음 — 아무 방향으로 시작해요"
      : `제자리 코너: ${solvedCorners.join(", ")}`;
  }
  if (stage === 7) {
    const { solvedEdges } = analyzeStep7(faces);
    return solvedEdges.length === 0
      ? "제자리인 모서리 없음 — 먼저 알고리즘 한 번 실행해요"
      : `제자리 모서리: ${solvedEdges.join(", ")}`;
  }
  return null;
}
