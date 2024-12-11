import { expect, test } from "vitest";
import {
	checkPackagesOutdated,
	findExtensionFiles,
	loadDependencies,
} from "./check-packages-outdated";

test("loadDependencies", () => {
	const deps = loadDependencies("package.json");
	expect(deps.astro.name).toBe("astro");
});

test("findExtensionFiles", () => {
	const exts = findExtensionFiles();
	expect(exts.length).toBe(2);
});

test("checkPackagesOutdated", () => {
	checkPackagesOutdated();
});
