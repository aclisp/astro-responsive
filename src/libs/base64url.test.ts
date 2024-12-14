import crypto from "node:crypto";
import { expect, test } from "vitest";
import { decodeBase64Url, encodeBase64Url } from "./base64url";

test("decodeBase64Url", async () => {
	const secret = crypto.randomBytes(32);
	const encoded = encodeBase64Url(secret);
	expect(encoded.length).toBe(43);

	const decoded = decodeBase64Url(encoded);
	expect(decoded.length).toBe(32);
});
