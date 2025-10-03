import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUrl, setCurrentTime, setRequestedTime } from './store';
import HlsAudio from './components/HlsAudio';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';
import './App.css';

type StreamItem = {
	id?: string;
	name?: string;
	title?: string;
	url: string;
	description?: string;
};

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const { url, isPlaying, currentTime, requestedTime } = useAppSelector(
		(s) => s.player,
	);

	const [tempUrl, setTempUrl] = useState(url);
	const [streams, setStreams] = useState<StreamItem[]>([]);
	const [filter, setFilter] = useState('');
	const audioElRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch('/streams');
				if (!res.ok) throw new Error(`Failed to fetch /streams: ${res.status}`);
				const items: StreamItem[] = await res.json();
				setStreams(
					items.map((it, i) => ({ id: it.id ?? `${i}-${it.url}`, ...it })),
				);
			} catch (err) {
				console.error('Error fetching streams:', err);
				setStreams([]);
			}
		};
		load();
	}, []);

	useEffect(() => {
		const audio = document.querySelector('audio');
		audioElRef.current = audio as HTMLAudioElement | null;
		if (!audio) return;
		if (isPlaying) {
			audio.play().catch((err) => console.error('Play failed:', err));
		} else {
			audio.pause();
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
						<h2>Playlist</h2>
						<input
							className="input slim"
							placeholder="Search"
							value={filter}
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
								<li key={item.id ?? item.url}>
									<button
										className={`row no-thumb ${active ? 'active' : ''}`}
										onClick={() => handleSelect(item)}
										title={item.description ?? label}
									>
										<div className="row-meta">
											<div className="row-title">{label}</div>
											<div className="row-sub">{item.url}</div>
										</div>
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
	);
};

export default App;
