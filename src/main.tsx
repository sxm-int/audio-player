/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { streams } from './api/streams';

function installDevFetchShim() {
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
		}

		return realFetch(input as any, init);
	};

	(window as any).__FAKE_API_INSTALLED__ = true;
	console.info('[dev] Installed fetch shim (MSW unavailable)');
}

async function startMSW() {
	if (!import.meta.env.DEV) return false;
	if (!('serviceWorker' in navigator)) return false;

	try {
		const { worker } = await import('./api/browser'); // msw v2: 'msw/browser'
		const base = import.meta.env.BASE_URL || '/';
		const path = `${base.replace(/\/+$/, '')}/mockServiceWorker.js`;
		const absUrl = new URL(path, window.location.origin).href;

		await worker.start({
			serviceWorker: { url: absUrl, options: { scope: base || '/' } },
			onUnhandledRequest: 'bypass',
		});

		(window as any).__MSW_READY__ = true;
		console.info('[dev] MSW started');
		return true;
	} catch (e) {
		console.warn('MSW start failed; installing fetch shim instead.', e);
		return false;
	}
}

async function bootstrap() {
	const ok = await startMSW();
	if (!ok) installDevFetchShim();

	ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
		<React.StrictMode>
			<Provider store={store}>
				<App />
			</Provider>
		</React.StrictMode>,
	);
}

bootstrap();
