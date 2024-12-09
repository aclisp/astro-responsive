export type PollingResult = {
	code: "TRY_AGAIN" | "OK";
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data?: any;
};
export type Resolve<T> = (value: T | PromiseLike<T>) => void;
export const waitNotifyCenter = new Set<Resolve<PollingResult>>();
