import Hls from 'hls.js';
import type { EngineFactory } from '../../IMediaPlayer';
import { HlsPlayerEngine } from './HlsPlayerEngine';

export const hlsEngineFactory: EngineFactory = (audio) => {
  return new HlsPlayerEngine(audio, new Hls());
};
