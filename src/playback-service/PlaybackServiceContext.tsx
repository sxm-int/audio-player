import { createContext, useContext } from 'react';
import type { PlaybackService } from './PlaybackService';

const PlaybackServiceContext = createContext<PlaybackService | null>(null);

export const PlaybackServiceProvider = PlaybackServiceContext.Provider;

export const usePlaybackService = (): PlaybackService => {
  const service = useContext(PlaybackServiceContext);
  if (!service) throw new Error('usePlaybackService must be used within a PlaybackServiceProvider');
  return service;
};
