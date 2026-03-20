import { describe, it, expect } from 'vitest';
import { progressiveEngineFactory } from './progressiveEngineFactory';
import { ProgressivePlayerEngine } from './ProgressivePlayerEngine';

describe('progressiveEngineFactory', () => {
  it('returns a ProgressivePlayerEngine', () => {
    const audio = document.createElement('audio');
    expect(progressiveEngineFactory(() => audio)).toBeInstanceOf(ProgressivePlayerEngine);
  });
});
