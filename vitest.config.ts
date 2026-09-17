import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		testTimeout: 30000,
		env: { MORN_OFFLINE: "1" },
		unstubEnvs: true,
		exclude: ["**/node_modules/**", "**/dist/**", "**/*.e2e.test.ts"],
	},
	resolve: {
		alias: [
			{ find: "@wxmvv/morn-agent", replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
			{ find: "morn-agent", replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
			{ find: /^@earendil-works\/pi-coding-agent$/, replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
			{ find: /^@mariozechner\/pi-ai\/oauth$/, replacement: "@earendil-works/pi-ai/oauth" },
			{ find: /^@mariozechner\/pi-ai$/, replacement: "@earendil-works/pi-ai" },
			{ find: /^@mariozechner\/pi-agent-core$/, replacement: "@earendil-works/pi-agent-core" },
			{ find: /^@mariozechner\/pi-tui$/, replacement: "@earendil-works/pi-tui" },
		],
	},
});
