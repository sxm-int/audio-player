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

  it('calls attachMedia with the audio element on construction', () => {
    expect(hls.attachMedia).toHaveBeenCalledWith(audio);
  });

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

  it('calls destroy on hls when destroyed', () => {
    service.destroy();
    expect(hls.destroy).toHaveBeenCalled();
  });

  it('throws if load is called after destroy', () => {
    service.destroy();
    expect(() => service.load('https://example.com/stream.m3u8')).toThrow();
  });

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

  it('has an on method', () => {
    expect(typeof service.on).toBe('function');
  });

  it('has an off method', () => {
    expect(typeof service.off).toBe('function');
  });

  it('does not call handler after off is called', () => {
    const handler = vi.fn();
    service.on('loading', handler);
    service.off('loading', handler);
    service.load('https://example.com/stream.m3u8');
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not emit any audio events after destroy', () => {
    const events = ['playing', 'paused', 'ended', 'timeupdate', 'durationchange', 'volumechange', 'mutedchange', 'buffering', 'seeking', 'seeked'];
    const handlers = events.map((event) => {
      const handler = vi.fn();
      service.on(event, handler);
      return handler;
    });
    service.destroy();
    audio.dispatchEvent(new Event('play'));
    audio.dispatchEvent(new Event('pause'));
    audio.dispatchEvent(new Event('ended'));
    audio.dispatchEvent(new Event('timeupdate'));
    audio.dispatchEvent(new Event('durationchange'));
    audio.dispatchEvent(new Event('volumechange'));
    audio.dispatchEvent(new Event('waiting'));
    audio.dispatchEvent(new Event('seeking'));
    audio.dispatchEvent(new Event('seeked'));
    handlers.forEach((handler) => expect(handler).not.toHaveBeenCalled());
  });

  it('emits ended when audio ended event fires', () => {
    const handler = vi.fn();
    service.on('ended', handler);
    audio.dispatchEvent(new Event('ended'));
    expect(handler).toHaveBeenCalled();
  });

  it('emits paused when audio pause event fires', () => {
    const handler = vi.fn();
    service.on('paused', handler);
    audio.dispatchEvent(new Event('pause'));
    expect(handler).toHaveBeenCalled();
  });

  it('emits playing when audio play event fires', () => {
    const handler = vi.fn();
    service.on('playing', handler);
    audio.dispatchEvent(new Event('play'));
    expect(handler).toHaveBeenCalled();
  });

  it('does not emit timeupdate after destroy', () => {
    const handler = vi.fn();
    service.on('timeupdate', handler);
    service.destroy();
    audio.dispatchEvent(new Event('timeupdate'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('emits timeupdate with current time when audio timeupdate event fires', () => {
    const handler = vi.fn();
    service.on('timeupdate', handler);
    Object.defineProperty(audio, 'currentTime', { value: 42, configurable: true });
    audio.dispatchEvent(new Event('timeupdate'));
    expect(handler).toHaveBeenCalledWith(42);
  });

  it('does not emit durationchange after destroy', () => {
    const handler = vi.fn();
    service.on('durationchange', handler);
    service.destroy();
    audio.dispatchEvent(new Event('durationchange'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('emits durationchange with duration when audio durationchange event fires', () => {
    const handler = vi.fn();
    service.on('durationchange', handler);
    Object.defineProperty(audio, 'duration', { value: 120, configurable: true });
    audio.dispatchEvent(new Event('durationchange'));
    expect(handler).toHaveBeenCalledWith(120);
  });

  it('emits seeking when audio seeking event fires', () => {
    const handler = vi.fn();
    service.on('seeking', handler);
    audio.dispatchEvent(new Event('seeking'));
    expect(handler).toHaveBeenCalled();
  });

  it('emits seeked when audio seeked event fires', () => {
    const handler = vi.fn();
    service.on('seeked', handler);
    audio.dispatchEvent(new Event('seeked'));
    expect(handler).toHaveBeenCalled();
  });

  it('emits buffering when audio waiting event fires', () => {
    const handler = vi.fn();
    service.on('buffering', handler);
    audio.dispatchEvent(new Event('waiting'));
    expect(handler).toHaveBeenCalled();
  });

  it('emits volumechange with initial volume on load', () => {
    const handler = vi.fn();
    service.on('volumechange', handler);
    Object.defineProperty(audio, 'volume', { value: 0.5, configurable: true });
    service.load('https://example.com/stream.m3u8');
    expect(handler).toHaveBeenCalledWith(0.5);
  });

  it('emits mutedchange with initial muted on load', () => {
    const handler = vi.fn();
    service.on('mutedchange', handler);
    Object.defineProperty(audio, 'muted', { value: true, configurable: true });
    service.load('https://example.com/stream.m3u8');
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('emits loading when load is called', () => {
    const handler = vi.fn();
    service.on('loading', handler);
    service.load('https://example.com/stream.m3u8');
    expect(handler).toHaveBeenCalled();
  });

  it('emits volumechange with volume when audio volumechange event fires', () => {
    const handler = vi.fn();
    service.on('volumechange', handler);
    Object.defineProperty(audio, 'volume', { value: 0.8, configurable: true });
    audio.dispatchEvent(new Event('volumechange'));
    expect(handler).toHaveBeenCalledWith(0.8);
  });

  it('does not emit volumechange if volume did not change', () => {
    const handler = vi.fn();
    service.on('volumechange', handler);
    audio.dispatchEvent(new Event('volumechange'));
    audio.dispatchEvent(new Event('volumechange'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not emit mutedchange if muted did not change', () => {
    const handler = vi.fn();
    service.on('mutedchange', handler);
    audio.dispatchEvent(new Event('volumechange'));
    audio.dispatchEvent(new Event('volumechange'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('emits mutedchange with muted when audio volumechange event fires', () => {
    const handler = vi.fn();
    service.on('mutedchange', handler);
    Object.defineProperty(audio, 'muted', { value: true, configurable: true });
    audio.dispatchEvent(new Event('volumechange'));
    expect(handler).toHaveBeenCalledWith(true);
  });
});
