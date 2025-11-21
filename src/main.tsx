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
				const data = matchedHandler.handler();
				return new Response(JSON.stringify(data), {
					status: 200,
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
