import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PlaybackServiceProvider, usePlaybackService } from './PlaybackServiceContext';
import type { PlaybackService } from './PlaybackService';

describe('PlaybackServiceContext', () => {
  it('usePlaybackService returns the service provided', () => {
    const mockService = {} as PlaybackService;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <PlaybackServiceProvider value={mockService}>{children}</PlaybackServiceProvider>
    );
    const { result } = renderHook(() => usePlaybackService(), { wrapper });
    expect(result.current).toBe(mockService);
  });
});
