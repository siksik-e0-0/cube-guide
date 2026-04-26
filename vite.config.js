import { defineConfig } from "vite";
import { execSync } from "child_process";

function getBuildMeta() {
  try {
    const hash = execSync("git rev-parse --short HEAD").toString().trim();
    // 빌드 시각을 KST(UTC+9)로 표시
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString().slice(0, 16).replace("T", " ");
    return { hash, time: `${kst} KST` };
  } catch {
    return { hash: "unknown", time: new Date().toISOString().slice(0, 16) };
  }
}

const { hash: BUILD_HASH, time: BUILD_TIME } = getBuildMeta();

// GitHub Pages 는 서브경로(`/cube-guide/`)에 올라가므로, 프로덕션 빌드에서만 base 를 바꿔 준다.
// 로컬 dev 서버는 그대로 `/` 에서 돌아간다.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/cube-guide/" : "/",
  define: {
    __BUILD_HASH__: JSON.stringify(BUILD_HASH),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  build: {
    // cubing/search 의 Web Worker가 top-level await를 사용하므로 ES2022+ 필요
    target: "es2022",
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.js"],
      exclude: ["src/main.js"],
      // 순수 함수(data/, util/)는 80%+ 필수.
      // DOM 컴포넌트는 Playwright E2E 로 보완 — 전체 임계값은 완화.
      thresholds: {
        "src/data/**": { lines: 90, functions: 90, branches: 85 },
        "src/util/**": { lines: 90, functions: 90, branches: 85 },
      },
    },
  },
}));
