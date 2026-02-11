import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUrl, setUserPremium } from './store';
import HlsAudio from './components/HlsAudio';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';
import Login from './components/Login';
import PremiumModal from './components/PremiumModal';
import Toast from './components/Toast';
import Recommendations from './components/Recommendations';
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
	const [listSearchText, setListSearchText] = useState('');
	const [loginOpen, setLoginOpen] = useState(false);
  const [premiumModal, setPremiumModal] = useState<{
    isOpen: boolean;
    premiumTrack?: StreamItem | null;
    currentTrack?: StreamItem | null;
  }>({
    isOpen: false,
    premiumTrack: null,
    currentTrack: null,
  });
	const [toast, setToast] = useState<{ message: string; type: string; } | null>(null);
	const filteredStreams = streams.filter((s) => {
		return s.title.toLowerCase().includes(listSearchText.toLowerCase());
	});
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

        <main className='main-content'>
          <div className="grid">
            <section className="watch">
              <div className="now">
                <div className="viz-card">
                  <Visualizer height={140} fftSize={2048} />
                </div>
                <div className="meta">
                  <h1 className="now-title">
                    {activeStream?.title || 'Now Playing'}
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

              <Recommendations />
            </section>

            <aside className="sidebar">
              <div className="sidebar-head">
                <div className="row">
                  <h2>Playlist</h2>
                </div>
                <input
                  className="input slim"
                  placeholder="Search"
                  value={listSearchText}
                  name="Search"
                  onChange={(e) => setListSearchText(e.target.value)}
                  aria-label="Search streams"
                />
              </div>

              <ul className="list">
                {filteredStreams.map((item) => {
                  const label = item.title;
                  const active = item.url === url;
                  return (
                    <li
                      className={`row no-thumb ${active ? 'active' : ''}`}
                      key={item.id}
                    >
                      <div className="row-meta">
                        <div className="row-title">
                          {item.isPremium && (
                            <span className="premium-badge">Premium</span>
                          )}
                          {label}
                        </div>
                        <div className="row-sub">{item.url}</div>
                      </div>
                      <button
                        className={'btn-chip'}
                        onClick={() => handlePlay(item)}
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
          </div>
        </main>
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
					onModalClose={(shouldResumeCurrentTrack: boolean) => {
            const audioEl = audioRef.current;
            const isAudioPaused = audioEl && audioEl.paused;

            if (shouldResumeCurrentTrack && isAudioPaused) {
              audioEl.play();
            }

            setPremiumModal({
              isOpen: false,
              premiumTrack: null,
              currentTrack: null,
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