import type { PollingResult } from "./wait-notify-center";

function prefix(): string {
	const now = new Date();
	const timeStr = `${now.toTimeString().substring(0, 8)}.${now.getMilliseconds().toString().padStart(3, "0")}`;

	return `LOG ${timeStr} `;
}

const onResponse = async (res: Response) => {
	const json: PollingResult = await res.json();
	console.info(
		`${prefix()} fetch: ${json.code} ${json.data ? JSON.stringify(json.data) : ""}`,
	);
	startFetch();
};

const onError = (err: unknown) => {
	console.error(`${prefix()} fetch: ${String(err)}`);
};

const startFetch = () => {
	fetch("http://localhost:4321/api/wait").then(onResponse).catch(onError);
};

startFetch();
