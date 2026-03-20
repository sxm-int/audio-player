import type { EngineFactory } from '../../IMediaPlayer';
import { ProgressivePlayerEngine } from './ProgressivePlayerEngine';

export const progressiveEngineFactory: EngineFactory = (getAudio) => {
  return new ProgressivePlayerEngine(getAudio);
};
