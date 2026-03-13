import { Subject, fromEvent } from 'rxjs';
import { distinctUntilChanged, map, skip, startWith, takeUntil } from 'rxjs/operators';
import type { IHls } from './IHls';

export type HlsPlayerEvent =
  | { type: 'loading' }
  | { type: 'playbackStateChanged'; state: 'playing' | 'paused' | 'ended' | 'buffering' }
  | { type: 'currentTimeChanged'; currentTime: number }
  | { type: 'durationChanged'; duration: number }
  | { type: 'volumeChanged'; volume: number }
  | { type: 'mutedChanged'; muted: boolean }
  | { type: 'seeking' }
  | { type: 'seeked' };

export class HlsPlayerEngine {
  private audio: HTMLAudioElement;
  private hls: IHls | null;
  private mediaAttached = false;
  private pendingUrl: string | null = null;
  private loaded = false;
  private destroy$ = new Subject<void>();
  readonly events$ = new Subject<HlsPlayerEvent>();

  constructor(audio: HTMLAudioElement, hls: IHls) {
    this.audio = audio;
    this.hls = hls;
    this.setupHls(hls, audio);
    this.setupAudioEvents(audio);
  }

  private emitInitialState(): void {
    this.events$.next({ type: 'loading' });
    this.events$.next({ type: 'volumeChanged', volume: this.audio.volume });
    this.events$.next({ type: 'mutedChanged', muted: this.audio.muted });
  }

  private setupHls(hls: IHls, audio: HTMLAudioElement): void {
    hls.once('hlsMediaAttached', () => {
      this.mediaAttached = true;
      if (!this.pendingUrl) return;
      this.hls?.loadSource(this.pendingUrl);
      this.pendingUrl = null;
    });
    hls.attachMedia(audio);
  }

  private setupAudioEvents(audio: HTMLAudioElement): void {
    fromEvent(audio, 'play').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'playing' }));

    fromEvent(audio, 'pause').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'paused' }));

    fromEvent(audio, 'ended').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'ended' }));

    fromEvent(audio, 'waiting').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'buffering' }));

    fromEvent(audio, 'timeupdate').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'currentTimeChanged', currentTime: audio.currentTime }));

    fromEvent(audio, 'durationchange').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'durationChanged', duration: audio.duration }));

    fromEvent(audio, 'seeking').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'seeking' }));

    fromEvent(audio, 'seeked').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'seeked' }));

    const volumeChange$ = fromEvent(audio, 'volumechange').pipe(takeUntil(this.destroy$));

    volumeChange$.pipe(map(() => audio.volume), startWith(audio.volume), distinctUntilChanged(), skip(1))
      .subscribe(volume => this.events$.next({ type: 'volumeChanged', volume }));

    volumeChange$.pipe(map(() => audio.muted), startWith(audio.muted), distinctUntilChanged(), skip(1))
      .subscribe(muted => this.events$.next({ type: 'mutedChanged', muted }));
  }

  load(url: string): void {
    if (!this.hls) throw new Error('HlsPlayerEngine has been destroyed');
    if (this.loaded) throw new Error('HlsPlayerEngine already loaded a source');
    this.loaded = true;
    this.emitInitialState();
    if (!this.mediaAttached) {
      this.pendingUrl = url;
      return;
    }
    this.hls.loadSource(url);
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

  setVolume(volume: number): void {
    this.audio.volume = volume;
  }

  setMuted(muted: boolean): void {
    this.audio.muted = muted;
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.events$.complete();
    this.hls?.destroy();
    this.hls = null;
  }
}
