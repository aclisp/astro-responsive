// @ts-check
import { defineConfig, envField } from "astro/config";

import vue from "@astrojs/vue";

import node from "@astrojs/node";

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
			WECHAT_OFFIACCOUNT_APP_ID: envField.string({
				context: "server",
				access: "public",
				optional: true,
			}),
			WECHAT_OFFIACCOUNT_APP_SECRET: envField.string({
				context: "server",
				access: "public",
				optional: true,
			}),
			WECHAT_OFFIACCOUNT_LOGIN_REDIRECT_URI: envField.string({
				context: "server",
				access: "public",
				url: true,
				optional: true,
			}),
			PUBLIC_GOOGLE_CLIENT_ID: envField.string({
				context: "client",
				access: "public",
				default:
					"626049048609-04djl2h2j73jhtpvmlj0mejqqdlfni71.apps.googleusercontent.com",
				optional: true,
			}),
			SIGNUP_VERIFICATION_URL: envField.string({
				context: "server",
				access: "public",
				url: true,
				optional: false,
			}),
			PASSWORD_RESET_URL: envField.string({
				context: "server",
				access: "public",
				url: true,
				optional: false,
			}),
		},
	},

	server: {
		host: true,
	},

	output: "server",
	security: {
		checkOrigin: false,
	},

	adapter: node({
		mode: "standalone",
	}),

	integrations: [vue()],
});
