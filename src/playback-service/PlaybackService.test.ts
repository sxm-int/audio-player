import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Subject } from 'rxjs';
import { PlaybackService } from './PlaybackService';
import type { PlaybackItem, PlaybackEvent } from './PlaybackTypes';

const makeEngine = () => ({ load: vi.fn(), destroy: vi.fn(), play: vi.fn(), pause: vi.fn(), seek: vi.fn(), setVolume: vi.fn(), setMuted: vi.fn(), events$: new Subject<PlaybackEvent>() });

describe('PlaybackService', () => {
  const item: PlaybackItem = { id: '1', title: 'Test', url: 'https://example.com/stream.m3u8' };

  let engine: ReturnType<typeof makeEngine>;
  let service: PlaybackService;

  beforeEach(() => {
    engine = makeEngine();
    service = new PlaybackService([[() => true, vi.fn().mockReturnValue(engine), () => ({} as HTMLAudioElement)]]);
    service.tune(item);
  });

  describe('tune', () => {
    it('calls the engine factory and loads the item url', () => {
      expect(engine.load).toHaveBeenCalledWith(item.url);
    });

    it('emits a mediaChanged event with the url', () => {
      const received: unknown[] = [];
      service.events$.subscribe(e => received.push(e));
      service.tune(item);
      expect(received).toContainEqual({ type: 'mediaChanged', url: item.url, title: item.title });
    });

    it('destroys the previous engine when called again', () => {
      const engine2 = makeEngine();
      const factory = vi.fn().mockReturnValueOnce(engine).mockReturnValueOnce(engine2);
      const s = new PlaybackService([[() => true, factory, () => ({} as HTMLAudioElement)]]);
      s.tune(item);
      s.tune(item);
      expect(engine.destroy).toHaveBeenCalled();
    });
  });

  describe('playback controls', () => {
    it('delegates play to the current engine', () => {
      service.play();
      expect(engine.play).toHaveBeenCalled();
    });

    it('delegates pause to the current engine', () => {
      service.pause();
      expect(engine.pause).toHaveBeenCalled();
    });

    it('delegates seek to the current engine', () => {
      service.seek(30);
      expect(engine.seek).toHaveBeenCalledWith(30);
    });

    it('delegates setVolume to the current engine', () => {
      service.setVolume(0.5);
      expect(engine.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('delegates setMuted to the current engine', () => {
      service.setMuted(true);
      expect(engine.setMuted).toHaveBeenCalledWith(true);
    });
  });

  describe('events$', () => {
    it('forwards engine events', () => {
      const received: unknown[] = [];
      service.events$.subscribe(e => received.push(e));
      engine.events$.next({ type: 'loading' });
      expect(received).toContainEqual({ type: 'loading' });
    });

    it('forwards events from the new engine after re-tuning', () => {
      const engine2 = makeEngine();
      const factory = vi.fn().mockReturnValueOnce(engine).mockReturnValueOnce(engine2);
      const s = new PlaybackService([[() => true, factory, () => ({} as HTMLAudioElement)]]);
      s.tune(item);
      s.tune(item);
      const received: unknown[] = [];
      s.events$.subscribe(e => received.push(e));
      engine2.events$.next({ type: 'loading' });
      expect(received).toContainEqual({ type: 'loading' });
    });
  });

  describe('destroy', () => {
    it('destroys the current engine', () => {
      service.destroy();
      expect(engine.destroy).toHaveBeenCalled();
    });

    it('completes events$', () => {
      const complete = vi.fn();
      service.events$.subscribe({ complete });
      service.destroy();
      expect(complete).toHaveBeenCalled();
    });

    it('throws if tune is called after destroy', () => {
      service.destroy();
      expect(() => service.tune(item)).toThrow();
    });
  });
});
