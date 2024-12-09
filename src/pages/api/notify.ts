import type { APIRoute } from "astro";
import { waitNotifyCenter } from "../../libs/wait-notify-center";

export const POST: APIRoute = async ({ request }) => {
	const size = waitNotifyCenter.size;
	const data = await request.json();
	for (const resolve of waitNotifyCenter) {
		resolve({ code: "OK", data });
	}
	return new Response(JSON.stringify({ notified: size }));
};
