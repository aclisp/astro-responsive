// @ts-check
import { defineConfig, envField } from "astro/config";

import node from "@astrojs/node";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
	env: {
		schema: {
			LOG_LEVEL: envField.number({
				context: "client",
				access: "public",
				default: 2,
				int: true,
				min: 0,
				max: 3,
			}),
			DIRECTUS_HOST: envField.string({
				context: "server",
				access: "public",
				default: "http://localhost:8055",
				url: true,
			}),
			DIRECTUS_ADMIN_TOKEN: envField.string({
				context: "server",
				access: "public",
				optional: false,
			}),
			DIRECTUS_DEFAULT_ROLE: envField.string({
				context: "server",
				access: "public",
				optional: false,
			}),
			PUBLIC_REGISTER_URL: envField.string({
				context: "client",
				access: "public",
				default: "http://localhost:8055/admin/register",
				url: true,
			}),
			PUBLIC_GOOGLE_CLIENT_ID: envField.string({
				context: "client",
				access: "public",
				default:
					"626049048609-04djl2h2j73jhtpvmlj0mejqqdlfni71.apps.googleusercontent.com",
				optional: true,
			}),
		},
	},

	server: {
		host: true,
	},

	output: "server",

	adapter: node({
		mode: "standalone",
	}),

	integrations: [vue()],
});
