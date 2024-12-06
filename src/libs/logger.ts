import { LOG_LEVEL } from "astro:env/client";

const LEVEL_ERROR = 0;
const LEVEL_WARN = 1;
const LEVEL_INFO = 2;
const LEVEL_DEBUG = 3;
const logLevel = LOG_LEVEL;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logDebug(msg: string, ...args: any[]) {
	if (logLevel >= LEVEL_DEBUG) console.debug(prefix() + msg, ...args);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logInfo(msg: string, ...args: any[]) {
	if (logLevel >= LEVEL_INFO) console.info(prefix() + msg, ...args);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logWarn(msg: string, ...args: any[]) {
	if (logLevel >= LEVEL_WARN) console.warn(prefix() + msg, ...args);
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function logError(msg: string, ...args: any[]) {
	if (logLevel >= LEVEL_ERROR) console.error(prefix() + msg, ...args);
}

function prefix(): string {
	const now = new Date();
	const timeStr = `${now.toTimeString().substring(0, 8)}.${now.getMilliseconds().toString().padStart(3, "0")}`;

	return `LOG ${timeStr} `;
}
