import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './App.css';

async function startMSW() {
	if (!import.meta.env.DEV) return;
	if (!('serviceWorker' in navigator)) return;

	const { worker } = await import('./mocks/browser');

	// Build a robust absolute URL for the worker that works in iframes/StackBlitz.
	// Vite serves "public/" at the BASE_URL; default is "/".
	const base = import.meta.env.BASE_URL || '/';
	// Ensure exactly one slash between origin and path
	const path = `${base.replace(/\/+$/, '')}/mockServiceWorker.js`;
	const absUrl = new URL(path, window.location.origin).href;

	try {
		await worker.start({
			serviceWorker: { url: absUrl, options: { scope: base || '/' } },
			onUnhandledRequest: 'bypass',
		});
	} catch (e) {
		console.warn(
			'MSW start failed with absolute URL, retrying with relative…',
			e,
		);
		try {
			// Fallback: relative path (helps in some embedded preview paths)
			await worker.start({
				serviceWorker: { url: `${base}mockServiceWorker.js` },
				onUnhandledRequest: 'bypass',
			});
		} catch (e2) {
			console.error('MSW start failed; continuing without mocks.', e2);
		}
	}
}

async function bootstrap() {
	await startMSW();

	ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
		<React.StrictMode>
			<Provider store={store}>
				<App />
			</Provider>
		</React.StrictMode>,
	);
}

bootstrap();
