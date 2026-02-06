import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUrl, setCurrentTime, setRequestedTime } from './store';
import HlsAudio from './components/HlsAudio';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';
import Login from './components/Login';
import { handleLogin } from './api/login';
import './App.css';

type StreamItem = {
	id?: string;
	name?: string;
	title?: string;
	url: string;
	description?: string;
};

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

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const { url, isPlaying, currentTime, requestedTime } = useAppSelector(
		(s) => s.player,
	);

	const [tempUrl, setTempUrl] = useState(url);
	const [streams, setStreams] = useState<StreamItem[]>([]);
	const [filter, setFilter] = useState('');
	const [loginOpen, setLoginOpen] = useState(false);
	const audioElRef = useRef<HTMLAudioElement | null>(null);
	const playPromiseRef = useRef<Promise<void> | null>(null);

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
					if (!aborted)
						setStreams(
							items.map((it, i) => ({ id: it.id ?? `${i}-${it.url}`, ...it })),
						);
					return;
				} catch (err) {
					lastErr = err;
					// brief backoff; MSW may be finishing registration
					await new Promise((r) => setTimeout(r, 120));
				}
			}
			if (!aborted) {
				console.error('Error fetching streams:', lastErr);
				setStreams([]);
			}
		};

		load();
		return () => {
			aborted = true;
		};
	}, []);

	useEffect(() => {
		const audio = document.querySelector('audio');
		audioElRef.current = audio as HTMLAudioElement | null;
		if (!audio) return;

		// Only call play/pause if audio element state doesn't match desired state
		// This prevents circular loops with the audio event listeners
		if (isPlaying && audio.paused) {
			playPromiseRef.current = audio.play().catch((err) => {
				console.error('Play failed:', err);
				playPromiseRef.current = null;
			});
		} else if (!isPlaying && !audio.paused) {
			// Wait for any pending play promise to resolve before pausing
			if (playPromiseRef.current) {
				playPromiseRef.current
					.then(() => {
						playPromiseRef.current = null;
						if (!audio.paused) {
							audio.pause();
						}
					})
					.catch(() => {
						playPromiseRef.current = null;
					});
			} else {
				audio.pause();
			}
		}
	}, [isPlaying]);

	useEffect(() => {
		const a = audioElRef.current;
		if (!a || requestedTime == null) return;
		try {
			a.currentTime = requestedTime;
		} catch (err) {
			console.error('Seek failed:', err);
		} finally {
			dispatch(setRequestedTime(null));
		}
	}, [requestedTime, dispatch]);

	useEffect(() => {
		const a = audioElRef.current;
		if (!a) return;
		if (!isFinite(a.duration) && currentTime === Number.MAX_SAFE_INTEGER) {
			try {
				a.currentTime = a.seekable.end(a.seekable.length - 1) - 0.5;
			} catch (err) {
				console.warn('Failed to jump to live edge:', err);
			}
			dispatch(setCurrentTime(0));
		}
	}, [currentTime, dispatch]);

	const filtered = streams.filter((s) => {
		const label = s.name ?? s.title ?? s.url;
		return label.toLowerCase().includes(filter.toLowerCase());
	});

	const activeItem = filtered.find((s) => s.url === url) ?? null;

	const handleSelect = (item: StreamItem) => {
		setTempUrl(item.url);
		dispatch(setUrl(item.url));
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<>
			<div className="shell">
			<header className="topbar">
				<div className="left">
					<div className="logo">
						<img src="/stella.png" alt="SiriusXM Stella" />
					</div>{' '}
					<div className="brand">
						<div className="title">sxm-interview</div>
						<div className="sub">HLS Audio Player</div>
					</div>
				</div>

				<div className="search-group">
					<form
						className="search"
						onSubmit={(e) => {
							e.preventDefault();
							dispatch(setUrl(tempUrl));
						}}
					>
						<input
							className="input"
							type="url"
							placeholder="Paste an .m3u8 URL and press Enter"
							value={tempUrl}
							onChange={(e) => setTempUrl(e.target.value)}
							required
						/>
						<button className="btn" type="submit">
							Load
						</button>
					</form>
					<button
						className="btn"
						type="button"
						onClick={() => setLoginOpen(true)}
					>
						Sign in
					</button>
				</div>
			</header>

			<main className="grid">
				<section className="watch">
					<div className="now">
						<div className="viz-card">
							<Visualizer height={140} fftSize={2048} />
						</div>
						<div className="meta">
							<h1 className="now-title">
								{(activeItem?.title ?? activeItem?.name) || 'Now Playing'}
							</h1>
							<div className="now-url" title={url}>
								{url}
							</div>
						</div>
					</div>

					<div className="card">
						<HlsAudio />
						<Controls />
					</div>
				</section>

				<aside className="sidebar">
					<div className="sidebar-head">
						<div className="row">
							<h2>Playlist</h2>
						</div>
						<input
							className="input slim"
							placeholder="Search"
							value={filter}
							name="Search"
							onChange={(e) => setFilter(e.target.value)}
							aria-label="Filter streams"
						/>
					</div>

					<ul className="list">
						{filtered.length === 0 && (
							<li className="empty">No streams found</li>
						)}
						{filtered.map((item) => {
							const label = item.name ?? item.title ?? item.url;
							const active = item.url === url;
							return (
								<li
									className={`row no-thumb ${active ? 'active' : ''}`}
									key={item.id ?? item.url}
								>
									<div className="row-meta">
										<div className="row-title">{label}</div>
										<div className="row-sub">{item.url}</div>
									</div>
									<button
										className={'btn-chip'}
										onClick={() => handleSelect(item)}
										title={'Play'}
									>
										<span className={`chip ${active ? 'playing' : ''}`}>
											{active ? 'Playing' : 'Play'}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</aside>
			</main>
		</div>
			<Login
				open={loginOpen}
				onClose={() => setLoginOpen(false)}
				onSubmit={handleLogin}
			/>
		</>
	);
};

export default App;
