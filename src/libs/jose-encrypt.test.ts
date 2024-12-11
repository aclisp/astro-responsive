import { expect, test } from "vitest";
import { joseDecrypt, joseEncrypt } from "./jose-encrypt";

test("jose-encrypt", async () => {
	const text = "123456";
	const encrypted = await joseEncrypt(text);
	const decrypted = await joseDecrypt(encrypted);
	expect(decrypted).toBe(text);
});
