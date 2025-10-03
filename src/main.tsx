/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './App.css';

function installDevFetchShim() {
	if (!import.meta.env.DEV) return;
	if ((window as any).__FAKE_API_INSTALLED__) return;

	const realFetch = window.fetch.bind(window);

	const streams = [
		{
			title: 'Big Buck Bunny - adaptive qualities',
			url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		},
		{
			title: 'Big Buck Bunny - 480p only',
			url: 'https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8',
		},
		{
			title: 'ARTE China, ABR',
			url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
		},
		{
			title: 'Ad-insertion in event stream',
			url: 'https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8',
		},
		{
			title: 'hls.js/issues/666',
			url: 'https://test-streams.mux.dev/issue666/playlists/cisq0gim60007xzvi505emlxx.m3u8',
		},
		{
			title: 'SAMPLE-AES encrypted',
			url: 'https://test-streams.mux.dev/bbbAES/playlists/sample_aes/index.m3u8',
		},
		{
			title: 'DK Turntable, PTS shifted by 2.3s',
			url: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
		},
		{
			title: 'Tears of Steel, HLS with IMSC Captions',
			url: 'https://test-streams.mux.dev/tos_ismc/main.m3u8',
		},
	];

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
		const { worker } = await import('./mocks/browser'); // msw v2: 'msw/browser'
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
