// src/components/HlsAudio.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import Hls, { ErrorDetails, ErrorTypes, Events, type HlsConfig } from 'hls.js';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
	setStatus,
	setError,
	setPlaying,
	setMuted,
	setVolume,
	setDuration,
	setCurrentTime,
	setIsLive,
} from '../store';

const HlsAudio: React.FC = () => {
	const { url, muted, volume } = useAppSelector((s) => s.player);
	const dispatch = useAppDispatch();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const hlsRef = useRef<Hls | null>(null);

	const canUseNativeHls = useMemo(() => {
		const a = document.createElement('audio') as HTMLAudioElement & {
			canPlayType?: (type: string) => string;
		};
		return (
			a.canPlayType && a.canPlayType('application/vnd.apple.mpegURL') !== ''
		);
	}, []);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		// fresh instance
		if (hlsRef.current) {
			hlsRef.current.destroy();
			hlsRef.current = null;
		}

		dispatch(setStatus('loading'));
		dispatch(setError(undefined));

		// Helpful for CORS + dev tools
		audio.crossOrigin = 'anonymous';

		// hls.js tuning for smoother audio
		const config: Partial<HlsConfig> = {
			enableWorker: true,
			// For standard HLS (not LL-HLS); stay comfortably behind live edge:
			lowLatencyMode: false,
			liveSyncDuration: 8, // seconds behind live edge
			liveMaxLatencyDuration: 30,
			// Build a deeper buffer for audio
			maxBufferLength: 120, // seconds of media to buffer
			maxBufferSize: 60 * 1000 * 1000, // ~60MB cap
			backBufferLength: 120, // keep some history
			// Be aggressive about tiny gaps
			maxBufferHole: 0.1,
			// Retry settings
			fragLoadingMaxRetry: 6,
			manifestLoadingMaxRetry: 3,
			levelLoadingMaxRetry: 3,
			// Start at auto level
			startLevel: -1,
		};

		if (canUseNativeHls) {
			audio.src = url;
			audio.load();
			audio
				.play()
				.then(() => dispatch(setStatus('ready')))
				.catch((err) => {
					console.error('Audio play failed:', err);
					dispatch(setStatus('ready')); // media ready, playback gated by policy
				});
		} else if (Hls.isSupported()) {
			const hls = new Hls(config);
			hlsRef.current = hls;
			hls.attachMedia(audio);

			hls.on(Events.MEDIA_ATTACHED, () => {
				hls.loadSource(url);
			});

			hls.on(Events.MANIFEST_PARSED, () => {
				dispatch(setStatus('ready'));
				audio.play().catch((err) => {
					console.warn('Autoplay blocked or failed:', err);
				});
			});

			// Visibility into buffering
			const log = (...args: unknown[]) => console.debug('[hls]', ...args);
			hls.on(Events.FRAG_LOADING, (_e, data) =>
				log('FRAG_LOADING', data?.frag?.sn),
			);
			hls.on(Events.FRAG_BUFFERED, (_e, data) =>
				log('FRAG_BUFFERED', data?.frag?.sn),
			);
			hls.on(Events.LEVEL_UPDATED, (_e, data) =>
				log('LEVEL_UPDATED', data?.details?.totalduration),
			);

			hls.on(Events.ERROR, (_evt, data) => {
				// Always log; never swallow
				console.error('HLS error:', data);

				if (data.fatal) {
					switch (data.type) {
						case ErrorTypes.NETWORK_ERROR:
							hls.startLoad();
							break;
						case ErrorTypes.MEDIA_ERROR:
							hls.recoverMediaError();
							break;
						default:
							dispatch(setError(data.details || 'Fatal HLS error'));
							hls.destroy();
					}
					return;
				}

				// Non-fatal stalls/gaps -> try gentle nudges
				if (data.details === ErrorDetails.BUFFER_STALLED_ERROR) {
					try {
						// Small nudge forward helps skip over tiny decode gaps
						audio.currentTime = audio.currentTime + 0.05;
					} catch (err) {
						console.warn('Nudge on stall failed:', err);
					}
				}
				if (data.details === ErrorDetails.BUFFER_SEEK_OVER_HOLE) {
					try {
						audio.currentTime = audio.currentTime + 0.2;
					} catch (err) {
						console.warn('Seek-over-hole adjust failed:', err);
					}
				}
			});
		} else {
			dispatch(setError('HLS not supported in this browser'));
		}

		return () => {
			if (hlsRef.current) {
				hlsRef.current.destroy();
				hlsRef.current = null;
			}
		};
	}, [url, canUseNativeHls, dispatch]);

	// Mirror element -> Redux
	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;

		const onPlay = () => dispatch(setPlaying(true));
		const onPause = () => dispatch(setPlaying(false));
		const onDuration = () =>
			dispatch(setDuration(isFinite(a.duration) ? a.duration : Infinity));
		const onTime = () => dispatch(setCurrentTime(a.currentTime));
		const onVolume = () => {
			dispatch(setMuted(a.muted));
			dispatch(setVolume(a.volume));
		};
		const onLoadedMeta = () => {
			const live = !isFinite(a.duration) || a.duration > 24 * 3600;
			dispatch(setIsLive(live));
		};
		const onWaiting = () => console.warn('[audio] waiting (buffering)');
		const onStalled = () => console.warn('[audio] stalled');
		const onProgress = () => console.debug('[audio] progress');

		a.addEventListener('play', onPlay);
		a.addEventListener('pause', onPause);
		a.addEventListener('durationchange', onDuration);
		a.addEventListener('timeupdate', onTime);
		a.addEventListener('volumechange', onVolume);
		a.addEventListener('loadedmetadata', onLoadedMeta);
		a.addEventListener('waiting', onWaiting);
		a.addEventListener('stalled', onStalled);
		a.addEventListener('progress', onProgress);

		return () => {
			a.removeEventListener('play', onPlay);
			a.removeEventListener('pause', onPause);
			a.removeEventListener('durationchange', onDuration);
			a.removeEventListener('timeupdate', onTime);
			a.removeEventListener('volumechange', onVolume);
			a.removeEventListener('loadedmetadata', onLoadedMeta);
			a.removeEventListener('waiting', onWaiting);
			a.removeEventListener('stalled', onStalled);
			a.removeEventListener('progress', onProgress);
		};
	}, [dispatch]);

	// Redux -> element
	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		a.muted = muted;
		a.volume = volume;
	}, [muted, volume]);

	return <audio ref={audioRef} preload="auto" />;
};

export default HlsAudio;
