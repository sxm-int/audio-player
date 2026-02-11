import { useEffect, useRef } from 'react';
import { setStreams, setCurrentTime, setRequestedTime } from './store';
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
}

export const useAppAudioRef = ({
  isPlaying,
  currentTime,
  requestedTime,
}: {
  isPlaying: boolean;
  currentTime: number;
  requestedTime: number | null;
}): React.RefObject<HTMLAudioElement | null> => {
  const dispatch = useAppDispatch();
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

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

  return audioElRef;
};