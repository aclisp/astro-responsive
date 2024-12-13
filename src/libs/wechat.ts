import {
	WECHAT_OFFIACCOUNT_APP_ID,
	WECHAT_OFFIACCOUNT_LOGIN_REDIRECT_URI,
} from "astro:env/server";

const appId = WECHAT_OFFIACCOUNT_APP_ID;
const redirectUri = WECHAT_OFFIACCOUNT_LOGIN_REDIRECT_URI ?? "";

export function getAuthUrl(state = "/") {
	const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
	return authUrl;
}
