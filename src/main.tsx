/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { streams } from './api/streams';
import { VALID_EMAIL, VALID_PASS } from './constants';

function monkeyPatchFetch() {
	if (!import.meta.env.DEV) return;
	if ((window as any).__FAKE_API_INSTALLED__) return;

	const realFetch = window.fetch.bind(window);

	window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
		const href =
			typeof input === 'string'
				? input
				: ((input as URL).toString?.() ?? (input as Request).url);
		const url = new URL(href, window.location.origin);

		if (url.origin === window.location.origin) {
			if (url.pathname === '/hello-world') {
				return new Response(JSON.stringify({ data: 'Hello world.' }), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				});
			}
			if (url.pathname === '/streams') {
				return new Response(JSON.stringify(streams), {
					status: 200,
					headers: { 'content-type': 'application/json' },
				});
			}
			if (url.pathname === '/login' && init?.method === "POST" && init.body) {
				const data = JSON.parse(init.body as string || "") as Record<string, any>
				const email = (typeof data.email === 'string' && data.email)
				const password = (typeof data.password === 'string' && data.password) 
				const success = email === VALID_EMAIL && password === VALID_PASS;
				return new Response(
					JSON.stringify(
						success
							? { success: true, user: { email } }
							: { success: false, error: 'Invalid credentials' },
					),
					{
						status: success ? 200 : 403,
						headers: { 'content-type': 'application/json' },
					},
				);
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
