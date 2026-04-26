# cube-guide 소스 리뷰 & 아키텍처 분석

> 작성일: 2026-04-26  
> 검토 범위: `src/` 전체 (JS 14개 파일, CSS 7개 파일, 테스트 10개 파일)

---

## 1. 아키텍처 개요

```
main.js (진입점)
├── components/slideshow.js       슬라이드쇼 (10슬라이드)
│   ├── components/stepCard.js    단계 카드 (3D 플레이어, 동영상)
│   ├── components/introSections.js  인트로 3슬라이드
│   └── components/moveSequence.js   알고리즘 카드 렌더
│       └── components/moveCard.js   낱개 이동 카드
└── components/scanner.js         카메라 스캔 모달
    ├── lib/cubeState.js           색상 검증 (L1·L2)
    ├── lib/cubeConverter.js       KPattern 변환 + parity (L3)
    ├── lib/lblAnalyzer.js         LBL 단계 감지
    ├── lib/lblGuide.js            단계별 가이드 생성
    └── components/personalGuide.js  3D 개인 가이드 모달
        ├── lib/cubeConverter.js   스크램블 알고리즘 생성
        ├── lib/lblAnalyzer.js
        └── lib/lblGuide.js

유틸리티
└── util/dom.js          경량 DOM 빌더 (el, qs, qsa)

데이터
├── data/steps.js        10개 단계 정의 (INTRO_STEPS, MAIN_STEPS)
└── data/moves.js        WCA 색상 + 이동 메타 + SVG 다이어그램

공유 상수 (단일 진실 원천)
└── lib/cubeState.js     FACE_ORDER, FACE_RGB, getFaceHex(), getFaceKo()
```

**핵심 데이터 흐름 (스캔 → 개인 가이드)**

```
카메라 → sampleFaceColors() → nearestFace() (FACE_RGB 사용)
  → validateCubeState() [L1: 색상 수, L2: 센터]
  → findSolvableKPatternData() [L3: parity]
  → detectLBLStage() → generateStepGuide()
  → createPersonalGuide() → getScrambleAlg() [async, cubing.js]
```

---

## 2. 파일별 규모

| 파일 | 줄 수 | 역할 |
|------|------:|------|
| `components/scanner.js` | 457 | 카메라 스캔 전체 파이프라인 |
| `lib/cubeConverter.js` | 235 | KPattern 변환, parity 검사 |
| `components/personalGuide.js` | 216 | 3D 개인 가이드 모달 |
| `lib/lblGuide.js` | 222 | 단계별 가이드 텍스트 |
| `components/slideshow.js` | 199 | 슬라이드쇼 |
| `data/steps.js` | 197 | 단계 데이터 |
| `components/stepCard.js` | 166 | 단계 카드 UI |
| `components/introSections.js` | 152 | 인트로 슬라이드 |
| `lib/lblAnalyzer.js` | 83 | LBL 단계 감지 |
| `lib/cubeState.js` | 74 | 색상 상수 + 검증 |
| `components/moveSequence.js` | 62 | 알고리즘 카드 렌더 |
| `data/moves.js` | 118 | 이동 메타 + SVG |
| `util/dom.js` | 25 | DOM 빌더 |
| 테스트 10개 합산 | 1,229 | — |

---

## 3. 이번 세션 적용 최적화 (완료)

### 3-1. CRITICAL: 중복 색상 상수 통합

**이전**: `scanner.js`에 `COLOR_REF` 객체로 hex·ko·rgb 세 가지를 중복 정의.  
`cubeState.js`에는 `FACE_HEX`, `FACE_KO` 이미 존재.

**이후**: `cubeState.js`에 `FACE_RGB` export 추가.  
`scanner.js`는 `getFaceHex()`, `getFaceKo()`, `FACE_RGB`를 import 사용.

```js
// cubeState.js — 단일 진실 원천
export const FACE_RGB = {
  U: [255, 255, 255], D: [255, 210, 0], R: [185, 0, 0],
  L: [255, 89, 0],   F: [0, 155, 72],  B: [0, 70, 173],
};
```

### 3-2. HIGH: 중복 FACE_ORDER import alias 제거

**이전**: `FACE_ORDER as CUBE_FACE_ORDER` import + 로컬 `FACE_ORDER` 재정의.  
같은 값이 두 이름으로 공존 → 혼동 유발.

**이후**: 단일 `import { FACE_ORDER }` 사용, 로컬 재정의 삭제.

### 3-3. HIGH: showResult() innerHTML 템플릿 → el() DOM 빌더

**이전**: 내부 computed 문자열을 `msg.innerHTML = \`...\`` 로 주입.  
패턴 자체가 XSS 위험을 열어놓는 구조.

**이후**: 전부 `el()` DOM 빌더로 교체.

```js
// 이후 방식 (el() 빌더)
msg.appendChild(el("div", { class: "scan-result-title", text: "스캔 완료!" }));
msg.appendChild(el("div", { class: "scan-result-step" }, [
  el("span", { class: "big-num", text: String(stage) }),
  el("span", { text: "단계부터 시작하면 돼요." }),
]));
```

### 3-4. 데드코드 제거: 사용하지 않는 faceKeys

`showVerify()` 내 `const faceKeys = Object.keys(getFaceHex.__map__ || {})` 라인 삭제.  
`getFaceHex.__map__`은 존재하지 않는 프로퍼티로 빈 배열만 반환하고 이후 참조 없음.

---

## 4. 남아있는 이슈

### MEDIUM — scanner.js 크기 (457줄)

`createScanner()` 단일 함수가 DOM 구성·상태 관리·캡처·검증·결과 렌더를 모두 담당.  
현재는 동작 이상 없으나 테스트 격리가 어렵고 인지 부하가 높음.

**권장**: 향후 별도 세션에서 `FaceCapture`, `VerificationUI`, `ResultDisplay`로 분리.  
현재는 breaking change 범위가 넓어 보류.

### MEDIUM — cubeConverter.js 탐색 복잡도

`findSolvableKPatternData()`: U/D 16조합 × 전체 회전 4 = 64회 KPattern 생성.  
각 회전에서 내부 loop 16회 추가 → 최악 O(1024) 변환.  
오프라인 사용이므로 현재 허용 범위. 조기 종료 최적화 시 개선 가능.

### MEDIUM — personalGuide.js async open() 오류 가시성

`getScrambleAlg()`가 null 반환 시 2D 폴백은 동작하지만, 실패 원인이 콘솔에만 남음.  
사용자는 왜 "표준 3D"가 표시되는지 모름. `⚠️ 변환 실패` 배너는 이미 있음(양호).

### LOW — 빈 catch 블록 (의도적 silent fail)

```js
try { player.timestamp = 0; player.play(); } catch {}
```

카메라/플레이어 제어 실패는 UX 상 silent fail이 적절.  
단, 디버깅 시 원인 파악이 어려우므로 개발 환경에서만 `console.warn` 추가 고려.

### LOW — 매직 넘버

```js
const size = Math.min(canvas.width, canvas.height) * 0.62; // 그리드 크기 비율
const r = Math.max(2, Math.round(cell * 0.15));             // 샘플링 반경
```

값 자체는 실험적으로 검증된 수치. 상수로 추출하면 튜닝 시 가독성 향상.

---

## 5. 테스트 현황

| 테스트 파일 | 케이스 수 |
|-------------|----------:|
| `lblAnalyzer.test.js` | 29 |
| `cubeConverter.test.js` | 15 |
| `lblGuide.test.js` | 21 |
| `cubeState.test.js` | 11 |
| `steps.test.js` | 20 |
| `moves.test.js` | 19 |
| `dom.test.js` | 15 |
| `progress.test.js` | 11 |
| `speech.test.js` | 11 |
| `videoSlot.test.js` | 8 |
| **합계** | **160** |

커버리지 기준: `src/data/**` 및 `src/util/**` 90% lines/functions.  
컴포넌트 레이어(scanner, personalGuide 등)는 현재 E2E 대상.

---

## 6. 빌드 결과

```
dist/assets/index-*.js          16.92 kB (gzip 6.89 kB)  ← 앱 코드
dist/assets/twisty-dynamic-3d   511 kB                   ← cubing.js 3D (WASM)
dist/assets/twips_wasm_bg       704 kB                   ← cubing.js WASM
```

cubing.js WASM 청크가 500 kB를 초과하나 이는 외부 라이브러리로 제어 불가.  
앱 자체 번들(16.92 kB gzip)은 목표 범위 내.

---

## 7. 종합 평가

| 항목 | 상태 | 비고 |
|------|------|------|
| 아키텍처 분리 | ✅ | lib/pure + components/UI 명확 분리 |
| 단일 진실 원천 | ✅ | 이번 세션에 COLOR_REF 통합 완료 |
| DRY | ✅ | 중복 상수 제거 완료 |
| XSS 패턴 | ✅ | showResult() el() 리팩터 완료 |
| 테스트 | ✅ | 160/160 통과 |
| 빌드 | ✅ | 오류 없음 |
| scanner.js 크기 | ⚠️ | 457줄, 분리 권장 (향후) |
| 타입 안전 | ⚠️ | Vanilla JS, JSDoc 미비 |
| 매직 넘버 | ℹ️ | 실험 검증값, 상수화 권장 |
