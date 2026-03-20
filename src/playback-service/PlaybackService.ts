import { Subject } from 'rxjs';
import type { Observable } from 'rxjs';
import type { PlaybackItem } from './PlaybackTypes';
import type { IMediaPlayer, EngineFactory } from './IMediaPlayer';
import type { PlaybackEvent } from './PlaybackTypes';

export type EngineEntry = [(url: string) => boolean, EngineFactory, () => HTMLAudioElement];

export class PlaybackService {
  private engines: EngineEntry[];
  private engine: IMediaPlayer | null = null;
  private destroyed = false;
  private eventsSubject = new Subject<PlaybackEvent>();
  readonly events$: Observable<PlaybackEvent> = this.eventsSubject.asObservable();

  constructor(engines: EngineEntry[]) {
    this.engines = engines;
  }

  tune(item: PlaybackItem): void {
    if (this.destroyed) throw new Error('PlaybackService has been destroyed');
    this.engine?.destroy();
    const entry = this.engines.find(([predicate]) => predicate(item.url));
    if (!entry) {
      this.eventsSubject.next({ type: 'playbackStateChanged', state: 'error' });
      return;
    }
    const engine = entry[1](entry[2]);
    this.engine = engine;
    engine.events$.subscribe(e => this.eventsSubject.next(e));
    engine.load(item.url);
    this.eventsSubject.next({ type: 'mediaChanged', url: item.url, title: item.title });
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
