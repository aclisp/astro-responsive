/// <reference path="../.astro/types.d.ts" />

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
	readonly LOG_LEVEL: 0 | 1 | 2 | 3;
	readonly DIRECTUS_HOST: string;
	// more env variables...
}
