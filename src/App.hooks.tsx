import { useEffect } from 'react';
import { setStreams } from './store';
import { useAppDispatch } from './hooks';
import type { StreamItem } from './api/streams';

async function waitForMocks(ms = 800, step = 40) {
	if (!import.meta.env.DEV) return;
	const start = performance.now();
	// also allow native SW readiness as a fallback
	const ready = () =>
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).__MSW_READY__ === true ||
		(navigator.serviceWorker && 'ready' in navigator.serviceWorker);

	while (!ready() && performance.now() - start < ms) {
		await new Promise((r) => setTimeout(r, step));
	}
}

export const useLoadMocks = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		let aborted = false;

		const load = async () => {
			await waitForMocks(); // ensure MSW is ready in dev

			let lastErr: unknown;
			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					const res = await fetch('/streams', { cache: 'no-store' });
					const ctype = res.headers.get('content-type') || '';
					if (!res.ok) throw new Error(`GET /streams ${res.status}`);
					if (!ctype.includes('application/json')) {
						throw new Error(`Non-JSON response (${ctype || 'unknown'})`);
					}
					const items: StreamItem[] = await res.json();
					if (!aborted) dispatch(setStreams(items));
					return;
				} catch (err) {
					lastErr = err;
					// brief backoff; MSW may be finishing registration
					await new Promise((r) => setTimeout(r, 120));
				}
			}
			if (!aborted) {
				console.error('Error fetching streams:', lastErr);
				dispatch(setStreams([]));
			}
		};

		load();
		return () => {
			aborted = true;
		};
	}, [dispatch]);
};

