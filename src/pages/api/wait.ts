import type { APIRoute } from "astro";
import {
	type PollingResult,
	type Resolve,
	waitNotifyCenter,
} from "../../libs/wait-notify-center";

export const GET: APIRoute = async ({ request }) => {
	let resolve: Resolve<PollingResult> = () => {};
	const promise = new Promise<PollingResult>((res, rej) => {
		resolve = res;
	});
	waitNotifyCenter.add(resolve);
	const timeout = setTimeout(() => {
		resolve({ code: "TRY_AGAIN" });
	}, 10000);
	try {
		const res = await promise;
		return new Response(JSON.stringify(res));
	} catch (err) {
		const res: PollingResult = { code: "TRY_AGAIN", data: err };
		return new Response(JSON.stringify(res), { status: 500 });
	} finally {
		clearTimeout(timeout);
		waitNotifyCenter.delete(resolve);
	}
};
