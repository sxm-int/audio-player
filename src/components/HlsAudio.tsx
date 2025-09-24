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

const DEBUG_LOGGING = false;
const debug = (...args: unknown[]) => {
	if (DEBUG_LOGGING) console.debug('[hls]', ...args);
};

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

		if (hlsRef.current) {
			hlsRef.current.destroy();
			hlsRef.current = null;
		}

		dispatch(setStatus('loading'));
		dispatch(setError(undefined));

		audio.crossOrigin = 'anonymous';

		const config: Partial<HlsConfig> = {
			enableWorker: true,
			lowLatencyMode: false,
			liveSyncDuration: 8,
			liveMaxLatencyDuration: 30,
			maxBufferLength: 120,
			maxBufferSize: 60 * 1000 * 1000,
			backBufferLength: 120,
			jumpLargeGaps: true,
			maxBufferHole: 0.5,
			nudgeOffset: 0.1,
			nudgeMaxRetry: 5,
			fragLoadingMaxRetry: 6,
			manifestLoadingMaxRetry: 3,
			levelLoadingMaxRetry: 3,
			startLevel: -1,
			debug: false,
		} as Partial<HlsConfig> & Record<string, unknown>;

		if (canUseNativeHls) {
			audio.src = url;
			audio.load();
			audio
				.play()
				.then(() => dispatch(setStatus('ready')))
				.catch((err) => {
					console.error('Audio play failed:', err);
					dispatch(setStatus('ready'));
				});
		} else if (Hls.isSupported()) {
			const hls = new Hls(config);
			hlsRef.current = hls;
			hls.attachMedia(audio);

			let didInitialSeekFromLevel = false;

			hls.on(Events.MEDIA_ATTACHED, () => {
				hls.loadSource(url);
			});

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			hls.on(Events.LEVEL_LOADED, (_e, data: any) => {
				if (didInitialSeekFromLevel) return;
				try {
					const details = data?.details;
					const fragStart =
						details?.fragments?.[0]?.start ??
						details?.start ??
						details?.fragmentStart ??
						null;

					if (typeof fragStart === 'number' && Number.isFinite(fragStart)) {
						const target = Math.max(0, fragStart + 0.05);
						if (audio.currentTime < target - 0.01) {
							audio.currentTime = target;
							didInitialSeekFromLevel = true;
							debug('Initial seek from LEVEL_LOADED to', target);
						}
					}
				} catch (err) {
					console.warn('LEVEL_LOADED initial seek failed:', err);
				}
			});

			hls.on(Events.MANIFEST_PARSED, () => {
				dispatch(setStatus('ready'));
				audio.play().catch((err) => {
					console.warn('Autoplay blocked or failed:', err);
				});
			});

			hls.on(Events.FRAG_LOADING, (_e, data) =>
				debug('FRAG_LOADING', data?.frag?.sn),
			);
			hls.on(Events.FRAG_BUFFERED, (_e, data) =>
				debug('FRAG_BUFFERED', data?.frag?.sn),
			);
			hls.on(Events.LEVEL_UPDATED, (_e, data) =>
				debug('LEVEL_UPDATED', data?.details?.totalduration),
			);

			hls.on(Events.ERROR, (_evt, data) => {
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

				if (data.details === ErrorDetails.BUFFER_STALLED_ERROR) {
					try {
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

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;

		let didInitialNudge = false;

		const nudgeIntoBuffered = () => {
			if (didInitialNudge) return;
			try {
				const s = a.seekable;
				if (s && s.length > 0) {
					const start = s.start(0);
					if (Number.isFinite(start) && a.currentTime < start - 0.01) {
						a.currentTime = start + 0.05;
						didInitialNudge = true;
						debug('Initial nudge to', a.currentTime);
					}
				}
			} catch (err) {
				console.warn('Initial gap adjust failed:', err);
			}
		};

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
			nudgeIntoBuffered();
		};
		const onWaiting = () => {
			debug('[audio] waiting (buffering)');
			nudgeIntoBuffered();
		};
		const onStalled = () => debug('[audio] stalled');
		const onProgress = () => debug('[audio] progress');

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

	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;
		a.muted = muted;
		a.volume = volume;
	}, [muted, volume]);

	return <audio ref={audioRef} preload="auto" />;
};

export default HlsAudio;
