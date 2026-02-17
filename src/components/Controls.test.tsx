import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Controls from './Controls';
import { renderWithProviders as render } from '../test/test-utils';

// Mock the hooks
vi.mock('../hooks', () => ({
	useAppDispatch: () => vi.fn(),
	useAppSelector: (selector: any) =>
		selector({
			player: {
				isPlaying: false,
				muted: false,
				volume: 0.5,
				currentTime: 30,
				duration: 120,
				isLive: false,
				status: 'ready',
			},
		}),
}));

describe('Controls', () => {
	it('renders play button when not playing', () => {
		render(<Controls />);
		expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
	});

	it('renders unmute button when not muted', () => {
		render(<Controls />);
		expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
	});

	it('displays the volume slider', () => {
		render(<Controls />);
		const volumeSlider = screen.getByLabelText(/volume/i);
		expect(volumeSlider).toBeInTheDocument();
		expect(volumeSlider).toHaveAttribute('type', 'range');
	});

	it('displays formatted time for current time and duration', () => {
		render(<Controls />);
		const times = screen.getAllByText(/:/);
		expect(times.length).toBeGreaterThanOrEqual(2);
	});

	it('displays the seek slider', () => {
		render(<Controls />);
		const seekSlider = screen.getByRole('slider', { name: '' });
		expect(seekSlider).toBeInTheDocument();
		expect(seekSlider).toHaveClass('seek');
	});

	it('displays status text', () => {
		render(<Controls />);
		expect(screen.getByText('ready')).toBeInTheDocument();
	});
});
