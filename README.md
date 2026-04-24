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
- 알고리즘 참고: GanCube 공식 Layer-by-Layer 가이드, Ruwix, J Perm
