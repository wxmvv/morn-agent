import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { getPackageDir } from "../src/config.ts";
import { getNewEntries, normalizeChangelogLinks, parseChangelog } from "../src/utils/changelog.ts";

const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function parse(markdown: string) {
	const dir = mkdtempSync(join(tmpdir(), "morn-changelog-"));
	dirs.push(dir);
	const file = join(dir, "CHANGELOG.md");
	writeFileSync(file, markdown);
	return parseChangelog(file);
}

describe("morn changelog", () => {
	it("ignores unreleased and invalid headers and sorts releases newest first", () => {
		const entries = parse("## [Unreleased]\nPending\n## [0.1.0]\nFirst\n## [0.2.0-beta.1]\nBeta\n## [0.2.0] - 2026-09-17\nStable\n## [0.3.0oops]\nInvalid");
		expect(entries.map(e => e.version)).toEqual(["0.2.0", "0.2.0-beta.1", "0.1.0"]);
		expect(entries[0].content).not.toContain("Invalid");
	});
	it("limits startup entries to the installed upgrade range, including prereleases", () => {
		const entries = parse("## [0.3.0]\nFuture\n## [0.2.0]\nStable\n## [0.2.0-beta.1]\nBeta\n## [0.1.0]\nFirst");
		expect(getNewEntries(entries, "0.1.0", "0.2.0-beta.1").map(e => e.version)).toEqual(["0.2.0-beta.1"]);
		expect(getNewEntries(entries, "0.2.0-beta.1", "0.2.0").map(e => e.version)).toEqual(["0.2.0"]);
		expect(getNewEntries(entries, "0.85.0", "0.2.0")).toEqual([]);
		expect(getNewEntries(entries, "invalid", "0.2.0")).toEqual([]);
	});
	it("resolves bundled links locally and preserves external links", () => {
		const markdown = "[Docs](docs/settings.md#offline) [Upstream](https://github.com/earendil-works/pi) [Anchor](#added)";
		expect(normalizeChangelogLinks(markdown, "0.1.0")).toBe(`[Docs](${pathToFileURL(join(getPackageDir(), "docs/settings.md")).href}#offline) [Upstream](https://github.com/earendil-works/pi) [Anchor](#added)`);
	});
	it("returns no entries for a missing changelog", () => {
		expect(parseChangelog(join(tmpdir(), "missing-morn-changelog", "CHANGELOG.md"))).toEqual([]);
	});
});
