import { execSync } from "node:child_process";

function brewLeaves(): string[] {
	const stdout = execSync("brew leaves");
	return stdout
		.toString()
		.split("\n")
		.filter((line) => line.trim() !== "");
}

function brewOutdated(): string[] {
	const stdout = execSync("HOMEBREW_NO_AUTO_UPDATE=1 brew outdated --verbose");
	return stdout
		.toString()
		.split("\n")
		.filter((line) => line.trim() !== "");
}

// May trigger brew's automatically update
execSync("brew outdated");

const outdated = brewOutdated();
const leaves = brewLeaves();
for (const leave of leaves) {
	for (const outdatedItem of outdated) {
		if (outdatedItem.startsWith(`${leave}`)) {
			console.log(outdatedItem);
		}
	}
}
