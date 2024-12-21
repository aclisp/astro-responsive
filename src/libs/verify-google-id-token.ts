import {
	type KeyLike,
	decodeProtectedHeader,
	importX509,
	jwtVerify,
} from "jose";
const inFlight = new Map<string, Promise<KeyLike>>();
const cache = new Map<string, { key: KeyLike; expires: number }>();

/**
 * Imports a public key for the provided Google Cloud (GCP)
 * service account credentials.
 *
 * @throws {Error} - If the X.509 certificate could not be fetched.
 */
async function importPublicKey(options: { keyId: string }) {
	const keyId = options.keyId;
	const certificateURL = "https://www.googleapis.com/oauth2/v1/certs";
	const cacheKey = `${certificateURL}?key=${keyId}`;
	const value = cache.get(cacheKey);
	const now = Date.now();
	async function fetchKey() {
		// Fetch the public key from Google's servers
		const res = await fetch(certificateURL);
		if (!res.ok) {
			const error = await res
				.json()
				.then((data) => data.error.message)
				.catch(() => undefined);
			throw new Error(error ?? "Failed to fetch the public key");
		}
		const data = await res.json();
		const x509 = data[keyId];
		if (!x509) {
			throw new Error(`Public key "${keyId}" not found.`);
		}
		const key = await importX509(x509, "RS256");
		// Resolve the expiration time of the key
		const maxAge = res.headers
			.get("cache-control")
			?.match(/max-age=(\d+)/)?.[1]; // prettier-ignore
		const expires = Date.now() + Number(maxAge ?? "3600") * 1000;
		// Update the local cache
		cache.set(cacheKey, { key, expires });
		inFlight.delete(keyId);
		return key;
	}
	// Attempt to read the key from the local cache
	if (value) {
		if (value.expires > now + 10_000) {
			// If the key is about to expire, start a new request in the background
			if (value.expires - now < 600_000) {
				const promise = fetchKey();
				inFlight.set(cacheKey, promise);
			}
			return value.key;
		}
		cache.delete(cacheKey);
	}
	// Check if there is an in-flight request for the same key ID
	let promise = inFlight.get(cacheKey);
	// If not, start a new request
	if (!promise) {
		promise = fetchKey();
		inFlight.set(cacheKey, promise);
	}
	return await promise;
}

// based on https://www.npmjs.com/package/web-auth-library?activeTab=code
// made to check per Google's recommendations: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
export async function verifyIdToken(options: {
	idToken: string;
	clientId?: string;
}) {
	if (!options.idToken) {
		throw new TypeError(`Missing "idToken"`);
	}
	if (!options.clientId) {
		throw new TypeError(`Missing "clientId"`);
	}
	// Import the public key from the Google Cloud project
	const header = decodeProtectedHeader(options.idToken);
	const now = Math.floor(Date.now() / 1000);
	const key = await importPublicKey({
		keyId: header.kid ?? "",
	});
	const { payload } = await jwtVerify(options.idToken, key, {
		audience: options.clientId,
		issuer: ["https://accounts.google.com", "accounts.google.com"],
		maxTokenAge: "1h",
		clockTolerance: "5m",
	});
	if (!payload.sub) {
		throw new Error(`Missing "sub" claim`);
	}
	if (typeof payload.auth_time === "number" && payload.auth_time > now) {
		throw new Error(`Unexpected "auth_time" claim value`);
	}
	return payload;
}
