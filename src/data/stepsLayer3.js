// Layer3 = 3번째 층(마지막 층) 4단계
// 비디오 참고: "Solve the Last Layer / Third Layer - Only 4 moves to learn"
// 앞 두 층이 이미 완성된 상태에서 시작

import { INTRO_STEPS } from "./steps.js";

export const MAIN_STEPS_L3 = [
  {
    id: "l3-step1",
    kind: "step",
    no: 1,
    title: "노란 십자 만들기",
    subtitleEn: "Yellow Cross",
    bubble: "노란 면 위에 노란 '+' 모양을 만들어요. 공식 한 가지를 상태에 따라 반복해요!",
    orientation: "노란 면이 위.",
    displayRotation: "x2",
    algorithm: "F R U R' U' F'",
    setupAlg: "F U R U' R' F'",
    tips: [
      "공식: F R U R' U' F'",
      "점(Dot): 아무 방향으로 잡고 공식 반복.",
      "ㄴ자(Hook): 노란색이 12시·9시 위치가 되도록 윗면 돌린 후 시작.",
      "일자(Bar): 노란 줄이 가로(ㅡ) 방향이 되도록 두고 시작.",
      "점 → ㄴ자 → 일자 → 십자 순서로 바뀌어요.",
    ],
    checkpoint: "위에서 보면 노란 '+' 모양이 보여요!",
    videoYoutubeId: "",
  },
  {
    id: "l3-step2",
    kind: "step",
    no: 2,
    title: "십자 옆면 색 맞추기",
    subtitleEn: "Yellow Edge Permutation",
    bubble: "십자는 완성됐지만 옆면 센터 색과 안 맞는 경우예요. 맞는 모서리를 뒤·오른쪽에 두고 공식!",
    orientation: "노란 면이 위. 완성된 면을 뒤로.",
    displayRotation: "x2",
    algorithm: "R U' R U R U R U' R' U' R2",
    setupAlg: "R2 U R U R' U' R' U' R' U R'",
    tips: [
      "윗면을 돌려서 옆면 색이 센터와 맞는 모서리를 찾아요.",
      "인접한 경우: 맞는 두 모서리를 뒤(12시)·오른쪽(3시)에 두고 공식.",
      "마주보는 경우: 임의 방향에서 공식 1회 → 인접한 경우로 변환 → 다시 공식.",
      "공식: R U' R U R U R U' R' U' R2",
    ],
    checkpoint: "노란 모서리 4개가 모두 올바른 자리에 있어요!",
    videoYoutubeId: "",
  },
  {
    id: "l3-step3",
    kind: "step",
    no: 3,
    title: "노란 꼭짓점 자리 잡기",
    subtitleEn: "Yellow Corner Permutation",
    bubble: "이미 제 위치인 꼭짓점을 오른쪽 앞(5시)에 두고 공식! 나머지 3개가 이동해요.",
    orientation: "노란 면이 위.",
    displayRotation: "x2",
    algorithm: "U R U' L' U R' U' L",
    setupAlg: "L' U R U' L U R' U'",
    tips: [
      "4개의 꼭짓점 중 이미 제 위치인 조각을 찾아 오른쪽 앞(5시)으로 이동해요.",
      "공식: U R U' L' U R' U' L",
      "기준 조각은 고정, 나머지 3개 위치만 서로 바뀌어요.",
      "제 위치인 꼭짓점이 없으면 1회 실행 후 다시 찾아요.",
    ],
    checkpoint: "꼭짓점 4개가 모두 올바른 자리에 있어요!",
    videoYoutubeId: "",
  },
  {
    id: "l3-step4",
    kind: "step",
    no: 4,
    title: "완성! 꼭짓점 방향 맞추기",
    subtitleEn: "Yellow Corner Orientation (Final!)",
    bubble: "노란 면을 아래로 뒤집어요. 틀린 꼭짓점을 오른쪽 앞(5시)에 두고 공식 반복!",
    orientation: "노란 면을 아래로 뒤집어요. 한 면이 자신을 향하게.",
    displayRotation: "",
    algorithm: "R' D' R D",
    setupAlg: "D' R' D R",
    tips: [
      "노란면을 아래로 뒤집어 잡아요.",
      "상황①: 노란 스티커가 앞면 → 공식(R' D' R D) 2번",
      "상황②: 노란 스티커가 옆면 → 공식(R' D' R D) 4번",
      "★ 꼭짓점이 맞춰지면 큐브 전체를 돌리지 말고 D(아래)만 돌려 다음 꼭짓점을 5시 자리로 이동해요.",
      "앞 두 층이 흐트러지지만, 모든 꼭짓점이 완성되면 자동 복원돼요!",
    ],
    checkpoint: "큐브 완성! 🎉",
    videoYoutubeId: "",
    isFinal: true,
  },
];

export const ALL_STEPS_L3 = [...INTRO_STEPS, ...MAIN_STEPS_L3];
