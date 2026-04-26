# cube-guide

초등학교 3학년도 **혼자** 따라할 수 있도록 만든 3x3 루빅스 큐브 가이드 웹사이트.
기호(R, U, F…) 대신 **색깔 있는 3D 애니메이션 + 음성 읽기**로 설명합니다.

## 실행하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다.

### 빌드 / 미리보기

```bash
npm run build
npm run preview
```

## 기능

- **튜토리얼**: 인트로 3장 + 데이지 공법 8단계 슬라이드
- **3D 큐브 애니메이션**: 각 단계별 알고리즘을 cubing.js로 시각화
- **큐브 스캐너**: 카메라로 6면을 찍으면 현재 상태를 분석해 맞춤 가이드 제공
- **맞춤 가이드**: 스캔한 큐브 상태 기준으로 현재 단계와 다음 알고리즘 안내
- **음성 읽기(TTS)**: 각 단계 완료 시 안내 음성 재생
- **진행 상태 저장**: localStorage로 단계별 체크 유지

## 폴더 구조

```
src/
├─ main.js                진입점
├─ data/
│  ├─ steps.js            슬라이드 콘텐츠 (인트로 3 + 데이지 8단계)
│  └─ moves.js            큐브 기호 → 한국어 라벨
├─ components/            UI 컴포넌트
│  ├─ slideshow.js        슬라이드쇼 컨트롤러
│  ├─ stepCard.js         단계 카드 렌더러 (3D 큐브 포함)
│  ├─ scanner.js          카메라 스캐너 + 색상 인식
│  ├─ personalGuide.js    맞춤 가이드 모달
│  ├─ progress.js         단계 완료 상태 관리
│  └─ speech.js           TTS 음성 읽기
├─ lib/
│  ├─ cubeConverter.js    faces → KPatternData 변환 + 스크램블 알고리즘 생성
│  ├─ cubeState.js        면 색상 상수 및 유틸
│  ├─ lblAnalyzer.js      큐브 상태 분석 (단계 판별)
│  └─ lblGuide.js         단계별 가이드 생성
└─ styles/                토큰 · 레이아웃 · 컴포넌트 CSS
```

## 배포 (GitHub Pages)

`main` 브랜치에 머지되면 `.github/workflows/deploy-pages.yml` 이 자동으로 빌드 → 업로드합니다.
**최초 1회만** 저장소 설정에서 Pages를 켜 주세요:

1. 저장소 → **Settings** → **Pages**
2. **Source**: "GitHub Actions" 선택
3. `main` 브랜치로 머지하거나 Actions 탭에서 "Deploy to GitHub Pages" 를 수동 실행
4. 배포 끝나면 `https://siksik-e0-0.github.io/cube-guide/` 로 접속 가능

> 비공개 저장소의 경우 GitHub Pro 이상 플랜에서만 Pages 사용 가능.
> 공개로 전환하면 Free 플랜에서도 사용 가능합니다.

## 크레딧

- 3D 큐브: [cubing.js](https://js.cubing.net/cubing/) — MPL-2.0
- 글꼴: [Pretendard](https://github.com/orioncactus/pretendard)
- 알고리즘: 데이지 공법 (GanCube 공식 가이드 기반)
