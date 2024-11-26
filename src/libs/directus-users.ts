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
	try {
		const res = await httpGet("/users/me", {
			cookies,
			params: new URLSearchParams({
				fields: "first_name,email,role.name",
			}),
		});
		return { name: res.first_name, email: res.email, roleName: res.role.name };
	} catch (error) {
		console.log(error);
	}
}
