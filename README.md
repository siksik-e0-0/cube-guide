# cube-guide

초등학교 3학년도 **혼자** 따라할 수 있도록 만든 3x3 루빅스 큐브 가이드 웹사이트.
기호(R, U, F…) 대신 **색깔 있는 동작 카드 + 3D 애니메이션 + 음성 읽기**로 설명합니다.

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

## 영상 튜토리얼 넣는 법 (보호자용)

`src/data/steps.js` 파일을 열고, 각 단계의 `videoYoutubeId` 자리에
YouTube 영상 ID(예: `https://youtu.be/**abcDEF12345**` 에서 `abcDEF12345`)를
넣으면 해당 단계 카드에 영상이 자동으로 나타납니다.

```js
{
  id: "step1",
  ...
  videoYoutubeId: "abcDEF12345", // ← 여기
}
```

## 폴더 구조

```
src/
├─ main.js                진입점
├─ data/
│  ├─ steps.js            10개 단계(인트로 3 + 풀이 7) 콘텐츠
│  └─ moves.js            큐브 기호 → 한국어 라벨 + SVG 다이어그램
├─ components/            UI 컴포넌트(순수 함수 + DOM)
└─ styles/                토큰 · 레이아웃 · 컴포넌트 CSS
```

## 크레딧

- 3D 큐브: [cubing.js](https://js.cubing.net/cubing/) — MPL-2.0
- 글꼴: [Pretendard](https://github.com/orioncactus/pretendard)
- 알고리즘 참고: GanCube 공식 Layer-by-Layer 가이드, Ruwix, J Perm
