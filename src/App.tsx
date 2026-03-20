import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUrl, setTitle, setDuration, setCurrentTime, setPlaybackState, setVolume, setMuted } from './store';
import Header from './components/Header';
import AppBody from './components/AppBody';
import NowPlaying from './components/NowPlaying';
import PlaylistSidebar from './components/PlaylistSidebar';
import Login from './components/Login';
import Recommendations from './components/Recommendations';
import { handleLogin } from './api/login';
import type { StreamItem } from './api/streams';
import { useLoadMocks } from './App.hooks';
import { usePlaybackService } from './playback-service/PlaybackServiceContext';
import './App.css';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { url } = useAppSelector((s) => s.player);
  const streams = useAppSelector((s) => s.streams.items);
  const [loginOpen, setLoginOpen] = useState(false);
  useLoadMocks();

  const service = usePlaybackService();

  useEffect(() => {
    const sub = service.events$.subscribe((event) => {
      if (event.type === 'mediaChanged') {
        dispatch(setUrl(event.url));
        dispatch(setTitle(event.title));
      }
      if (event.type === 'durationChanged') {
        dispatch(setDuration(event.duration));
      }
      if (event.type === 'currentTimeChanged') {
        dispatch(setCurrentTime(event.currentTime));
      }
      if (event.type === 'playbackStateChanged') {
        dispatch(setPlaybackState(event.state));
      }
      if (event.type === 'volumeChanged') {
        dispatch(setVolume(event.volume));
      }
      if (event.type === 'mutedChanged') {
        dispatch(setMuted(event.muted));
      }
    });
    return () => sub.unsubscribe();
  }, [service, dispatch]);

  const handlePlay = (item: StreamItem) => {
    service.tune({ id: item.id, title: item.title, url: item.url });
    service.play();
  };

  return (
    <>
      <div className="shell">
        <Header setLoginOpen={setLoginOpen} />
        <AppBody
          MainContent={
            <>
              <NowPlaying />
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
