export function decodeBase64(encoded: string): Uint8Array {
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

export function decodeBase64Url(input: string) {
	let encoded = input;
	encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
	try {
		return decodeBase64(encoded);
	} catch {
		throw new TypeError("The input to be decoded is not correctly encoded.");
	}
}
