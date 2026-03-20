import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import NowPlaying from './NowPlaying';
import { renderWithProviders as render } from '../test/test-utils';

let mockPlayerState = {
  url: '',
  title: '',
  playbackState: 'idle',
};

vi.mock('../hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: any) => selector({ player: mockPlayerState }),
}));

vi.mock('./Visualizer', () => ({
  default: () => null,
}));

vi.mock('./Controls', () => ({
  default: () => <div data-testid="controls" />,
}));

describe('NowPlaying', () => {

  it('displays the title', () => {
    mockPlayerState = { ...mockPlayerState, title: 'My Station' };
    render(<NowPlaying />);
    expect(screen.getByText('My Station')).toBeInTheDocument();
  });

  it('displays content unavailable message when playback state is error', () => {
    mockPlayerState = { ...mockPlayerState, playbackState: 'error' };
    render(<NowPlaying />);
    expect(screen.getByText(/content unavailable/i)).toBeInTheDocument();
  });

  it('hides controls when playback state is error', () => {
    mockPlayerState = { ...mockPlayerState, playbackState: 'error' };
    render(<NowPlaying />);
    expect(screen.queryByTestId('controls')).not.toBeInTheDocument();
  });

  it('hides controls when playback state is idle', () => {
    mockPlayerState = { ...mockPlayerState, playbackState: 'idle' };
    render(<NowPlaying />);
    expect(screen.queryByTestId('controls')).not.toBeInTheDocument();
  });

  it('shows controls when playback state is not idle', () => {
    mockPlayerState = { ...mockPlayerState, playbackState: 'paused' };
    render(<NowPlaying />);
    expect(screen.getByTestId('controls')).toBeInTheDocument();
  });

  it('displays the url', () => {
    mockPlayerState = { ...mockPlayerState, url: 'https://example.com/stream.m3u8' };
    render(<NowPlaying />);
    expect(screen.getByText('https://example.com/stream.m3u8')).toBeInTheDocument();
  });
});
