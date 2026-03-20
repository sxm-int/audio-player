import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { StreamItem } from './api/streams';

export type PlayerState = {
  url: string;
  title: string;
  playbackState: 'playing' | 'paused' | 'ended' | 'buffering' | 'idle' | 'error';
  muted: boolean;
  volume: number;
  duration: number;
  currentTime: number;
};

const initialState: PlayerState = {
  url: '',
  title: '',
  playbackState: 'idle',
  muted: false,
  volume: 0.07,
  duration: 0,
  currentTime: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setUrl(state, action: PayloadAction<string>) {
      state.url = action.payload;
    },
    setTitle(state, action: PayloadAction<string>) {
      state.title = action.payload;
    },
    setPlaybackState(state, action: PayloadAction<PlayerState['playbackState']>) {
      state.playbackState = action.payload;
    },
    setMuted(state, action: PayloadAction<boolean>) {
      state.muted = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = Math.min(1, Math.max(0, action.payload));
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
  },
});

export const {
  setUrl,
  setTitle,
  setPlaybackState,
  setMuted,
  setVolume,
  setDuration,
  setCurrentTime,
} = playerSlice.actions;

export type StreamsState = {
  items: StreamItem[];
};

const streamsInitialState: StreamsState = {
  items: [],
};

const streamsSlice = createSlice({
  name: 'streams',
  initialState: streamsInitialState,
  reducers: {
    setStreams(state, action: PayloadAction<StreamItem[]>) {
      state.items = action.payload;
    },
  },
});

export const { setStreams } = streamsSlice.actions;

export const store = configureStore({
  reducer: {
    player: playerSlice.reducer,
    streams: streamsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
