import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "core-backend",
          include: [
            "packages/core/src/**/*.test.ts",
            "packages/backend/src/**/*.test.ts",
          ],
          environment: "node",
        },
      },
      {
        test: {
          name: "frontend",
          include: [
            "packages/frontend/src/**/*.test.ts",
            "packages/frontend/src/**/*.test.tsx",
          ],
          environment: "jsdom",
          globals: true,
          setupFiles: ["packages/frontend/src/test/setup.ts"],
        },
      },
    ],
  },
});
