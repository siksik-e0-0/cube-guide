import { el } from "../util/dom.js";
import { validateCubeState, getFaceHex, getFaceKo, FACE_ORDER as CUBE_FACE_ORDER } from "../lib/cubeState.js";

// WCA 표준 색 배치 기준 RGB 참조값
const COLOR_REF = {
  U: { rgb: [255, 255, 255], ko: "하양", hex: "#FFFFFF" },
  D: { rgb: [255, 210, 0],   ko: "노랑", hex: "#FFD200" },
  R: { rgb: [185, 0, 0],     ko: "빨강", hex: "#B90000" },
  L: { rgb: [255, 89, 0],    ko: "주황", hex: "#FF5900" },
  F: { rgb: [0, 155, 72],    ko: "초록", hex: "#009B48" },
  B: { rgb: [0, 70, 173],    ko: "파랑", hex: "#0046AD" },
};

// 스캔 순서: U → R → F → D → L → B (WCA 표준)
const FACE_ORDER = ["U", "R", "F", "D", "L", "B"];
const FACE_GUIDE = {
  U: "하양(흰색) 면을 위로 향하게 잡아요",
  R: "빨강 면이 정면으로 오도록 잡아요",
  F: "초록 면이 정면으로 오도록 잡아요",
  D: "노랑 면이 정면으로 오도록 잡아요",
  L: "주황 면이 정면으로 오도록 잡아요",
  B: "파랑 면이 정면으로 오도록 잡아요",
};

function nearestFace(r, g, b) {
  let best = "U", bestDist = Infinity;
  for (const [face, { rgb }] of Object.entries(COLOR_REF)) {
    const d = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (d < bestDist) { bestDist = d; best = face; }
  }
  return best;
}

function sampleFaceColors(video, canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const size = Math.min(canvas.width, canvas.height) * 0.62;
  const startX = (canvas.width - size) / 2;
  const startY = (canvas.height - size) / 2;
  const cell = size / 3;

  const colors = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = Math.round(startX + (col + 0.5) * cell);
      const y = Math.round(startY + (row + 0.5) * cell);
      const px = ctx.getImageData(x, y, 1, 1).data;
      colors.push(nearestFace(px[0], px[1], px[2]));
    }
  }
  return colors; // 9개 face 문자 배열
}

// 54개 스티커 → LBL 단계 감지 (하양 = U 기준)
function detectLBLStage(state) {
  // state: 배열 [U×9, R×9, F×9, D×9, L×9, B×9]
  const get = (face, i) => state[FACE_ORDER.indexOf(face) * 9 + i];
  const center = (face) => get(face, 4);

  // 단계 1: 하얀 십자가 (U 면 십자 + 옆면 정렬)
  const whiteCross = [1, 3, 5, 7].every(i => get("U", i) === center("U")) &&
    get("F", 1) === center("F") && get("R", 1) === center("R") &&
    get("B", 1) === center("B") && get("L", 1) === center("L");
  if (!whiteCross) return 1;

  // 단계 2: 하얀 층 전체 (U 면 + 옆면 위쪽 모서리)
  const whiteLayer = Array.from({ length: 9 }, (_, i) => get("U", i)).every(c => c === center("U")) &&
    [0, 2].every(i => get("R", i) === center("R") && get("F", i) === center("F") &&
                      get("L", i) === center("L") && get("B", i) === center("B"));
  if (!whiteLayer) return 2;

  // 단계 3: 가운데 층 (옆면 가운데 줄)
  const midLayer = [3, 5].every(i =>
    get("R", i) === center("R") && get("F", i) === center("F") &&
    get("L", i) === center("L") && get("B", i) === center("B")
  );
  if (!midLayer) return 3;

  // 단계 4: 노란 십자가 (D 면 십자)
  const yellowCross = [1, 3, 5, 7].every(i => get("D", i) === center("D"));
  if (!yellowCross) return 4;

  // 단계 5: 노란 면 전체
  const yellowFace = Array.from({ length: 9 }, (_, i) => get("D", i)).every(c => c === center("D"));
  if (!yellowFace) return 5;

  // 단계 6: 꼭짓점 위치
  const cornersOK = [0, 2, 6, 8].every(i =>
    get("R", i) === center("R") && get("F", i) === center("F") &&
    get("L", i) === center("L") && get("B", i) === center("B")
  );
  if (!cornersOK) return 6;

  // 단계 7: 모서리 위치
  const edgesOK = [1, 7].every(i =>
    get("R", i) === center("R") && get("F", i) === center("F") &&
    get("L", i) === center("L") && get("B", i) === center("B")
  );
  if (!edgesOK) return 7;

  return 0; // 완성!
}

function colorGrid(face9, { editable = false, onChange } = {}) {
  const grid = el("div", { class: "scan-grid" });
  face9.forEach((f, idx) => {
    const cell = el("div", {
      class: "scan-cell",
      style: `background:${COLOR_REF[f].hex}`,
      title: COLOR_REF[f].ko,
    });
    if (editable) {
      cell.style.cursor = "pointer";
      cell.addEventListener("click", () => {
        const faceKeys = Object.keys(COLOR_REF);
        const next = faceKeys[(faceKeys.indexOf(f) + 1) % faceKeys.length];
        face9[idx] = next;
        cell.style.background = COLOR_REF[next].hex;
        cell.title = COLOR_REF[next].ko;
        onChange?.(face9);
      });
    }
    grid.appendChild(cell);
  });
  return grid;
}

export function createScanner({ onJumpToStep } = {}) {
  let stream = null;
  const capturedFaces = {}; // { U: [9개], R: [9개], ... }
  let currentFaceIdx = 0;

  // --- DOM 구조 ---
  const overlay = el("div", { class: "scanner-overlay", hidden: true });
  const modal   = el("div", { class: "scanner-modal" });

  const header = el("div", { class: "scanner-header" });
  const closeBtn = el("button", {
    class: "scanner-close", type: "button", text: "✕",
    onClick: () => close(),
  });
  const stepLabel = el("div", { class: "scanner-step-label" });
  header.appendChild(stepLabel);
  header.appendChild(closeBtn);

  const guide = el("div", { class: "scanner-guide" });

  const videoWrap = el("div", { class: "scanner-video-wrap" });
  const video = el("video", { autoplay: "true", playsinline: "true", muted: "true" });
  video.muted = true; // Safari: setAttribute 만으로는 muted 프로퍼티가 동기화 안 되어 autoplay 차단될 수 있음
  const canvas = el("canvas", { class: "scanner-canvas-hidden" });
  const svgOverlay = el("div", { class: "scanner-svg-wrap" });
  videoWrap.append(video, canvas, svgOverlay);

  const captureBtn = el("button", {
    class: "btn btn-lg btn-yellow scanner-capture-btn",
    type: "button",
    text: "📷 이 면 찍기",
    onClick: () => doCapture(),
  });

  // 결과 표시 영역
  const resultArea = el("div", { class: "scanner-result", hidden: true });
  const confirmGrid = el("div", { class: "scanner-confirm" });
  const confirmHint = el("div", { class: "scanner-confirm-hint", text: "틀린 색이 있으면 탭해서 바꿔요." });
  const confirmBtn = el("button", {
    class: "btn btn-primary",
    type: "button",
    text: "확인 ▶",
    // onClick 없음 — doCapture()에서 onclick 프로퍼티로만 등록해 이중 호출 방지
  });
  resultArea.append(confirmGrid, confirmHint, confirmBtn);

  // 완성 결과 영역
  const finalArea = el("div", { class: "scanner-final", hidden: true });

  modal.append(header, guide, videoWrap, captureBtn, resultArea, finalArea);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // --- 유틸리티 ---
  function currentFace() { return FACE_ORDER[currentFaceIdx]; }

  function updateUI() {
    const face = currentFace();
    stepLabel.textContent = `${currentFaceIdx + 1} / 6 면`;
    guide.textContent = FACE_GUIDE[face];
    resultArea.hidden = true;
    videoWrap.hidden = false;
    captureBtn.hidden = false;
    finalArea.hidden = true;
  }

  function doCapture() {
    if (!video.srcObject || video.readyState < 2) {
      guide.textContent = "카메라가 준비 중이에요. 잠시 후 다시 눌러봐요.";
      return;
    }
    let detected;
    try {
      detected = sampleFaceColors(video, canvas);
    } catch {
      detected = Array(9).fill(currentFace());
    }
    let mutable = [...detected];
    confirmGrid.innerHTML = "";
    confirmGrid.appendChild(colorGrid(mutable, {
      editable: true,
      onChange: (updated) => { mutable = [...updated]; },
    }));
    videoWrap.hidden = true;
    captureBtn.hidden = true;
    resultArea.hidden = false;
    // confirmBtn 클릭 시 mutable 를 저장
    confirmBtn.onclick = () => {
      capturedFaces[currentFace()] = [...mutable];
      confirmFace();
    };
  }

  function confirmFace() {
    if (!capturedFaces[currentFace()]) {
      capturedFaces[currentFace()] = Array(9).fill(currentFace()); // fallback
    }
    currentFaceIdx++;
    if (currentFaceIdx >= FACE_ORDER.length) {
      showVerify();
    } else {
      updateUI();
      resultArea.hidden = true;
      videoWrap.hidden = false;
      captureBtn.hidden = false;
    }
  }

  function showVerify() {
    videoWrap.hidden = true;
    captureBtn.hidden = true;
    resultArea.hidden = true;
    finalArea.hidden = false;
    finalArea.innerHTML = "";

    // 편집 가능한 작업 사본
    const faceCopy = {};
    for (const face of FACE_ORDER) faceCopy[face] = [...capturedFaces[face]];

    const hint = el("div", { class: "scanner-guide", text: "스티커 색이 내 큐브와 맞는지 확인하세요. 틀리면 탭해서 바꿀 수 있어요." });

    // 십자 레이아웃 (U / L F R B / D)
    const cross = el("div", { class: "scanner-cross" });
    const faceKeys = Object.keys(getFaceHex.__map__ || {});

    function makeFaceGrid(face) {
      const wrap = el("div", { class: `scanner-cross-face scanner-cross-${face.toLowerCase()}` });
      const grid = el("div", { class: "scan-grid scan-grid-sm" });
      faceCopy[face].forEach((code, idx) => {
        const cell = el("div", {
          class: "scan-cell",
          style: `background:${getFaceHex(code)}`,
          title: getFaceKo(code),
        });
        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => {
          const allFaces = CUBE_FACE_ORDER;
          const next = allFaces[(allFaces.indexOf(faceCopy[face][idx]) + 1) % allFaces.length];
          faceCopy[face][idx] = next;
          cell.style.background = getFaceHex(next);
          cell.title = getFaceKo(next);
          renderValidation();
        });
        grid.appendChild(cell);
      });
      const label = el("div", { class: "scan-face-label", text: face });
      wrap.appendChild(grid);
      wrap.appendChild(label);
      return wrap;
    }

    for (const face of CUBE_FACE_ORDER) {
      cross.appendChild(makeFaceGrid(face));
    }

    // 검증 결과 표시 영역
    const validationEl = el("div", { class: "scanner-validation" });

    const proceedBtn = el("button", {
      class: "btn btn-primary btn-lg",
      type: "button",
      text: "이 큐브로 시작하기 ▶",
    });

    function renderValidation() {
      validationEl.innerHTML = "";
      const result = validateCubeState(faceCopy);
      if (result.valid) {
        validationEl.appendChild(el("div", { class: "scan-valid", text: "✅ 유효한 큐브 상태예요!" }));
        proceedBtn.disabled = false;
        proceedBtn.style.opacity = "1";
      } else {
        result.errors.forEach(err => {
          validationEl.appendChild(el("div", { class: "scan-error-item", text: `❌ ${err}` }));
        });
        proceedBtn.disabled = true;
        proceedBtn.style.opacity = "0.4";
      }
    }

    proceedBtn.onclick = () => {
      for (const face of FACE_ORDER) capturedFaces[face] = [...faceCopy[face]];
      showResult();
    };

    finalArea.append(hint, cross, validationEl, proceedBtn);
    renderValidation();
  }

  function showResult() {
    videoWrap.hidden = true;
    captureBtn.hidden = true;
    resultArea.hidden = true;
    finalArea.hidden = false;
    finalArea.innerHTML = "";

    // 54개 state 배열 조립: U R F D L B 순
    const state = FACE_ORDER.flatMap(f => capturedFaces[f] || Array(9).fill(f));
    const stage = detectLBLStage(state);

    const msg = el("div", { class: "scan-result-msg" });
    if (stage === 0) {
      msg.innerHTML = "<div class='big'>🎉 큐브가 이미 완성됐어요!</div>";
    } else {
      msg.innerHTML = `
        <div class='scan-result-title'>스캔 완료!</div>
        <div class='scan-result-step'>
          <span class='big-num'>${stage}</span>단계부터 시작하면 돼요.
        </div>
      `;
      const jumpBtn = el("button", {
        class: "btn btn-primary btn-lg",
        type: "button",
        text: `${stage}단계로 이동하기 ▶`,
        onClick: () => {
          close();
          onJumpToStep?.(stage);
        },
      });
      finalArea.appendChild(msg);
      finalArea.appendChild(jumpBtn);
      return;
    }
    finalArea.appendChild(msg);
  }

  async function open() {
    currentFaceIdx = 0;
    Object.keys(capturedFaces).forEach(k => delete capturedFaces[k]);
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    updateUI();
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      video.srcObject = stream;
    } catch {
      guide.textContent = "카메라를 사용할 수 없어요. 브라우저 권한을 확인해주세요.";
      captureBtn.hidden = true;
    }
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  return { open, close };
}
