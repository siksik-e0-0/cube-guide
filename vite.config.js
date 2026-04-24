import { defineConfig } from "vite";

// GitHub Pages 는 서브경로(`/cube-guide/`)에 올라가므로, 프로덕션 빌드에서만 base 를 바꿔 준다.
// 로컬 dev 서버는 그대로 `/` 에서 돌아간다.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/cube-guide/" : "/",
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
