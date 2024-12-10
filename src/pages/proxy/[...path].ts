import type { APIRoute } from "astro";
import { makeDirectusError } from "../../libs/directus-error";
import { directusHost, getAccessToken } from "../../libs/directus-transport";

export const ALL: APIRoute = async (ctx) => {
	const { path } = ctx.params;
	if (!path) {
		return new Response(null, { status: 400 });
	}

	const { method, body: requestBody } = ctx.request;
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
	const requestHeaders: Record<string, string> = {
		Authorization: `Bearer ${token}`,
	};
	if (method === "POST" || method === "PATCH" || method === "PUT") {
		requestHeaders["Content-Type"] = "application/json";
	}
	// The headers are immutable if the response is received from a fetch() call.
	// So we have to create a new Response that could be appended with a `Set-Cookie` header.
	const { body, status, statusText, headers } = await fetch(url, {
		method,
		body: requestBody,
		headers: requestHeaders,
	});
	return new Response(body, { status, statusText, headers });
};
