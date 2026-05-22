import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      // an example of file based convention,
      // you don't have to follow it
      name: "e2e",
      environment: "node",
      setupFiles: ["./setup.node.ts"],
      include: ["test/*.{test,spec}.ts"],
    },
  },
]);
