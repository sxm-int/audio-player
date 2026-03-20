import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { store } from '../store';
import type { RootState } from '../store';
import { PlaybackServiceProvider } from '../playback-service/PlaybackServiceContext';
import type { PlaybackService } from '../playback-service/PlaybackService';

const defaultMockService = {
	tune: vi.fn(),
	play: vi.fn(),
	pause: vi.fn(),
	seek: vi.fn(),
	setVolume: vi.fn(),
	setMuted: vi.fn(),
	destroy: vi.fn(),
	events$: new Subject(),
} as unknown as PlaybackService;

// Create a custom render function that includes Redux Provider
export function renderWithProviders(
	ui: React.ReactElement,
	{
		testStore = store,
		mockService = defaultMockService,
		...renderOptions
	}: {
		testStore?: typeof store;
		mockService?: PlaybackService;
	} & Omit<RenderOptions, 'wrapper'> = {}
) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<PlaybackServiceProvider value={mockService}>
				<Provider store={testStore}>{children}</Provider>
			</PlaybackServiceProvider>
		);
	}

	return { store: testStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
