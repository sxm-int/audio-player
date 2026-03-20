import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Controls from './Controls';
import { renderWithProviders as render } from '../test/test-utils';
import type { PlaybackService } from '../playback-service/PlaybackService';

let mockPlayerState = {
  playbackState: 'paused',
  muted: false,
  volume: 0.5,
  currentTime: 30,
  duration: 120,
  status: 'ready',
};

// Mock the hooks
vi.mock('../hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ player: mockPlayerState }),
}));

describe('Controls', () => {
  describe('play button', () => {
    it('is visible when paused', () => {
      mockPlayerState.playbackState = 'paused';
      render(<Controls />);
      expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
    });

    it('is visible when ended', () => {
      mockPlayerState.playbackState = 'ended';
      render(<Controls />);
      expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument();
    });

    it('calls service.play when clicked', async () => {
      mockPlayerState.playbackState = 'paused';
      const mockService = { play: vi.fn() } as unknown as PlaybackService;
      render(<Controls />, { mockService });
      await userEvent.click(screen.getByRole('button', { name: /^play$/i }));
      expect(mockService.play).toHaveBeenCalled();
    });
  });

  describe('pause button', () => {
    it('is visible when playing', () => {
      mockPlayerState.playbackState = 'playing';
      render(<Controls />);
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it('is visible when buffering', () => {
      mockPlayerState.playbackState = 'buffering';
      render(<Controls />);
      expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    });

    it.each(['paused', 'ended', 'idle'])('is not visible when %s', (state) => {
      mockPlayerState.playbackState = state;
      render(<Controls />);
      expect(screen.queryByRole('button', { name: /pause/i })).not.toBeInTheDocument();
    });

    it('calls service.pause when clicked', async () => {
      mockPlayerState.playbackState = 'playing';
      const mockService = { pause: vi.fn() } as unknown as PlaybackService;
      render(<Controls />, { mockService });
      await userEvent.click(screen.getByRole('button', { name: /pause/i }));
      expect(mockService.pause).toHaveBeenCalled();
    });
  });

  describe('volume', () => {
    it('displays a volume slider', () => {
      render(<Controls />);
      expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument();
    });

    it('reflects current volume', () => {
      mockPlayerState = { ...mockPlayerState, volume: 0.75 };
      render(<Controls />);
      expect(screen.getByRole('slider', { name: /volume/i })).toHaveValue('0.75');
    });

    it('calls service.setVolume when slider changes', () => {
      const mockService = { setVolume: vi.fn() } as unknown as PlaybackService;
      render(<Controls />, { mockService });
      fireEvent.change(screen.getByRole('slider', { name: /volume/i }), { target: { value: '0.8' } });
      expect(mockService.setVolume).toHaveBeenCalledWith(0.8);
    });
  });

  describe('mute button', () => {
    it('is visible when not muted', () => {
      mockPlayerState = { ...mockPlayerState, muted: false };
      render(<Controls />);
      expect(screen.getByRole('button', { name: /^mute$/i })).toBeInTheDocument();
    });

    it('is not visible when muted', () => {
      mockPlayerState = { ...mockPlayerState, muted: true };
      render(<Controls />);
      expect(screen.queryByRole('button', { name: /^mute$/i })).not.toBeInTheDocument();
    });

    it('calls service.setMuted(true) when clicked', async () => {
      mockPlayerState = { ...mockPlayerState, muted: false };
      const mockService = { setMuted: vi.fn() } as unknown as PlaybackService;
      render(<Controls />, { mockService });
      await userEvent.click(screen.getByRole('button', { name: /^mute$/i }));
      expect(mockService.setMuted).toHaveBeenCalledWith(true);
    });
  });

  describe('unmute button', () => {
    it('is visible when muted', () => {
      mockPlayerState = { ...mockPlayerState, muted: true };
      render(<Controls />);
      expect(screen.getByRole('button', { name: /^unmute$/i })).toBeInTheDocument();
    });

    it('is not visible when not muted', () => {
      mockPlayerState = { ...mockPlayerState, muted: false };
      render(<Controls />);
      expect(screen.queryByRole('button', { name: /^unmute$/i })).not.toBeInTheDocument();
    });

    it('calls service.setMuted(false) when clicked', async () => {
      mockPlayerState = { ...mockPlayerState, muted: true };
      const mockService = { setMuted: vi.fn() } as unknown as PlaybackService;
      render(<Controls />, { mockService });
      await userEvent.click(screen.getByRole('button', { name: /^unmute$/i }));
      expect(mockService.setMuted).toHaveBeenCalledWith(false);
    });
  });

  describe('seek', () => {
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

    it('seek slider value reflects current time', () => {
      mockPlayerState = { ...mockPlayerState, currentTime: 30, duration: 120 };
      render(<Controls />);
      expect(screen.getByRole('slider', { name: '' })).toHaveValue('30');
    });

    it('calls service.seek when scrubber is released', () => {
      mockPlayerState = { ...mockPlayerState, currentTime: 30, duration: 120 };
      const mockService = { seek: vi.fn() } as unknown as PlaybackService;
      render(<Controls />, { mockService });
      const seekSlider = screen.getByRole('slider', { name: '' });
      fireEvent.mouseDown(seekSlider);
      fireEvent.change(seekSlider, { target: { value: '60' } });
      fireEvent.mouseUp(seekSlider);
      expect(mockService.seek).toHaveBeenCalledWith(60);
    });

    it('scrubber shows scrub position while dragging', () => {
      mockPlayerState = { ...mockPlayerState, currentTime: 30, duration: 120 };
      render(<Controls />);
      const seekSlider = screen.getByRole('slider', { name: '' });
      fireEvent.mouseDown(seekSlider);
      fireEvent.change(seekSlider, { target: { value: '60' } });
      expect(seekSlider).toHaveValue('60');
    });

    it('scrubber holds seeked position until currentTime updates', () => {
      mockPlayerState = { ...mockPlayerState, currentTime: 30, duration: 120 };
      const mockService = { seek: vi.fn() } as unknown as PlaybackService;
      const { rerender } = render(<Controls />, { mockService });
      const seekSlider = screen.getByRole('slider', { name: '' });
      fireEvent.mouseDown(seekSlider);
      fireEvent.change(seekSlider, { target: { value: '60' } });
      fireEvent.mouseUp(seekSlider);
      // Before currentTime updates, scrubber should still show 60
      expect(seekSlider).toHaveValue('60');
      // Simulate currentTime updating after seek
      mockPlayerState = { ...mockPlayerState, currentTime: 60 };
      rerender(<Controls />);
      expect(seekSlider).toHaveValue('60');
    });

    it('seek slider range is 0 to duration', () => {
      mockPlayerState = { ...mockPlayerState, duration: 120 };
      render(<Controls />);
      const seekSlider = screen.getByRole('slider', { name: '' });
      expect(seekSlider).toHaveAttribute('min', '0');
      expect(seekSlider).toHaveAttribute('max', '120');
    });
  });

  it('displays the playback state', () => {
    mockPlayerState.playbackState = 'buffering';
    render(<Controls />);
    expect(screen.getByText('buffering')).toBeInTheDocument();
  });
});
