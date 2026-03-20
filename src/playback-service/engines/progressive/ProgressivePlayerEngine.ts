import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import type { IMediaPlayer } from '../../IMediaPlayer';
import type { PlaybackEvent } from '../../PlaybackTypes';

export class ProgressivePlayerEngine implements IMediaPlayer {
  private audio: HTMLAudioElement;
  private loaded = false;
  private destroyed = false;
  private lastVolume: number;
  private lastMuted: boolean;
  private destroy$ = new Subject<void>();
  readonly events$ = new Subject<PlaybackEvent>();

  constructor(getAudio: () => HTMLAudioElement) {
    this.audio = getAudio();
    this.lastVolume = this.audio.volume;
    this.lastMuted = this.audio.muted;
    this.setupAudioEvents(this.audio);
  }

  private setupAudioEvents(audio: HTMLAudioElement): void {
    fromEvent(audio, 'play').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'playing' }));

    fromEvent(audio, 'pause').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'paused' }));

    fromEvent(audio, 'ended').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'ended' }));

    fromEvent(audio, 'volumechange').pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (audio.volume !== this.lastVolume) {
          this.lastVolume = audio.volume;
          this.events$.next({ type: 'volumeChanged', volume: audio.volume });
        }
        if (audio.muted !== this.lastMuted) {
          this.lastMuted = audio.muted;
          this.events$.next({ type: 'mutedChanged', muted: audio.muted });
        }
      });

    fromEvent(audio, 'seeked').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'seeked' }));

    fromEvent(audio, 'seeking').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'seeking' }));

    fromEvent(audio, 'durationchange').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'durationChanged', duration: audio.duration }));

    fromEvent(audio, 'timeupdate').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'currentTimeChanged', currentTime: audio.currentTime }));

    fromEvent(audio, 'waiting').pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (audio.readyState < 3) {
          this.events$.next({ type: 'playbackStateChanged', state: 'buffering' });
        }
      });

    fromEvent(audio, 'playing').pipe(takeUntil(this.destroy$))
      .subscribe(() => this.events$.next({ type: 'playbackStateChanged', state: 'playing' }));
  }

  private emitInitialState(): void {
    this.events$.next({ type: 'loading' });
    this.events$.next({ type: 'volumeChanged', volume: this.audio.volume });
    this.events$.next({ type: 'mutedChanged', muted: this.audio.muted });
  }

  load(url: string): void {
    if (this.destroyed) throw new Error('ProgressivePlayerEngine has been destroyed');
    if (this.loaded) throw new Error('ProgressivePlayerEngine already loaded a source');
    this.loaded = true;
    this.emitInitialState();
    this.audio.src = url;
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
    this.destroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
    this.events$.complete();
    this.audio.removeAttribute('src');
    this.audio.load();
  }
}
