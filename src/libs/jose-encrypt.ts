import * as jose from "jose";
import { decodeBase64Url } from "./base64url";

const secret = decodeBase64Url("mh3_9Y1enVtKgApDmtc1IeVHBQgJCVqrb-NRrKy-SbE");

export async function joseEncrypt(text: string) {
	const jwt = await new jose.EncryptJWT()
		.setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
		.setSubject(text)
		.encrypt(secret);
	return jwt;
}

export async function joseDecrypt(encrypted: string) {
	const { payload } = await jose.jwtDecrypt(encrypted, secret);
	return payload.sub;
}
