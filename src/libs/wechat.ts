import { WECHAT_OFFIACCOUNT_APP_ID } from "astro:env/server";

const appId = WECHAT_OFFIACCOUNT_APP_ID;
const redirectUri = "https://m.dancingcat.top/login/wechat-auth-receiver";

export function getAuthUrl(state = "/") {
	const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
	return authUrl;
}
