/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { handlers } from './api/handlers';

function monkeyPatchFetch() {
	if ((window as any).__FAKE_API_INSTALLED__) return;

	const realFetch = window.fetch.bind(window);

	window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const href =
			typeof input === 'string'
				? input
				: ((input as URL).toString?.() ?? (input as Request).url);
		const url = new URL(href, window.location.origin);
		const method = init?.method || 'GET';

		if (url.origin === window.location.origin) {
			const matchedHandler = handlers.find(
				(h) =>
					h.method.toUpperCase() === method.toUpperCase() &&
					h.path === url.pathname,
			);

			if (matchedHandler) {
				// Parse body for POST requests
				let body: unknown;
				if (init?.body) {
					body = JSON.parse(init.body as string);
				}

				const data = matchedHandler.handler(body);

				// Handle login response status
				const isLogin = url.pathname === '/login';
				const success = isLogin ? (data as any)?.success === true : true;
				const status = isLogin && !success ? 403 : 200;

				return new Response(JSON.stringify(data), {
					status,
					headers: { 'content-type': 'application/json' },
				});
			}
		}

		return realFetch(input as any, init);
	};

	(window as any).__FAKE_API_INSTALLED__ = true;
	console.info('Successfully monkey patched fetch.');
}

async function bootstrap() {
	monkeyPatchFetch();

	ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
		<React.StrictMode>
			<Provider store={store}>
				<App />
			</Provider>
		</React.StrictMode>,
	);
}

bootstrap();
