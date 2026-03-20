import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressivePlayerEngine } from './ProgressivePlayerEngine';

describe('ProgressivePlayerEngine', () => {
  let audio: HTMLAudioElement;
  let engine: ProgressivePlayerEngine;

  beforeEach(() => {
    audio = document.createElement('audio');
    engine = new ProgressivePlayerEngine(() => audio);
  });

  it('exists', () => {
    expect(engine).toBeInstanceOf(ProgressivePlayerEngine);
  });

  describe('load', () => {
    it('sets src and emits initial state events', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      Object.defineProperty(audio, 'volume', { value: 0.5, configurable: true });
      Object.defineProperty(audio, 'muted', { value: true, configurable: true });
      engine.load('https://example.com/track.mp3');
      expect(audio.src).toBe('https://example.com/track.mp3');
      expect(next).toHaveBeenCalledWith({ type: 'loading' });
      expect(next).toHaveBeenCalledWith({ type: 'volumeChanged', volume: 0.5 });
      expect(next).toHaveBeenCalledWith({ type: 'mutedChanged', muted: true });
    });

    it('throws if load is called after destroy', () => {
      engine.destroy();
      expect(() => engine.load('https://example.com/track.mp3')).toThrow();
    });

    it('throws if load is called a second time', () => {
      engine.load('https://example.com/track.mp3');
      expect(() => engine.load('https://example.com/other.mp3')).toThrow();
    });
  });

  describe('play', () => {
    it('calls play on the audio element', () => {
      audio.play = vi.fn();
      engine.play();
      expect(audio.play).toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('calls pause on the audio element', () => {
      audio.pause = vi.fn();
      engine.pause();
      expect(audio.pause).toHaveBeenCalled();
    });
  });

  describe('seek', () => {
    it('sets currentTime on the audio element', () => {
      engine.seek(30);
      expect(audio.currentTime).toBe(30);
    });
  });

  describe('setVolume', () => {
    it('sets volume on the audio element', () => {
      engine.setVolume(0.5);
      expect(audio.volume).toBe(0.5);
    });
  });

  describe('setMuted', () => {
    it('sets muted on the audio element', () => {
      engine.setMuted(true);
      expect(audio.muted).toBe(true);
    });
  });

  describe('events$', () => {
    it('exposes an events$ observable', () => {
      expect(engine.events$).toBeDefined();
    });

    it('emits playbackStateChanged playing when audio play event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('play'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'playing' });
    });

    it('emits mutedChanged when volumechange fires and muted has changed', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      Object.defineProperty(audio, 'muted', { value: true, configurable: true });
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).toHaveBeenCalledWith({ type: 'mutedChanged', muted: true });
    });

    it('does not emit mutedChanged when volumechange fires but muted has not changed', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'mutedChanged' }));
    });

    it('does not emit volumeChanged when volumechange fires but volume has not changed', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'volumeChanged' }));
    });

    it('emits volumeChanged with volume when audio volumechange event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      Object.defineProperty(audio, 'volume', { value: 0.8, configurable: true });
      audio.dispatchEvent(new Event('volumechange'));
      expect(next).toHaveBeenCalledWith({ type: 'volumeChanged', volume: 0.8 });
    });

    it('emits seeked when audio seeked event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('seeked'));
      expect(next).toHaveBeenCalledWith({ type: 'seeked' });
    });

    it('emits seeking when audio seeking event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('seeking'));
      expect(next).toHaveBeenCalledWith({ type: 'seeking' });
    });

    it('emits durationChanged with duration when audio durationchange event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      Object.defineProperty(audio, 'duration', { value: 180, configurable: true });
      audio.dispatchEvent(new Event('durationchange'));
      expect(next).toHaveBeenCalledWith({ type: 'durationChanged', duration: 180 });
    });

    it('emits currentTimeChanged with currentTime when audio timeupdate event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      Object.defineProperty(audio, 'currentTime', { value: 42, configurable: true });
      audio.dispatchEvent(new Event('timeupdate'));
      expect(next).toHaveBeenCalledWith({ type: 'currentTimeChanged', currentTime: 42 });
    });

    it('emits playbackStateChanged buffering when audio waiting event fires and readyState is less than 3', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      Object.defineProperty(audio, 'readyState', { value: 2, configurable: true });
      audio.dispatchEvent(new Event('waiting'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'buffering' });
    });

    it('does not emit buffering when waiting fires but readyState is 3 or higher', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      Object.defineProperty(audio, 'readyState', { value: 3, configurable: true });
      audio.dispatchEvent(new Event('waiting'));
      expect(next).not.toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'buffering' });
    });

    it('emits playbackStateChanged ended when audio ended event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('ended'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'ended' });
    });

    it('emits playbackStateChanged paused when audio pause event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('pause'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'paused' });
    });

    it('emits playbackStateChanged playing when audio playing event fires', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      audio.dispatchEvent(new Event('playing'));
      expect(next).toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'playing' });
    });
  });

  describe('destroy', () => {
    it('clears audio src and calls load when destroyed', () => {
      audio.load = vi.fn();
      engine.destroy();
      expect(audio.hasAttribute('src')).toBe(false);
      expect(audio.load).toHaveBeenCalled();
    });

    it('completes events$ on destroy', () => {
      const complete = vi.fn();
      engine.events$.subscribe({ complete });
      engine.destroy();
      expect(complete).toHaveBeenCalled();
    });

    it('does not emit events after destroy', () => {
      const next = vi.fn();
      engine.events$.subscribe(next);
      engine.destroy();
      audio.dispatchEvent(new Event('playing'));
      expect(next).not.toHaveBeenCalledWith({ type: 'playbackStateChanged', state: 'playing' });
    });
  });
});
