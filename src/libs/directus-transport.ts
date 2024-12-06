import type { AstroCookies } from "astro";
import { DIRECTUS_HOST } from "astro:env/server";
import { decodeBase64Url } from "./base64url";
import { directusErrorMessage } from "./directus-error-message";
import { joseDecrypt, joseEncrypt } from "./jose-encrypt";
import { logDebug, logInfo } from "./logger";

export type LoginResponse = {
	access_token: string;
	refresh_token: string;
	expires: number;
};

export type HttpRequestOptions = {
	method?: "POST" | "PATCH" | "DELETE";
	cookies?: AstroCookies;
	noAuthorizationHeader?: boolean;
	accessToken?: string | null;
	params?: URLSearchParams;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	mapResponse?: (json: any) => any;
};

export type HttpResponse = {
	ok: boolean;
	msg: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	[key: string]: any;
};

export class NeedLoginError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "NeedLoginError";
	}
}

export async function getAccessToken(cookies: AstroCookies) {
	const auth = await getToken(cookies);
	return auth.access_token;
}

export async function getRefreshToken(cookies: AstroCookies) {
	const auth = await getToken(cookies);
	return auth.refresh_token;
}

export async function saveToken(cookies: AstroCookies, login: LoginResponse) {
	const auth = new AuthenticationData(login);
	await auth.toCookie(cookies);
	logDebug(`SAVE token until ${auth.expires_date}`);
}

export function resetToken(cookies: AstroCookies) {
	AuthenticationData.reset(cookies);
}

export async function httpPost(
	path: string,
	data: object,
	options: HttpRequestOptions,
): Promise<HttpResponse> {
	const t0 = performance.now();
	let {
		method = "POST",
		cookies,
		noAuthorizationHeader = false,
		accessToken,
		params,
		mapResponse,
	} = options;
	logDebug(`${method} ${path}`);

	if (accessToken === undefined && cookies) {
		accessToken = await getAccessToken(cookies);
	}

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (!noAuthorizationHeader) {
		if (!accessToken) {
			throw new Error(`missing access token: ${accessToken}`);
		}
		headers.Authorization = `Bearer ${accessToken}`;
	}

	let url = directusHost + path;
	if (params) {
		url += `?${params}`;
	}

	const res = await fetch(url, {
		body: JSON.stringify(data),
		headers: headers,
		method,
	});
	logInfo(
		`${method} ${path} ${res.status} ${(performance.now() - t0).toFixed(0)}ms (${res.headers.get("X-Request-ID")})`,
	);
	if (res.status < 200 || res.status > 299) {
		return failure(res);
	}
	return success(res, mapResponse);
}

export async function httpGet(
	path: string,
	options: HttpRequestOptions,
): Promise<HttpResponse> {
	const t0 = performance.now();
	let {
		cookies,
		noAuthorizationHeader = false,
		accessToken,
		params,
		mapResponse,
	} = options;
	logDebug(`GET ${path}`);

	if (accessToken === undefined && cookies) {
		accessToken = await getAccessToken(cookies);
	}

	const headers: Record<string, string> = {};
	if (!noAuthorizationHeader) {
		if (!accessToken) {
			throw new Error(`missing access token: ${accessToken}`);
		}
		headers.Authorization = `Bearer ${accessToken}`;
	}

	let url = directusHost + path;
	if (params) {
		url += `?${params}`;
	}

	const res = await fetch(url, {
		headers: headers,
		method: "GET",
	});
	logInfo(
		`GET ${path} ${res.status} ${(performance.now() - t0).toFixed(0)}ms (${res.headers.get("X-Request-ID")})`,
	);
	if (res.status < 200 || res.status > 299) {
		return failure(res);
	}
	return success(res, mapResponse);
}

export function debugRefreshInProgressMap() {
	return refreshInProgressMap.size;
}

const directusHost = DIRECTUS_HOST;

class AuthenticationData {
	static key = "astro_session_token";
	_access_token = "";
	_refresh_token = "";
	/** UTC milliseconds when this value expires */
	_expires_at = 0;

	constructor(login?: LoginResponse) {
		if (login) {
			this._access_token = login.access_token;
			this._refresh_token = login.refresh_token;
			this._expires_at = Date.now() + login.expires;
		}
	}

	static async fromCookie(
		cookies: AstroCookies,
	): Promise<AuthenticationData | null> {
		const data = cookies.get(AuthenticationData.key);
		if (!data) return null;

		const decrypted = await joseDecrypt(data.value);
		if (!decrypted) return null;

		const object = JSON.parse(decrypted);
		const auth = new AuthenticationData();
		auth._access_token = object.a;
		auth._refresh_token = object.r;
		auth._expires_at = object.e;
		return auth;
	}

	async toCookie(cookies: AstroCookies) {
		const data = JSON.stringify({
			a: this._access_token,
			r: this._refresh_token,
			e: this._expires_at,
		});
		const encrypted = await joseEncrypt(data);
		cookies.set(AuthenticationData.key, encrypted, {
			httpOnly: true,
			sameSite: "strict",
			maxAge: 604800,
			path: "/",
		});
	}

	static reset(cookies: AstroCookies) {
		cookies.delete(AuthenticationData.key);
	}

	get expires_at() {
		return this._expires_at;
	}

	get refresh_token() {
		return this._refresh_token;
	}

	get access_token() {
		return this._access_token;
	}

	get expires_date() {
		return new Date(this.expires_at).toLocaleString();
	}
}

/**
 * A Map from userId to Promise of AuthenticationData
 */
const refreshInProgressMap = new Map<string, Promise<AuthenticationData>>();

async function waitForRefresh(userId: string) {
	const refreshInProgress = refreshInProgressMap.get(userId);
	if (!refreshInProgress) {
		throw new Error("no refresh in progress");
	}

	try {
		return await refreshInProgress;
	} finally {
		refreshInProgressMap.delete(userId);
	}
}

function refresh(auth: AuthenticationData, cookies: AstroCookies) {
	const refreshPromise = async () => {
		const refresh_token = auth.refresh_token;
		const loginResult = await _refresh(refresh_token);
		if (loginResult.ok) {
			const auth = new AuthenticationData(
				loginResult as unknown as LoginResponse,
			);
			await auth.toCookie(cookies);
			logDebug(`SAVE token until ${auth.expires_date}`);
			return auth;
		}
		throw new NeedLoginError("refresh failure");
	};

	const userId = decodeUserId(auth.access_token);
	refreshInProgressMap.set(userId, refreshPromise());
}

async function _refresh(refresh_token: string) {
	return await httpPost(
		"/auth/refresh",
		{
			refresh_token,
			mode: "json",
		},
		{
			noAuthorizationHeader: true,
			accessToken: null,
		},
	);
}

async function getToken(cookies: AstroCookies) {
	const auth = await AuthenticationData.fromCookie(cookies);
	if (!auth) {
		throw new NeedLoginError("never login");
	}

	const expires_at = auth.expires_at;
	if (expires_at < Date.now() + 30000) {
		const userId = decodeUserId(auth.access_token);
		const refreshInProgress = refreshInProgressMap.get(userId);
		if (refreshInProgress) {
			return await waitForRefresh(userId);
		}

		refresh(auth, cookies);
		return await waitForRefresh(userId);
	}

	return auth;
}

function decodeUserId(token: string): string {
	const decoded = jwtDecode(token);
	return decoded.id;
}

function jwtDecode(token: string) {
	try {
		const p = token.split(".")[1];
		const d = decodeBase64Url(p);
		const s = new TextDecoder().decode(d);
		return JSON.parse(s);
	} catch (e) {
		throw new Error(`Invalid token specified: ${e}`);
	}
}

async function failure(res: Response): Promise<HttpResponse> {
	const json = await res.json();
	const detail = directusErrorMessage(json);
	return {
		ok: false,
		msg: detail || `${res.status} ${res.statusText}`,
	};
}

async function success(
	res: Response,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	mapResponse?: (json: any) => any,
): Promise<HttpResponse> {
	if (res.status === 204) {
		return {
			ok: true,
			msg: "204 No Content",
		};
	}

	const json = await res.json();

	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let data;
	if (mapResponse) {
		data = mapResponse(json);
	} else if (typeof json === "object" && json && "data" in json) {
		data = Array.isArray(json.data) ? json : json.data;
	} else {
		data = json;
	}

	return {
		ok: true,
		msg: `${res.status} OK`,
		...data,
	};
}
