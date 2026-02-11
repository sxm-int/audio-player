import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUrl } from './store';
import Header from './components/Header';
import AppBody from './components/AppBody';
import NowPlaying from './components/NowPlaying';
import PlaylistSidebar from './components/PlaylistSidebar';
import Login from './components/Login';
import Recommendations from './components/Recommendations';
import { handleLogin } from './api/login';
import type { StreamItem } from './api/streams';
import { useLoadMocks, useAppAudioRef } from './App.hooks';
import './App.css';

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const { url, isPlaying, currentTime, requestedTime } = useAppSelector(
		(s) => s.player,
	);
	const streams = useAppSelector((s) => s.streams.items);
	const [tempUrl, setTempUrl] = useState(url);
	const [loginOpen, setLoginOpen] = useState(false);
	const activeStream = streams.find((s) => s.url === url);
	const audioRef = useAppAudioRef({
		isPlaying,
		currentTime,
		requestedTime,
	});
	useLoadMocks();
	useEffect(() => {
		console.log('Currently playing:', audioRef.current);
	}, [url]);

	const handlePlay = (item: StreamItem) => {
		setTempUrl(item.url);
		dispatch(setUrl(item.url));
	};

	return (
		<>
			<div className="shell">
				<Header setLoginOpen={setLoginOpen} tempUrl={tempUrl} setTempUrl={setTempUrl} />
				<AppBody
					MainContent={
						<>
							<NowPlaying
								url={url}
								title={activeStream?.title}
							/>
							<Recommendations />
						</>
					}
					Sidebar={
						<PlaylistSidebar
							streams={streams}
							url={url}
							handlePlay={handlePlay}
						/>
					}
				/>
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