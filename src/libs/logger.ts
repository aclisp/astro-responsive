// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logDebug(msg: string, ...args: any[]) {
	console.debug(prefix() + msg, ...args);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logInfo(msg: string, ...args: any[]) {
	console.info(prefix() + msg, ...args);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logWarn(msg: string, ...args: any[]) {
	console.warn(prefix() + msg, ...args);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logError(msg: string, ...args: any[]) {
	console.error(prefix() + msg, ...args);
}

function prefix(): string {
	const now = new Date();
	const timeStr = `${now.toTimeString().substring(0, 8)}.${now.getMilliseconds().toString().padStart(3, "0")}`;

	return `LOG ${timeStr} `;
}
