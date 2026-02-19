export type RequestLog = {
	method: string;
	url: string;
	body?: BodyInit | null;
};

export type ResponseLog = RequestLog & {
	status: number;
	ok: boolean;
};

export type ErrorLog = RequestLog & {
	error: unknown;
};

export type RequestLogger = {
	logRequest: (entry: RequestLog) => void;
	logResponse: (entry: ResponseLog) => void;
	logError: (entry: ErrorLog) => void;
};

const defaultLogger: RequestLogger = {
	logRequest: ({ method, url }) => {
		console.info(`[fetch] ${method.toUpperCase()} ${url}`);
	},
	logResponse: ({ method, url, status, ok }) => {
		const state = ok ? 'ok' : 'error';
		console.info(`[fetch] ${method.toUpperCase()} ${url} -> ${status} (${state})`);
	},
	logError: ({ method, url, error }) => {
		console.error(`[fetch] ${method.toUpperCase()} ${url} failed`, error);
	},
};

export function getRequestLogger(): RequestLogger {
	return defaultLogger;
}
