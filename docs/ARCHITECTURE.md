# cube-guide 아키텍처 문서

## 1. 프로젝트 개요

**목적:** 초등 3학년도 혼자 따라할 수 있는 3×3 루빅스 큐브 가이드 웹앱  
**방법:** 데이지 공법 8단계 + 카메라 스캔 기반 맞춤 가이드  
**기술 스택:** Vanilla JS (ES Modules) · Vite 5 · cubing.js 0.63 · Vitest 3

---

## 2. 계층 구조

```
┌─────────────────────────────────────────────────────┐
│  진입점          main.js                            │
│                  초기화·이벤트 연결·동적 임포트       │
├─────────────────────────────────────────────────────┤
│  UI 컴포넌트     components/                        │
│  (DOM 생성,      slideshow · stepCard · scanner     │
│   이벤트 처리)   personalGuide · progress · speech  │
├─────────────────────────────────────────────────────┤
│  비즈니스 로직   lib/                               │
│  (순수 함수)     cubeConverter · cubeState          │
│                  lblAnalyzer · lblGuide             │
├─────────────────────────────────────────────────────┤
│  정적 데이터     data/                              │
│                  steps.js · moves.js               │
├─────────────────────────────────────────────────────┤
│  DOM 유틸        util/dom.js   el() · qs() · qsa()  │
└─────────────────────────────────────────────────────┘
```

---

## 3. 파일 구조

```
src/
├── main.js                    진입점
├── data/
│   ├── steps.js               INTRO_STEPS(3) + MAIN_STEPS(8) 콘텐츠
│   └── moves.js               큐브 표기법 → 한국어 라벨
├── components/
│   ├── slideshow.js           슬라이드쇼 컨트롤러
│   ├── stepCard.js            단계 카드 렌더러 (3D 큐브 포함)
│   ├── scanner.js             카메라 스캔 + 색상 인식 + 검증
│   ├── personalGuide.js       맞춤 가이드 모달
│   ├── progress.js            진행 상태 (localStorage)
│   ├── speech.js              한국어 TTS 래퍼
│   ├── introSections.js       인트로 슬라이드 3개
│   ├── moveCard.js            알고리즘 토큰 카드
│   ├── moveSequence.js        알고리즘 시퀀스 플레이어
│   └── videoSlot.js           유튜브 임베드 슬롯 (미사용)
├── lib/
│   ├── cubeConverter.js       faces → KPatternData 변환 + 스크램블 알고리즘
│   ├── cubeState.js           색상 상수 · 검증 유틸
│   ├── lblAnalyzer.js         단계별 패턴 분석
│   └── lblGuide.js            단계별 맞춤 안내 생성
├── util/
│   └── dom.js                 함수형 DOM 헬퍼
├── styles/
│   ├── tokens.css             디자인 토큰 (색상·반경·그림자)
│   ├── main.css               전역 스타일
│   ├── layout.css             슬라이드쇼 레이아웃
│   ├── scanner.css            스캐너 모달
│   └── personalGuide.css      맞춤 가이드 모달
└── __tests__/                 Vitest 단위 테스트
```

---

## 4. 모듈 의존성

```
main.js
  ├── slideshow.js
  │   ├── stepCard.js ────── progress.js
  │   ├── introSections.js ─ moves.js
  │   └── speech.js
  └── scanner.js
      ├── cubeState.js
      ├── cubeConverter.js ── cubeState.js
      ├── lblAnalyzer.js
      └── personalGuide.js
          ├── cubeConverter.js
          ├── cubeState.js
          ├── lblAnalyzer.js
          └── lblGuide.js ─── lblAnalyzer.js

util/dom.js  ←  components/* (공통 사용)
```

**외부 의존성 (cubing.js)**

| 서브패키지 | 사용처 | 용도 |
|-----------|--------|------|
| `cubing/twisty` | main.js (동적) | `<twisty-player>` 3D 커스텀 엘리먼트 |
| `cubing/search` | main.js (동적), cubeConverter.js | Kociemba WASM 솔버 |
| `cubing/puzzles` | cubeConverter.js | `cube3x3x3` 퍼즐 정의 |
| `cubing/kpuzzle` | cubeConverter.js | `KPattern` 생성자 |

---

## 5. 데이터 흐름

### 5.1 튜토리얼 슬라이드쇼

```
[시작 버튼 클릭]
      ↓
slideshow.open()
      ↓
go(idx)  ←──────────────────────────────────────┐
  ├─ 지연 렌더링 (idx-1, idx, idx+1)             │
  ├─ CSS transform 슬라이드 이동                  │
  ├─ 3D 플레이어 일시정지                         │
  └─ dots 업데이트                               │
      ↓                                         │
[이전/다음 버튼 · 키보드 화살표 · 터치 스와이프] ──┘
      ↓
[완료 체크박스 클릭]
      ↓
setDone(stepId, true)
  ├─ localStorage 저장
  ├─ CustomEvent("progress-change") 발행
  ├─ 축하 애니메이션 + TTS 음성
  └─ dots 상태 즉시 반영
```

### 5.2 카메라 스캔 → 맞춤 가이드

```
[스캔 버튼 클릭]
      ↓
scanner.open()  →  getUserMedia()
      ↓
면별 촬영 × 6 (U → R → F → D → L → B)
  └─ sampleFaceColors() → nearestFace() → 9칸 그리드 표시
      ↓
showVerify()
  ├─ validateCubeState()        색상 개수·중심 검증 (L1~L2)
  ├─ findInvalidStickers()      코너·엣지 유효성 검증 (L3)
  └─ findSolvableKPatternData() 풀이 가능성 + 방향 보정 (L4)
      ↓ 검증 통과
[3D 가이드 버튼 클릭]
      ↓
personalGuide.open()
  ├─ getScrambleAlg(faces)
  │   ├─ quickScramble()   D/U 회전 조합 즉시 반환
  │   └─ Kociemba WASM     복잡한 상태 (3회 재시도)
  └─ renderStep(startStep)
      ├─ generateStepGuide()  맞춤 알고리즘 안내
      ├─ twisty-player 렌더링 (내 큐브 3D / 표준 3D)
      └─ 이전/다음 네비게이션
```

### 5.3 진행 상태 동기화

```
setDone(id, bool)
      ↓
localStorage["cubeGuide.progress.v1"] 업데이트
      ↓
CustomEvent("progress-change") → window
      ↓
onProgressChange 리스너 (slideshow dots, stepCard 체크박스)
```

---

## 6. 핵심 알고리즘

### 6.1 카메라 색상 샘플링

```
비디오 프레임 → 캔버스 드로우
      ↓
3×3 그리드 계산 (중앙 기준, startY 위쪽 오프셋)
      ↓
각 셀 중앙 블록(15% 반경) → RGB 평균
      ↓
nearestFace(r, g, b) : 유클리드 거리로 FACE_RGB 최근접 분류
```

**FACE_RGB 기준값**

| 면 | 색상 | RGB |
|----|------|-----|
| U | 흰색 | 255, 255, 255 |
| D | 노랑 | 255, 210, 0 |
| R | 빨강 | 185, 0, 0 |
| L | 주황 | 255, 89, 0 |
| F | 초록 | 0, 155, 72 |
| B | 파랑 | 0, 70, 173 |

### 6.2 faces → KPatternData 변환 (cubeConverter.js)

```
CORNER_SLOTS / EDGE_SLOTS 좌표표에서 3면(코너) · 2면(엣지) 색상 추출
      ↓
색상 조합 → 피스 ID + orientation 계산
      ↓
풀이 가능성 검증:
  · 엣지 orientation 합 % 2 === 0
  · 코너 orientation 합 % 3 === 0
  · 코너 치환 홀짝 === 엣지 치환 홀짝
      ↓
실패 시 16가지 U/D 회전 조합 탐색
+ 4방향 글로벌 회전 보정 (촬영 방향 오류 대응)
```

### 6.3 빠른 스크램블 (quickScramble)

WASM 솔버 없이 D/U 회전 조합만으로 풀이:

```
전제 조건 확인:
  · 모든 코너·엣지 orientation === 0
  · 중간층 엣지(8~11)가 홈에 위치
      ↓
D_PATTERNS × U_PATTERNS (4 × 4 = 16조합) 순차 매칭
      ↓
일치 시 알고리즘 문자열 즉시 반환 (모바일에서도 < 1ms)
일치 없으면 null → Kociemba WASM 폴백
```

### 6.4 지연 렌더링 (slideshow.js)

```
go(idx) 호출
  ↓
rendered[idx-1], rendered[idx], rendered[idx+1] 만 생성
나머지는 빈 셸 유지
  ↓
CSS transform translateX() 로 슬라이드 이동 (레이아웃 재계산 없음)
```

---

## 7. 상태 관리

| 상태 | 저장소 | 키 |
|------|--------|---|
| 단계 완료 여부 | localStorage | `cubeGuide.progress.v1` |
| TTS 토글 | localStorage | `cubeGuide.tts` |
| 스캔된 faces | 메모리 (scanner 클로저) | — |
| 스크램블 알고리즘 | 메모리 (personalGuide 클로저) | — |
| 현재 슬라이드 인덱스 | 메모리 (slideshow 클로저) | — |

컴포넌트 간 알림은 `CustomEvent("progress-change")`를 window에 발행해 처리.  
Redux·Zustand 같은 전역 스토어 없이 클로저 + 이벤트 버스 패턴으로 구성.

---

## 8. 검증 단계 (스캐너)

| 레벨 | 검증 내용 | 오류 시 처리 |
|------|-----------|-------------|
| L1 | 각 색상이 정확히 9개 | 해당 셀 빨간 테두리 |
| L2 | 6개 중심 스티커가 모두 다른 색 | 경고 메시지 |
| L3 | 코너·엣지 색상 조합 유효성 | 오류 셀 강조 |
| L4 | `findSolvableKPatternData` 통과 | "풀 수 없는 상태" 안내 |

---

## 9. 빌드·배포 구성

### vite.config.js 주요 설정

```js
base: "/cube-guide/"          // GitHub Pages 서브경로
target: "es2022"              // cubing/search top-level await
define: { __BUILD_HASH__, __BUILD_TIME__ }  // 빌드 메타데이터 주입
```

**커버리지 임계값**

| 경로 | lines/functions | branches |
|------|----------------|----------|
| `src/data/**` | 90% | 85% |
| `src/util/**` | 90% | 85% |
| `src/lib/**` | 80% | 75% |

### GitHub Actions (deploy-pages.yml)

```
push to main (또는 수동 실행)
  ↓
Node 20 + npm ci
  ↓
npm run build → dist/
  ↓
GitHub Pages 배포
  ↓
https://siksik-e0-0.github.io/cube-guide/
```

---

## 10. 테스트 현황

| 파일 | 대상 | 비고 |
|------|------|------|
| cubeConverter.test.js | cubeConverter.js | KPatternData 변환·풀이 가능성 |
| cubeState.test.js | cubeState.js | 색상 검증 |
| lblAnalyzer.test.js | lblAnalyzer.js | 단계별 패턴 분석 |
| lblGuide.test.js | lblGuide.js | 맞춤 안내 생성 |
| steps.test.js | data/steps.js | 데이터 구조 |
| moves.test.js | data/moves.js | 표기법 파싱 |
| progress.test.js | progress.js | localStorage 진행 상태 |
| speech.test.js | speech.js | TTS 제어 |
| dom.test.js | util/dom.js | DOM 헬퍼 함수 |

UI 컴포넌트(scanner, slideshow, personalGuide)는 DOM 렌더링 의존성으로 Playwright E2E 테스트 대상.

---

## 11. 주요 위험 요소

| 항목 | 위험 | 완화 |
|------|------|------|
| Kociemba WASM | 모바일 초기화 실패·타임아웃 | quickScramble 우선 시도 + 3회 재시도 |
| Web Speech API | 브라우저·OS별 지원 불일치 | 실패 시 silently 무시 |
| getUserMedia | HTTPS 필수 (HTTP에서 차단) | GitHub Pages는 HTTPS 기본 |
| cubing.js 업데이트 | KPatternData API 변경 가능 | `^0.63.3` 고정, orientationMod 제거 완료 |

---

## 12. 확장 포인트

| 확장 | 수정 위치 |
|------|-----------|
| 새 단계 추가 | `data/steps.js` MAIN_STEPS 배열 |
| 맞춤 안내 로직 | `lib/lblGuide.js` guideStepN() 추가 |
| 색상 인식 개선 | `components/scanner.js` nearestFace() |
| quickScramble 확장 | `lib/cubeConverter.js` OLL·PLL 룩업 테이블 |
| 다국어 지원 | 한국어 문자열 → i18n 맵 추출 |
