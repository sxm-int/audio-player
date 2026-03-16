export type PlaybackItem = {
  id: string;
  title: string;
  url: string;
};

export type PlaybackEvent =
  | { type: 'loading' }
  | { type: 'playbackStateChanged'; state: 'playing' | 'paused' | 'ended' | 'buffering' }
  | { type: 'currentTimeChanged'; currentTime: number }
  | { type: 'durationChanged'; duration: number }
  | { type: 'volumeChanged'; volume: number }
  | { type: 'mutedChanged'; muted: boolean }
  | { type: 'seeking' }
  | { type: 'seeked' };
