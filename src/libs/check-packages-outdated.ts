import fs from "node:fs";
import path from "node:path";

export type Category =
	| "dependencies"
	| "devDependencies"
	| "optionalDependencies"
	| "peerDependencies";

export type Dependency = {
	name: string;
	version: string;
	category: Category;
};

const DIRECTUS_HOME = "/Users/homerh/Code/directus15";

export function loadDependencies(path: string): Record<string, Dependency> {
	const res: Record<string, Dependency> = {};
	const json = JSON.parse(fs.readFileSync(path, "utf8"));
	const interestedFields: Category[] = [
		"dependencies",
		"devDependencies",
		"optionalDependencies",
		"peerDependencies",
	];
	for (const field of interestedFields) {
		const deps = json[field];
		if (!deps || typeof deps !== "object") continue;
		for (const name of Object.keys(deps)) {
			const dep: Dependency = { name, version: deps[name], category: field };
			res[name] = dep;
		}
	}
	return res;
}

export function findExtensionFiles(): string[] {
	const isDirectory = (fileName: string) => {
		return fs.lstatSync(fileName).isDirectory();
	};
	const folderPath = path.join(DIRECTUS_HOME, "extensions");
	return fs
		.readdirSync(folderPath, "utf8")
		.map((fileName) => path.join(folderPath, fileName))
		.filter(isDirectory)
		.map((dirName) => path.join(dirName, "package.json"));
}

function compare(
	deps: Record<string, Dependency>,
	canonical: Record<string, Dependency>,
) {
	const stringify = (dep: Dependency) =>
		`${dep.name}:${dep.version}:${dep.category}`;
	for (const [name, dep] of Object.entries(deps)) {
		if (dep.version === "workspace:*") {
			continue;
		}
		const canonicalDep = canonical[name];
		if (canonicalDep) {
			if (canonicalDep.version === dep.version) {
				console.log(`   - (match) ${stringify(dep)}`);
			} else {
				console.log(`   - (outdated) ${stringify(dep)}`);
			}
		} else {
			console.log(`   - (dangling) ${stringify(dep)}`);
		}
	}
}

export function checkPackagesOutdated() {
	const canonicalDeps = loadDependencies(
		path.join(DIRECTUS_HOME, "api", "package.json"),
	);
	const exts = findExtensionFiles();
	for (const ext of exts) {
		console.log(` * ${path.basename(path.dirname(ext))}`);
		const deps = loadDependencies(ext);
		compare(deps, canonicalDeps);
	}
}
