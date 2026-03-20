// src/components/Controls.tsx
import React from 'react';
import { useAppSelector } from '../hooks';
import { formatTime } from '../lib/format';
import { usePlaybackService } from '../playback-service/PlaybackServiceContext';

const Controls: React.FC = () => {
  const { playbackState, muted, volume, currentTime, duration } =
    useAppSelector((s) => s.player);
  const service = usePlaybackService();

  // Local scrub state so we don't seek continuously during drag
  const [scrub, setScrub] = React.useState<number | null>(null);
  const dragging = React.useRef(false);
  const seekPending = React.useRef(false);

  const commitScrub = React.useCallback(() => {
    dragging.current = false;
    if (scrub != null) {
      seekPending.current = true;
      service.seek(scrub);
    }
  }, [service, scrub]);

  React.useEffect(() => {
    if (seekPending.current) {
      seekPending.current = false;
      setScrub(null);
    }
  }, [currentTime]);

  return (
    <div className="controls">
      <div className="row">

        {(playbackState === 'paused' || playbackState === 'ended') && (
          <button className="btn" onClick={() => service.play()}>Play</button>
        )}

        {(playbackState === 'playing' || playbackState === 'buffering') && (
          <button className="btn" onClick={() => service.pause()}>Pause</button>
        )}

        <label className="volume">
          Volume
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => service.setVolume(parseFloat(e.target.value))} />
        </label>

        {(!muted) && (
          <button className="btn" onClick={() => service.setMuted(true)}>Mute</button>
        )}

        {(muted) && (
          <button className="btn" onClick={() => service.setMuted(false)}>Unmute</button>
        )}

        <span className="status">{playbackState}</span>
      </div>

      <div className="row">
        <div className="time">{formatTime(currentTime)}</div>

        <input
          className="seek"
          type="range"
          min={0}
          max={isFinite(duration) ? duration : 0}
          step={0.1}
          value={isFinite(duration) ? (scrub ?? currentTime) : 0}
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
          onChange={(e) => { if (dragging.current) setScrub(parseFloat(e.target.value)); }}
          onMouseUp={commitScrub}
          onTouchEnd={commitScrub}
          disabled={!isFinite(duration)}
        />

        <div className="time">{formatTime(duration)}</div>

      </div>
    </div>
  );
};

export default Controls;
