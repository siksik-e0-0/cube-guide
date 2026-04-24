import { defineConfig } from "vite";

// GitHub Pages 는 서브경로(`/cube-guide/`)에 올라가므로, 프로덕션 빌드에서만 base 를 바꿔 준다.
// 로컬 dev 서버는 그대로 `/` 에서 돌아간다.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/cube-guide/" : "/",
}));
