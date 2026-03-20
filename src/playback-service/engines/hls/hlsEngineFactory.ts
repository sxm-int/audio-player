import Hls from 'hls.js';
import type { EngineFactory } from '../../IMediaPlayer';
import { HlsPlayerEngine } from './HlsPlayerEngine';

export const hlsEngineFactory: EngineFactory = (getAudio) => {
  return new HlsPlayerEngine(getAudio, new Hls());
};
