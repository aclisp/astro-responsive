import type { AuthenticationData, AuthenticationStorage } from "@directus/sdk";
import { authentication, createDirectus, rest } from "@directus/sdk";
import type { AstroCookies } from "astro";
import { joseDecrypt, joseEncrypt } from "./jose-encrypt";

const cookieStorage = (cookies: AstroCookies) => {
	const key = "astro-directus-auth";
	const get = async () => {
		const cookie = cookies.get(key);
		if (!cookie) return null;
		const decrypted = await joseDecrypt(cookie.value);
		if (!decrypted) return null;
		return JSON.parse(decrypted) as AuthenticationData;
	};
	const set = async (value: AuthenticationData | null) => {
		const data = JSON.stringify(value);
		const encrypted = await joseEncrypt(data);
		cookies.set(key, encrypted, { httpOnly: true });
	};
	return { get, set } as AuthenticationStorage;
};

function _createDirectus(cookies: AstroCookies) {
	// A carefully crafted directus client that supports SSR.
	return createDirectus("http://127.0.0.1:8055")
		.with(
			authentication(
				// Use 'json' mode on server side
				"json",
				{
					storage: cookieStorage(cookies), // this is a SSR aware storage
					credentials: "include", // required for Seamless SSO
				},
			),
		)
		.with(
			rest({
				credentials: "include", // required for Seamless SSO
			}),
		);
}

let directus: ReturnType<typeof _createDirectus>;

export function useDirectus(cookies: AstroCookies) {
	if (directus) return directus;

	directus = _createDirectus(cookies);
	return directus;
}
