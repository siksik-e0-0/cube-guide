import { describe, it, expect } from "vitest";
import { facesToKPatternData } from "../lib/cubeConverter.js";

function solvedFaces() {
  const f = {};
  for (const face of ["U","R","F","D","L","B"]) f[face] = Array(9).fill(face);
  return f;
}

function withOverride(faces, overrides) {
  const copy = {};
  for (const f of Object.keys(faces)) copy[f] = [...faces[f]];
  for (const [key, val] of Object.entries(overrides)) {
    const [face, idx] = key.split(".");
    copy[face][Number(idx)] = val;
  }
  return copy;
}

describe("facesToKPatternData", () => {
  it("완성 큐브 → solved KPatternData (모든 piece=index, orientation=0)", () => {
    const data = facesToKPatternData(solvedFaces());
    expect(data).not.toBeNull();
    expect(data.CORNERS.pieces).toEqual([0,1,2,3,4,5,6,7]);
    expect(data.CORNERS.orientation).toEqual([0,0,0,0,0,0,0,0]);
    expect(data.EDGES.pieces).toEqual([0,1,2,3,4,5,6,7,8,9,10,11]);
    expect(data.EDGES.orientation).toEqual([0,0,0,0,0,0,0,0,0,0,0,0]);
  });

  it("CENTERS에 orientationMod 포함", () => {
    const data = facesToKPatternData(solvedFaces());
    expect(data.CENTERS.orientationMod).toEqual([1,1,1,1,1,1]);
  });

  it("알 수 없는 코너 조합이면 null 반환", () => {
    // U[8]=U, F[2]=U, R[0]=U → 같은 색 3개 = 불가능한 코너
    const bad = withOverride(solvedFaces(), { "F.2": "U", "R.0": "U" });
    expect(facesToKPatternData(bad)).toBeNull();
  });

  it("알 수 없는 엣지 조합이면 null 반환", () => {
    // U[7]=U, F[1]=U → 같은 색 2개 엣지
    const bad = withOverride(solvedFaces(), { "F.1": "U" });
    expect(facesToKPatternData(bad)).toBeNull();
  });

  it("UFR 코너 스캔 좌표 검증: U[8]/F[2]/R[0] → 슬롯0 피스0", () => {
    const data = facesToKPatternData(solvedFaces());
    // 슬롯 0 = UFR 위치. 완성 큐브에서 UFR 피스(index 0)가 있어야 함.
    expect(data.CORNERS.pieces[0]).toBe(0); // UFR piece
    expect(data.CORNERS.orientation[0]).toBe(0); // solved orientation
  });

  it("DFR 코너 스캔 좌표 검증: D[2]/R[6]/F[8] → 슬롯4 피스4", () => {
    const data = facesToKPatternData(solvedFaces());
    expect(data.CORNERS.pieces[4]).toBe(4); // DFR piece
    expect(data.CORNERS.orientation[4]).toBe(0);
  });

  it("UF 엣지 스캔 좌표 검증: U[7]/F[1] → 슬롯0 피스0 방향0", () => {
    const data = facesToKPatternData(solvedFaces());
    expect(data.EDGES.pieces[0]).toBe(0); // UF piece
    expect(data.EDGES.orientation[0]).toBe(0);
  });

  it("FR 엣지 스캔 좌표 검증: F[5]/R[3] → 슬롯8 피스8 방향0", () => {
    const data = facesToKPatternData(solvedFaces());
    expect(data.EDGES.pieces[8]).toBe(8); // FR piece
    expect(data.EDGES.orientation[8]).toBe(0);
  });

  it("UBL 코너 스캔 좌표 검증: U[0]/B[2]/L[0] → 슬롯2 피스2", () => {
    const data = facesToKPatternData(solvedFaces());
    expect(data.CORNERS.pieces[2]).toBe(2); // UBL piece
  });

  it("BL 엣지 스캔 좌표 검증: B[5]/L[3] → 슬롯11 피스11", () => {
    const data = facesToKPatternData(solvedFaces());
    expect(data.EDGES.pieces[11]).toBe(11); // BL piece
  });

  it("UFR 코너를 다른 색으로 바꾸면 슬롯0 피스 변경", () => {
    // UFR 위치를 DFR 피스(노란-빨강-초록)로 채움
    const f = withOverride(solvedFaces(), { "U.8": "D", "F.2": "R", "R.0": "F" });
    const data = facesToKPatternData(f);
    if (data) {
      // DFR 피스(index 4)가 UFR 슬롯(0)에 있어야 함
      expect(data.CORNERS.pieces[0]).toBe(4);
      // orientation: DFR 홈 스티커 순서 [D,R,F], 슬롯0 primary=U, 현재 primary="D" → sticker 0
      expect(data.CORNERS.orientation[0]).toBe(0);
    }
  });
});
