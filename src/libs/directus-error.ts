export type DirectusErrorItem = {
	message: string;
	extensions: {
		code: string;
	};
};

export type DirectusError = {
	errors: DirectusErrorItem[];
};

export function makeDirectusError(
	code: string,
	message: string,
): DirectusError {
	return {
		errors: [
			{
				message,
				extensions: {
					code,
				},
			},
		],
	};
}

export function extractDirectusError(value: unknown): DirectusError | null {
	if (isDirectusError(value)) {
		return value as DirectusError;
	}

	return null;
}

export function extractError(value: unknown): Error | null {
	if (isError(value)) {
		return value as Error;
	}

	return null;
}

export function isDirectusError(value: unknown) {
	const isDirectusError =
		typeof value === "object" &&
		value !== null &&
		Array.isArray(value) === false &&
		"errors" in value &&
		Array.isArray(value.errors);

	return isDirectusError;
}

export function isError(value: unknown) {
	const isError =
		typeof value === "object" &&
		value !== null &&
		Array.isArray(value) === false &&
		"name" in value &&
		"message" in value;

	return isError;
}

export function directusErrorMessage(error: unknown) {
	return isDirectusError(error)
		? extractDirectusError(error)?.errors[0].message
		: isError(error)
			? extractError(error)?.message
			: String(error);
}
