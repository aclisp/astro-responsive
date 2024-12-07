import type { APIRoute } from "astro";
import { makeDirectusError } from "../../libs/directus-error";
import { directusHost, getAccessToken } from "../../libs/directus-transport";

export const ALL: APIRoute = async (ctx) => {
	const { path } = ctx.params;
	if (!path) {
		return new Response(null, { status: 400 });
	}

	const { method, body } = ctx.request;
	let token: string;
	try {
		token = await getAccessToken(ctx.cookies);
	} catch (err) {
		return new Response(
			JSON.stringify(makeDirectusError("UNAUTHORIZED", String(err))),
			{ status: 401 },
		);
	}
	let url = `${directusHost}/${path}`;
	const params = ctx.url.searchParams;
	if (params.size > 0) {
		url += `?${params}`;
	}
	const headers: Record<string, string> = {
		Authorization: `Bearer ${token}`,
	};
	if (method === "POST" || method === "PATCH" || method === "PUT") {
		headers["Content-Type"] = "application/json";
	}
	return fetch(url, { method, body, headers });
};
