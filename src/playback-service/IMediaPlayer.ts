import type { Observable } from 'rxjs';
import type { PlaybackEvent } from './PlaybackTypes';

export type EngineFactory = (getAudio: () => HTMLAudioElement) => IMediaPlayer;

export interface IMediaPlayer {
  events$: Observable<PlaybackEvent>;
  load(url: string): void;
  play(): void;
  pause(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  destroy(): void;
}
