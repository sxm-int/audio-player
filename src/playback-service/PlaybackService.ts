import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import type { PlaybackItem } from './PlaybackTypes';
import type { IMediaPlayer, EngineFactory } from './IMediaPlayer';
import type { PlaybackEvent } from './PlaybackTypes';

export class PlaybackService {
  private audio: HTMLAudioElement;
  private factory: EngineFactory;
  private engine: IMediaPlayer | null = null;
  private destroyed = false;
  private eventsSubject = new Subject<PlaybackEvent>();
  readonly events$: Observable<PlaybackEvent> = this.eventsSubject.asObservable();

  constructor(audio: HTMLAudioElement, factory: EngineFactory) {
    this.audio = audio;
    this.factory = factory;
  }

  tune(item: PlaybackItem): void {
    if (this.destroyed) throw new Error('PlaybackService has been destroyed');
    this.engine?.destroy();
    const engine = this.factory(this.audio);
    this.engine = engine;
    engine.load(item.url);
    engine.events$.subscribe(e => this.eventsSubject.next(e));
  }

  play(): void {
    this.engine?.play();
  }

  pause(): void {
    this.engine?.pause();
  }

  seek(time: number): void {
    this.engine?.seek(time);
  }

  setVolume(volume: number): void {
    this.engine?.setVolume(volume);
  }

  setMuted(muted: boolean): void {
    this.engine?.setMuted(muted);
  }

  destroy(): void {
    this.destroyed = true;
    this.engine?.destroy();
    this.eventsSubject.complete();
  }
}
