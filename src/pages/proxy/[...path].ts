import type { APIRoute } from "astro";
import {
	type HttpResponse,
	httpGet,
	httpPost,
} from "../../libs/directus-transport";

export const ALL: APIRoute = async (ctx) => {
	const { path } = ctx.params;
	if (!path) {
		return new Response(null, { status: 400 });
	}

	const { method } = ctx.request;
	try {
		if (method === "GET") {
			const res = await httpGet(`/${path}`, {
				cookies: ctx.cookies,
				params: ctx.url.searchParams,
			});
			return new Response(JSON.stringify(res));
		}

		const data = await ctx.request.json();
		const res = await httpPost(`/${path}`, data, {
			method: method as unknown as "POST" | "PATCH" | "DELETE",
			cookies: ctx.cookies,
			params: ctx.url.searchParams,
		});
		return new Response(JSON.stringify(res));
	} catch (err) {
		const res: HttpResponse = { ok: false, msg: String(err) };
		return new Response(JSON.stringify(res));
	}
};
