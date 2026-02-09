import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { StreamItem } from './api/streams';

export type PlayerState = {
	url: string;
	status: 'idle' | 'loading' | 'ready' | 'error';
	error?: string;
	isPlaying: boolean;
	muted: boolean;
	volume: number;
	duration: number;
	currentTime: number;
	isLive: boolean;
	requestedTime: number | null;
};

const initialState: PlayerState = {
	url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
	status: 'idle',
	isPlaying: false,
	muted: false,
	volume: 1,
	duration: 0,
	currentTime: 0,
	isLive: false,
	requestedTime: null,
};

const playerSlice = createSlice({
	name: 'player',
	initialState,
	reducers: {
		setUrl(state, action: PayloadAction<string>) {
			state.url = action.payload.trim();
			state.status = 'loading';
			state.error = undefined;
		},
		setStatus(state, action: PayloadAction<PlayerState['status']>) {
			state.status = action.payload;
		},
		setError(state, action: PayloadAction<string | undefined>) {
			state.error = action.payload;
			if (action.payload) state.status = 'error';
		},
		setPlaying(state, action: PayloadAction<boolean>) {
			state.isPlaying = action.payload;
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
		setIsLive(state, action: PayloadAction<boolean>) {
			state.isLive = action.payload;
		},
		setRequestedTime(state, action: PayloadAction<number | null>) {
			state.requestedTime = action.payload;
		},
	},
});

export const {
	setUrl,
	setStatus,
	setError,
	setPlaying,
	setMuted,
	setVolume,
	setDuration,
	setCurrentTime,
	setIsLive,
	setRequestedTime,
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

export type AuthState = {
	isUserPremium: boolean;
};

const authInitialState: AuthState = {
	isUserPremium: false,
};

const authSlice = createSlice({
	name: 'auth',
	initialState: authInitialState,
	reducers: {
		setUserPremium(state, action: PayloadAction<boolean>) {
			state.isUserPremium = action.payload;
		},
	},
});

export const { setUserPremium } = authSlice.actions;

export const store = configureStore({
	reducer: {
		player: playerSlice.reducer,
		streams: streamsSlice.reducer,
		auth: authSlice.reducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;