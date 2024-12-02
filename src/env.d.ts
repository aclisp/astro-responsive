/// <reference path="../.astro/types.d.ts" />

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	readonly LOG_LEVEL: 0 | 1 | 2 | 3;
	readonly DIRECTUS_HOST: string;
	readonly DIRECTUS_ADMIN_TOKEN: string;
	readonly DIRECTUS_DEFAULT_ROLE: string;
	// more env variables...
	readonly PUBLIC_REGISTER_URL: string;
	readonly PUBLIC_GOOGLE_CLIENT_ID: string;
}
