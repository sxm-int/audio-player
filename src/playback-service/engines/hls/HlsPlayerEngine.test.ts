import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HlsPlayerEngine } from './HlsPlayerEngine';

describe('HlsPlayerEngine', () => {
  let audio: HTMLAudioElement;
  let hls: { loadSource: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn>; attachMedia: ReturnType<typeof vi.fn>; once: ReturnType<typeof vi.fn> };
  let service: HlsPlayerEngine;
  let fireMediaAttached: () => void;

  beforeEach(() => {
    audio = document.createElement('audio');
    hls = { loadSource: vi.fn(), destroy: vi.fn(), attachMedia: vi.fn(), once: vi.fn() };
    let mediaAttachedHandler: (() => void) | undefined;
    hls.once.mockImplementation((_event: string, handler: () => void) => {
      mediaAttachedHandler = handler;
    });
    service = new HlsPlayerEngine(audio, hls);
    fireMediaAttached = () => mediaAttachedHandler!();
  });

  describe('construction', () => {
    it('calls attachMedia with the audio element', () => {
      expect(hls.attachMedia).toHaveBeenCalledWith(audio);
    });
  });

  describe('load', () => {
    it('calls loadSource immediately if media is already attached', () => {
      fireMediaAttached();
      service.load('https://example.com/stream.m3u8');
      expect(hls.loadSource).toHaveBeenCalledWith('https://example.com/stream.m3u8');
    });

    it('defers loadSource until MEDIA_ATTACHED fires', () => {
      service.load('https://example.com/stream.m3u8');
      expect(hls.loadSource).not.toHaveBeenCalled();
      fireMediaAttached();
      expect(hls.loadSource).toHaveBeenCalledWith('https://example.com/stream.m3u8');
    });

    it('throws if load is called a second time', () => {
      fireMediaAttached();
      service.load('https://example.com/stream.m3u8');
      expect(() => service.load('https://example.com/other.m3u8')).toThrow();
    });

    it('throws if load is called after destroy', () => {
      service.destroy();
      expect(() => service.load('https://example.com/stream.m3u8')).toThrow();
    });

    it('emits a loading event on events$ when load is called', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      service.load('https://example.com/stream.m3u8');
      expect(next).toHaveBeenCalledWith({ type: 'loading' });
    });

    it('emits volumeChanged on events$ with initial volume on load', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      Object.defineProperty(audio, 'volume', { value: 0.5, configurable: true });
      service.load('https://example.com/stream.m3u8');
      expect(next).toHaveBeenCalledWith({ type: 'volumeChanged', volume: 0.5 });
    });

    it('emits mutedChanged on events$ with initial muted on load', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      Object.defineProperty(audio, 'muted', { value: true, configurable: true });
      service.load('https://example.com/stream.m3u8');
      expect(next).toHaveBeenCalledWith({ type: 'mutedChanged', muted: true });
    });
  });

  describe('playback controls', () => {
    it('calls play on the audio element', () => {
      audio.play = vi.fn();
      service.play();
      expect(audio.play).toHaveBeenCalled();
    });

    it('calls pause on the audio element', () => {
      audio.pause = vi.fn();
      service.pause();
      expect(audio.pause).toHaveBeenCalled();
    });

    it('sets currentTime on the audio element when seeking', () => {
      service.seek(30);
      expect(audio.currentTime).toBe(30);
    });

    it('sets volume on the audio element', () => {
      service.setVolume(0.5);
      expect(audio.volume).toBe(0.5);
    });

    it('sets muted on the audio element', () => {
      service.setMuted(true);
      expect(audio.muted).toBe(true);
    });
  });

  describe('destroy', () => {
    it('calls destroy on hls when destroyed', () => {
      service.destroy();
      expect(hls.destroy).toHaveBeenCalled();
    });

    it('completes events$ when destroyed', () => {
      const complete = vi.fn();
      service.events$.subscribe({ complete });
      service.destroy();
      expect(complete).toHaveBeenCalled();
    });

    it('clears audio src and calls load when destroyed', () => {
      audio.load = vi.fn();
      audio.src = 'https://example.com/stream.m3u8';
      service.destroy();
      expect(audio.hasAttribute('src')).toBe(false);
      expect(audio.load).toHaveBeenCalled();
    });
  });

  describe('events$', () => {
    it('exposes an events$ observable', () => {
      expect(service.events$).toBeDefined();
    });

    it('emits playbackStateChanged playing when audio play event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('play'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'playing' });
    });

    it('emits playbackStateChanged paused when audio pause event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('pause'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'paused' });
    });

    it('emits playbackStateChanged ended when audio ended event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('ended'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'ended' });
    });

    it('emits playbackStateChanged buffering when audio waiting event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('waiting'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'buffering' });
    });

    it('emits seeking when audio seeking event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('seeking'));
      expect(next).toHaveBeenCalledWith({ type: 'seeking' });
    });

    it('emits seeked when audio seeked event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('seeked'));
      expect(next).toHaveBeenCalledWith({ type: 'seeked' });
    });

    it('emits currentTimeChanged with currentTime when audio timeupdate event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      Object.defineProperty(audio, 'currentTime', { value: 42, configurable: true });
      audio.dispatchEvent(new Event('timeupdate'));
      expect(next).toHaveBeenCalledWith({ type: 'currentTimeChanged', currentTime: 42 });
    });

    it('emits durationChanged with duration when audio durationchange event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      Object.defineProperty(audio, 'duration', { value: 120, configurable: true });
      audio.dispatchEvent(new Event('durationchange'));
      expect(next).toHaveBeenCalledWith({ type: 'durationChanged', duration: 120 });
    });

    it('emits volumeChanged with volume when audio volumechange event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      Object.defineProperty(audio, 'volume', { value: 0.8, configurable: true });
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).toHaveBeenCalledWith({ type: 'volumeChanged', volume: 0.8 });
    });

    it('does not emit volumeChanged if volume did not change', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('volumechange'));
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'volumeChanged' }));
    });

    it('emits mutedChanged with muted when audio volumechange event fires', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      Object.defineProperty(audio, 'muted', { value: true, configurable: true });
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).toHaveBeenCalledWith({ type: 'mutedChanged', muted: true });
    });

    it('does not emit mutedChanged if muted did not change', () => {
      const next = vi.fn();
      service.events$.subscribe(next);
      audio.dispatchEvent(new Event('volumechange'));
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'mutedChanged' }));
    });
  });
});
