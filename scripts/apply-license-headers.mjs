/**
 * License Header Application Script
 * ==================================
 *
 * This script automatically applies standardized license headers to all JavaScript
 * files in the repository. It ensures consistent licensing information across the
 * codebase while preserving file structure (BOM, shebangs, etc.).
 *
 * USAGE
 * -----
 *   node scripts/apply-license-headers.mjs [OPTIONS]
 *
 * OPTIONS
 * -------
 *   --check       Check mode: Verify if files need license header updates without
 *                 modifying them. Exits with code 1 if updates are needed.
 *                 Useful for CI/CD pipelines to enforce license header compliance.
 *
 *   --dry-run     Dry run mode: Show which files would be updated without actually
 *                 modifying them. Useful for previewing changes before applying.
 *
 *   (no options)  Apply mode: Actually update files with license headers.
 *
 * EXAMPLES
 * --------
 *   # Apply license headers to all JavaScript files
 *   node scripts/apply-license-headers.mjs
 *
 *   # Preview changes without modifying files
 *   node scripts/apply-license-headers.mjs --dry-run
 *
 *   # Check if all files have up-to-date headers (for CI)
 *   node scripts/apply-license-headers.mjs --check
 *
 *   # Using package.json scripts (npm/pnpm/yarn)
 *   # (Add to your "scripts" section:)
 *   #
 *   #   "license:headers": "node ./scripts/apply-license-headers.mjs",
 *   #   "license:check": "node ./scripts/apply-license-headers.mjs --check"
 *   #
 *   # ...then run:
 *   #   npm run license:headers
 *   #   npm run license:check
 *   # or with pnpm:
 *   #   pnpm run license:headers
 *   #   pnpm run license:check
 *
 * BEHAVIOR
 * --------
 * - Scans the entire repository for .js files (excluding .mjs files)
 * - Automatically excludes common build/dependency directories:
 *   node_modules, dist, .git, .next, .cache, coverage, build, out, tmp, temp
 * - Preserves BOM (Byte Order Mark) if present
 * - Preserves shebang lines (#!/usr/bin/env node) if present
 * - Removes existing license headers before applying new ones (idempotent)
 * - Removes generic initial comment blocks before applying license header
 * - Ensures exactly one blank line between header and file content
 * - Skips this script itself (apply-license-headers.mjs)
 * - Skips files in dist/ directories (generated/bundled outputs)
 *
 * REQUIREMENTS
 * ------------
 * - Must be run from the repository root directory
 * - Requires package.json in the repository root (for project name)
 * - Requires scripts/LICENSE.js module with:
 *   - LICENSE_HEADER_START constant
 *   - LICENSE_HEADER_END constant
 *   - renderLicenseHeader() function
 * - Optionally looks for LICENSE-CODE and LICENSE-CONTENT files in repo root
 *
 * OUTPUT
 * ------
 * - Apply mode: Lists all files that were updated
 * - Dry-run mode: Lists all files that would be updated
 * - Check mode: Lists files needing updates (stderr) and exits with code 1 if any
 *
 * EXIT CODES
 * ----------
 *   0  Success (all files up to date or successfully updated)
 *   1  Error occurred or files need updates (in --check mode)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { LICENSE_HEADER_END, LICENSE_HEADER_START, renderLicenseHeader } from './LICENSE.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = process.cwd();

const DEFAULT_EXCLUDES = new Set([
	'node_modules',
	'dist',
	'.git',
	'.next',
	'.cache',
	'coverage',
	'build',
	'out',
	'tmp',
	'temp',
]);

const ARGS = new Set(process.argv.slice(2));
const IS_CHECK = ARGS.has('--check');
const IS_DRY_RUN = ARGS.has('--dry-run');

async function readPackageJson() {
	const pkgPath = path.join(repoRoot, 'package.json');
	const content = await fs.readFile(pkgPath, 'utf8');
	return JSON.parse(content);
}

async function fileExists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

async function readLicenseRefs() {
	const codeRef = 'LICENSE-CODE';
	const contentRef = 'LICENSE-CONTENT';
	const codePath = path.join(repoRoot, codeRef);
	const contentPath = path.join(repoRoot, contentRef);
	// Ensure they exist but we do not embed their content (keep header concise)
	const [codeExists, contentExists] = await Promise.all([fileExists(codePath), fileExists(contentPath)]);
	return {
		codeLicenseRef: codeExists ? codeRef : codeRef,
		contentLicenseRef: contentExists ? contentRef : contentRef,
	};
}

function splitBom(text) {
	if (text.startsWith('\uFEFF')) {
		return { bom: '\uFEFF', rest: text.slice(1) };
	}
	return { bom: '', rest: text };
}

function extractShebang(text) {
	if (text.startsWith('#!')) {
		const idx = text.indexOf('\n');
		if (idx !== -1) {
			return { shebang: text.slice(0, idx + 1), rest: text.slice(idx + 1) };
		}
		// whole file is shebang line (unlikely)
		return { shebang: text, rest: '' };
	}
	return { shebang: '', rest: text };
}

function hasOurHeaderAtTop(text) {
	const trimmed = text.trimStart();
	return trimmed.startsWith(LICENSE_HEADER_START);
}

function removeOurHeaderIfPresent(text) {
	const startIdx = text.indexOf(LICENSE_HEADER_START);
	if (startIdx !== -1) {
		const endMarker = LICENSE_HEADER_END;
		const endIdx = text.indexOf(endMarker, startIdx);
		if (endIdx !== -1) {
			const afterEnd = endIdx + endMarker.length;
			const tail = text.slice(afterEnd);
			// Remove following single trailing newline(s) after header
			return tail.replace(/^\r?\n+/, '');
		}
	}
	return text;
}

function removeInitialGenericComment(text) {
	let s = text;
	// Block comment at very top
	if (s.startsWith('/*')) {
		const end = s.indexOf('*/');
		if (end !== -1) {
			s = s.slice(end + 2);
			return s.replace(/^\s*\r?\n?/, '');
		}
	}
	// Consecutive line comments at top
	if (s.startsWith('//')) {
		const lines = s.split(/\r?\n/);
		let i = 0;
		while (i < lines.length && (lines[i].startsWith('//') || lines[i].trim() === '')) {
			i += 1;
		}
		s = lines.slice(i).join('\n');
		return s.replace(/^\s*\r?\n?/, '');
	}
	return s;
}

function ensureSingleBlankLineBetween(header, body) {
	const h = header.endsWith('\n') ? header : header + '\n';
	const trimmedBody = body.replace(/^\s+/, '');
	return h + '\n' + trimmedBody;
}

async function findAllJsFiles(dir) {
	const out = [];
	async function walk(current) {
		const entries = await fs.readdir(current, { withFileTypes: true });
		for (const e of entries) {
			if (e.isDirectory()) {
				if (DEFAULT_EXCLUDES.has(e.name)) continue;
				await walk(path.join(current, e.name));
			} else if (e.isFile()) {
				if (e.name.endsWith('.js')) {
					out.push(path.join(current, e.name));
				}
			}
		}
	}
	await walk(dir);
	return out;
}

async function processFile(filePath, headerText) {
	const original = await fs.readFile(filePath, 'utf8');
	const { bom, rest: noBom } = splitBom(original);
	const { shebang, rest: noShebang } = extractShebang(noBom);

	let body = noShebang;
	// Remove our header if present first (idempotency)
	body = removeOurHeaderIfPresent(body);
	// Else remove a generic initial comment block/run if present
	if (!hasOurHeaderAtTop(noShebang)) {
		body = removeInitialGenericComment(body);
	}

	const newContent = bom + shebang + ensureSingleBlankLineBetween(headerText, body);
	const changed = newContent !== original;
	if (!changed) return { changed: false };
	if (IS_CHECK || IS_DRY_RUN) {
		return { changed: true };
	}
	await fs.writeFile(filePath, newContent, 'utf8');
	return { changed: true };
}

async function main() {
	const pkg = await readPackageJson();
	const { codeLicenseRef, contentLicenseRef } = await readLicenseRefs();

	const header = renderLicenseHeader({
		projectName: pkg.name,
		year: new Date().getFullYear(),
		codeLicenseRef,
		contentLicenseRef,
	});

	const jsFiles = await findAllJsFiles(repoRoot);
	// Skip generated/bundled outputs under dist just in case
	const filtered = jsFiles.filter((p) => !p.includes(`${path.sep}dist${path.sep}`));

	const changedFiles = [];
	for (const fp of filtered) {
		const rel = path.relative(repoRoot, fp);
		// Skip this script itself and template (this script is .mjs, template is .js)
		if (rel === path.join('scripts', 'apply-license-headers.mjs')) continue;
		const res = await processFile(fp, header);
		if (res.changed) changedFiles.push(rel);
	}

	if (IS_CHECK) {
		if (changedFiles.length > 0) {
			console.error(`License headers need updates in ${changedFiles.length} file(s):`);
			for (const f of changedFiles) console.error(` - ${f}`);
			process.exitCode = 1;
		} else {
			console.log('All license headers are up to date.');
		}
	} else if (IS_DRY_RUN) {
		if (changedFiles.length > 0) {
			console.log(`Would update ${changedFiles.length} file(s):`);
			for (const f of changedFiles) console.log(` - ${f}`);
		} else {
			console.log('No changes needed.');
		}
	} else {
		if (changedFiles.length > 0) {
			console.log(`Updated ${changedFiles.length} file(s).`);
			for (const f of changedFiles) console.log(` - ${f}`);
		} else {
			console.log('No files required updates.');
		}
	}
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
