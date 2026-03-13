import type { IHls } from './IHls';

export class HlsPlayerEngine {
  private audio: HTMLAudioElement;
  private hls: IHls | null;
  private mediaAttached = false;
  private pendingUrl: string | null = null;
  private loaded = false;
  private prevMuted: boolean;
  private prevVolume: number;
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  private onPlay = () => this.emit('playing');
  private onPause = () => this.emit('paused');
  private onEnded = () => this.emit('ended');
  private onTimeUpdate = () => this.emit('timeupdate', this.audio.currentTime);
  private onDurationChange = () => this.emit('durationchange', this.audio.duration);
  private onWaiting = () => this.emit('buffering');
  private onSeeking = () => this.emit('seeking');
  private onSeeked = () => this.emit('seeked');
  private onVolumeChange = () => {
    if (this.audio.volume !== this.prevVolume) {
      this.prevVolume = this.audio.volume;
      this.emit('volumechange', this.audio.volume);
    }
    if (this.audio.muted !== this.prevMuted) {
      this.prevMuted = this.audio.muted;
      this.emit('mutedchange', this.audio.muted);
    }
  };

  constructor(audio: HTMLAudioElement, hls: IHls) {
    this.audio = audio;
    this.hls = hls;
    this.prevMuted = audio.muted;
    this.prevVolume = audio.volume;
    this.hls.once('hlsMediaAttached', () => {
      this.mediaAttached = true;
      if (!this.pendingUrl) {
        return;
      }
      this.hls?.loadSource(this.pendingUrl);
      this.pendingUrl = null;
    });
    this.hls.attachMedia(audio);
    this.audio.addEventListener('play', this.onPlay);
    this.audio.addEventListener('pause', this.onPause);
    this.audio.addEventListener('ended', this.onEnded);
    this.audio.addEventListener('timeupdate', this.onTimeUpdate);
    this.audio.addEventListener('durationchange', this.onDurationChange);
    this.audio.addEventListener('volumechange', this.onVolumeChange);
    this.audio.addEventListener('waiting', this.onWaiting);
    this.audio.addEventListener('seeking', this.onSeeking);
    this.audio.addEventListener('seeked', this.onSeeked);
  }

  play(): void {
    this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  seek(time: number): void {
    this.audio.currentTime = time;
  }

  load(url: string): void {
    if (!this.hls) throw new Error('HlsPlayerEngine has been destroyed');
    if (this.loaded) throw new Error('HlsPlayerEngine already loaded a source');
    this.loaded = true;
    this.emit('loading');
    this.emit('volumechange', this.audio.volume);
    this.emit('mutedchange', this.audio.muted);
    if (!this.mediaAttached) {
      this.pendingUrl = url;
      return;
    }
    this.hls.loadSource(url);
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }

  setMuted(muted: boolean): void {
    this.audio.muted = muted;
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }

  destroy(): void {
    this.audio.removeEventListener('play', this.onPlay);
    this.audio.removeEventListener('pause', this.onPause);
    this.audio.removeEventListener('ended', this.onEnded);
    this.audio.removeEventListener('timeupdate', this.onTimeUpdate);
    this.audio.removeEventListener('durationchange', this.onDurationChange);
    this.audio.removeEventListener('volumechange', this.onVolumeChange);
    this.audio.removeEventListener('waiting', this.onWaiting);
    this.audio.removeEventListener('seeking', this.onSeeking);
    this.audio.removeEventListener('seeked', this.onSeeked);
    this.hls?.destroy();
    this.hls = null;
  }
}
