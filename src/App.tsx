import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUrl, setUserPremium } from './store';
import Header from './components/Header';
import AppBody from './components/AppBody';
import NowPlaying from './components/NowPlaying';
import PlaylistSidebar from './components/PlaylistSidebar';
import Login from './components/Login';
import Recommendations from './components/Recommendations';
import PremiumModal from './components/PremiumModal';
import Toast from './components/Toast';
import { handleLogin } from './api/login';
import { handleUpgrade } from './api/upgrade';
import type { StreamItem } from './api/streams';
import { useLoadMocks, useAppAudioRef } from './App.hooks';
import './App.css';

const App: React.FC = () => {
	const dispatch = useAppDispatch();
	const { url, isPlaying, currentTime, requestedTime } = useAppSelector(
		(s) => s.player,
	);
	const streams = useAppSelector((s) => s.streams.items);
	const isUserPremium = useAppSelector((s) => s.auth.isUserPremium);
	const [tempUrl, setTempUrl] = useState(url);
	const [loginOpen, setLoginOpen] = useState(false);
	const [premiumModal, setPremiumModal] = useState<{
		isOpen: boolean;
		premiumTrack?: StreamItem | null;
	}>({
		isOpen: false,
		premiumTrack: null,
	});
	const [toast, setToast] = useState<{ message: string; type: string; } | null>(null);
	const activeStream = streams.find((s) => s.url === url) || null;
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
		if (item.isPremium && !isUserPremium) {
			setPremiumModal({
				isOpen: true,
				premiumTrack: item,
			});
			return;
		}

		setTempUrl(item.url);
		dispatch(setUrl(item.url));
	};

	const handleUpgradeClick = async () => {
		try {
			const result = await handleUpgrade();
			if (result.status === 'success') {
				dispatch(setUserPremium(true));
			}
			setToast({
				message: result.message,
				type: result.status,
			});
			return result;
		} catch (err) {
			const errorMessage = 'An error occurred during upgrade.';
			setToast({
				message: errorMessage,
				type: 'error',
			});
			return {
				status: 'error',
				message: errorMessage,
			};
		}
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
			{premiumModal.isOpen && premiumModal.premiumTrack && (
				<PremiumModal
					isModalOpen={premiumModal.isOpen}
					trackTitle={premiumModal.premiumTrack?.title}
					onModalClose={() => {
						setPremiumModal({
							isOpen: false,
							premiumTrack: null,
						});
					}}
					onUpgradeAttempt={handleUpgradeClick}
				/>
			)}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</>
	);
};

export default App;