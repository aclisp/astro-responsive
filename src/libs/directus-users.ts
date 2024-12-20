import type { AstroCookies } from "astro";
import { httpGet } from "./directus-transport";

export type User = {
	name: string;
	email: string;
	roleName: string;
};

export async function getCurrentUser(
	cookies: AstroCookies,
): Promise<User | undefined> {
	const res = await httpGet("/users/me", {
		cookies,
		params: new URLSearchParams({
			fields: "first_name,email,role.name",
		}),
	});
	const email = res.data.email as string;
	return {
		name: res.data.first_name || email.substring(0, email.indexOf("@")),
		email,
		roleName: res.data.role.name,
	};
}
