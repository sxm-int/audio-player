/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { PlaybackServiceProvider } from './playback-service/PlaybackServiceContext';
import { PlaybackService } from './playback-service/PlaybackService';
import type { EngineEntry } from './playback-service/PlaybackService';
import { hlsEngineFactory } from './playback-service/engines/hls/hlsEngineFactory';
import { progressiveEngineFactory } from './playback-service/engines/progressive/progressiveEngineFactory';
import { handlers, type MockHandler } from './api/handlers';

function monkeyPatchFetch() {
  if ((window as any).__FAKE_API_INSTALLED__) return;

  const realFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const href =
      typeof input === 'string'
        ? input
        : ((input as URL).toString?.() ?? (input as Request).url);
    const url = new URL(href, window.location.origin);
    const method = init?.method || 'GET';

    if (url.origin === window.location.origin) {
      const matchedHandler: MockHandler | undefined = handlers.find(
        (h) =>
          h.method.toUpperCase() === method.toUpperCase() &&
          h.path === url.pathname,
      );

      if (matchedHandler) {
        let body: unknown;
        if (init?.body) {
          body = JSON.parse(init.body as string);
        }

        const data = await matchedHandler.handler(body);

        const isLogin = url.pathname === '/login';
        const success = isLogin ? (data as any)?.success === true : true;
        const status = isLogin && !success ? 403 : 200;

        return new Response(JSON.stringify(data), {
          status,
          headers: { 'content-type': 'application/json' },
        });
      }
    }

    return realFetch(input as any, init);
  };

  (window as any).__FAKE_API_INSTALLED__ = true;
  console.info('Successfully monkey patched fetch.');
}

function createPlaybackService(): PlaybackService {
  const hlsAudio = document.getElementById('player-hls') as HTMLAudioElement;
  hlsAudio.volume = 0.5;
  const progressiveAudio = document.getElementById('player-progressive') as HTMLAudioElement;
  progressiveAudio.volume = 0.5;

  const engineEntries: EngineEntry[] = [
    [(url: string) => url.endsWith('.m3u8'), hlsEngineFactory, () => hlsAudio],
    [() => true, progressiveEngineFactory, () => progressiveAudio],
  ];

  return new PlaybackService(engineEntries);
}

async function bootstrap() {
  monkeyPatchFetch();

  const service = createPlaybackService();

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <PlaybackServiceProvider value={service}>
        <Provider store={store}>
          <App />
        </Provider>
      </PlaybackServiceProvider>
    </React.StrictMode>,
  );
}

bootstrap();
