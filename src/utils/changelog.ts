import path from "node:path";
import { pathToFileURL } from "node:url";
import { compare, parse, valid } from "semver";
import { getPackageDir, VERSION } from "../config.ts";
import { existsSync, readFileSync } from "fs";

export interface ChangelogEntry {
	version?: string;
	major: number;
	minor: number;
	patch: number;
	content: string;
}

const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const INLINE_MARKDOWN_LINK_RE = /(!?\[[^\]\n]+\]\()([^\s)]+)((?:\s+[^)]*)?\))/g;

function entryVersion(entry: ChangelogEntry): string {
	return entry.version ?? `${entry.major}.${entry.minor}.${entry.patch}`;
}

/** Resolve bundled documentation locally without assuming a repository or release tag. */
export function normalizeChangelogLinks(markdown: string, _version: string | ChangelogEntry): string {
	return markdown.replace(INLINE_MARKDOWN_LINK_RE, (_match, prefix, target: string, suffix) => {
		if (target.startsWith("#") || target.startsWith("//") || URL_SCHEME_RE.test(target)) {
			return `${prefix}${target}${suffix}`;
		}
		const parts = /^([^?#]*)(.*)$/.exec(target)!;
		const url = pathToFileURL(path.resolve(getPackageDir(), parts[1])).href;
		return `${prefix}${url}${parts[2]}${suffix}`;
	});
}

/**
 * Parse changelog entries from CHANGELOG.md
 * Scans for ## lines and collects content until next ## or EOF
 */
export function parseChangelog(changelogPath: string): ChangelogEntry[] {
	if (!existsSync(changelogPath)) {
		return [];
	}

	try {
		const content = readFileSync(changelogPath, "utf-8");
		const lines = content.split("\n");
		const entries: ChangelogEntry[] = [];

		let currentLines: string[] = [];
		let currentVersion: Omit<ChangelogEntry, "content"> | null = null;

		for (const line of lines) {
			// Check if this is a version header (## [x.y.z] ...)
			if (line.startsWith("## ")) {
				// Save previous entry if exists
				if (currentVersion && currentLines.length > 0) {
					entries.push({
						...currentVersion,
						content: currentLines.join("\n").trim(),
					});
				}

				// Try to parse version from this line
				const versionMatch = line.match(/^##\s+(?:\[([^\]]+)\]|(\S+))(?:\s|$)/);
				const version = parse(versionMatch?.[1] ?? versionMatch?.[2] ?? "");
				if (version) {
					currentVersion = {
						version: version.version,
						major: version.major,
						minor: version.minor,
						patch: version.patch,
					};
					currentLines = [line];
				} else {
					// Reset if we can't parse version
					currentVersion = null;
					currentLines = [];
				}
			} else if (currentVersion) {
				// Collect lines for current version
				currentLines.push(line);
			}
		}

		// Save last entry
		if (currentVersion && currentLines.length > 0) {
			entries.push({
				...currentVersion,
				content: currentLines.join("\n").trim(),
			});
		}

		return entries.sort((a, b) => compareVersions(b, a));
	} catch (error) {
		console.error(`Warning: Could not parse changelog: ${error}`);
		return [];
	}
}

/**
 * Compare versions. Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: ChangelogEntry, v2: ChangelogEntry): number {
	return compare(entryVersion(v1), entryVersion(v2));
}

/** Only show released entries newer than the last seen version and at most the installed version. */
export function getNewEntries(
	entries: ChangelogEntry[],
	lastVersion: string,
	currentVersion: string = VERSION,
): ChangelogEntry[] {
	if (!valid(lastVersion) || !valid(currentVersion)) return [];
	return entries.filter((entry) => {
		const version = entryVersion(entry);
		return compare(version, lastVersion) > 0 && compare(version, currentVersion) <= 0;
	});
}

// Re-export getChangelogPath from paths.ts for convenience
export { getChangelogPath } from "../config.ts";
