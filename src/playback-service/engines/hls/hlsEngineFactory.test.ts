import { describe, it, expect, vi } from 'vitest';
import { hlsEngineFactory } from './hlsEngineFactory';
import { HlsPlayerEngine } from './HlsPlayerEngine';

vi.mock('hls.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    attachMedia: vi.fn(),
    loadSource: vi.fn(),
    once: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  })),
}));

describe('hlsEngineFactory', () => {
  it('returns an HlsPlayerEngine', () => {
    const audio = document.createElement('audio');
    expect(hlsEngineFactory(() => audio)).toBeInstanceOf(HlsPlayerEngine);
  });
});
