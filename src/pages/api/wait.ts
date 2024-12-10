import type { APIRoute } from "astro";
import {
	type PollingResult,
	type Resolve,
	waitNotifyCenter,
} from "../../libs/wait-notify-center";

export const GET: APIRoute = async ({ request }) => {
	const { promise, teardown } = setup(waitNotifyCenter);
	let res: PollingResult;
	try {
		res = await promise;
	} catch (err) {
		res = { code: "TRY_AGAIN", data: err };
	} finally {
		teardown();
	}
	return new Response(JSON.stringify(res));
};

interface Registry<T> {
	add(value: T): this;
	delete(value: T): boolean;
}
function setup<R extends Registry<Resolve<PollingResult>>>(
	registry: R,
): { promise: Promise<PollingResult>; teardown: () => void } {
	let resolve: Resolve<PollingResult> = () => {};
	const promise = new Promise<PollingResult>((res, rej) => {
		resolve = res;
	});
	registry.add(resolve);
	const timeout = setTimeout(() => {
		resolve({ code: "TRY_AGAIN" });
	}, 10000);
	return {
		promise,
		teardown: () => {
			clearTimeout(timeout);
			registry.delete(resolve);
		},
	};
}
