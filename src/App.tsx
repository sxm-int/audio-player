import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUrl, setCurrentTime, setRequestedTime } from './store';
import HlsAudio from './components/HlsAudio';
import Controls from './components/Controls';
import { MockDemo } from './components/MockDemo';

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const { url, isPlaying, currentTime, requestedTime } = useAppSelector(
		(s) => s.player,
	);
	const [tempUrl, setTempUrl] = useState(url);
	const audioElRef = useRef<HTMLAudioElement | null>(null);

	// Keep play/pause state in sync with Redux
	useEffect(() => {
		const audio = document.querySelector('audio');
		audioElRef.current = audio as HTMLAudioElement | null;
		if (!audio) return;
		if (isPlaying) {
			audio.play().catch((err) => {
				console.error('Play failed:', err);
			});
		} else {
			audio.pause();
		}
	}, [isPlaying]);

	// Apply user-requested seeks once
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

	// Handle LIVE jump separately
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

	return (
		<div className="app">
			<h1>sxm-interview</h1>

			<form
				className="urlbar"
				onSubmit={(e) => {
					e.preventDefault();
					dispatch(setUrl(tempUrl));
				}}
			>
				<input
					type="url"
					placeholder="Enter .m3u8 URL"
					value={tempUrl}
					onChange={(e) => setTempUrl(e.target.value)}
					required
					pattern="https?://.*\\.m3u8(\\?.*)?$"
				/>
				<button type="submit">Load</button>
			</form>

			<div className="player">
				<HlsAudio />
				<Controls />
			</div>

			<details className="help">
				<summary>Help</summary>
				<ul>
					<li>
						Paste an HLS audio URL (.m3u8). Your S3 bucket must allow CORS for
						your dev origin.
					</li>
					<li>Safari/iOS plays HLS natively; other browsers use hls.js.</li>
					<li>
						Live streams show "LIVE" as duration and enable the Live button to
						jump to edge.
					</li>
				</ul>
			</details>

			<MockDemo />
		</div>
	);
};

export default App;
