import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import type { RootState } from '../store';

// Create a custom render function that includes Redux Provider
export function renderWithProviders(
	ui: React.ReactElement,
	{
		testStore = store,
		...renderOptions
	}: {
		testStore?: typeof store;
	} & Omit<RenderOptions, 'wrapper'> = {}
) {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <Provider store={testStore}>{children}</Provider>;
	}

	return { store: testStore, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
