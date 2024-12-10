import type { APIRoute } from "astro";
import { makeDirectusError } from "../../libs/directus-error";
import { directusHost, getAccessToken } from "../../libs/directus-transport";
import { logDebug, logInfo } from "../../libs/logger";

export const ALL: APIRoute = async (ctx) => {
	const t0 = performance.now();
	const { path } = ctx.params;
	const { method, body: requestBody } = ctx.request;
	logDebug(`${method} /${path}`);
	if (!path) {
		const status = 400;
		logInfo(
			`${method} /${path} ${status} ${(performance.now() - t0).toFixed(0)}ms`,
		);
		return new Response(null, { status });
	}

	let token: string;
	try {
		token = await getAccessToken(ctx.cookies);
	} catch (err) {
		const status = 401;
		logInfo(
			`${method} /${path} ${status} ${(performance.now() - t0).toFixed(0)}ms`,
		);
		return new Response(
			JSON.stringify(makeDirectusError("UNAUTHORIZED", String(err))),
			{ status },
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
	logInfo(
		`${method} /${path} ${status} ${(performance.now() - t0).toFixed(0)}ms (${headers.get("X-Request-ID")})`,
	);
	return new Response(body, { status, statusText, headers });
};
