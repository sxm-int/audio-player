import type { RequestLogger } from './requestLogger';
import { getRequestLogger } from './requestLogger';

type LoggedFetchOptions = {
	logger?: RequestLogger;
};

export async function loggedFetch(
	url: string,
	init?: RequestInit,
	options?: LoggedFetchOptions,
) {
	const logger = options?.logger ?? getRequestLogger();
	const method = init?.method ?? 'GET'

	logger.logRequest({ method, url, body: init?.body ?? null });

	try {
		const response = await window.fetch(url, init);
		logger.logResponse({
			method,
			url,
			body: init?.body ?? null,
			status: response.status,
			ok: response.ok,
		});
		return response;
	} catch (error) {
		logger.logError({ method, url, body: init?.body ?? null, error });
		throw error;
	}
}
