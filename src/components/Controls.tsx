// src/components/Controls.tsx
import React from 'react';
import { useAppSelector } from '../hooks';
import { formatTime } from '../lib/format';
import { usePlaybackService } from '../playback-service/PlaybackServiceContext';

const Controls: React.FC = () => {
  const { playbackState, muted, volume, currentTime, duration } =
    useAppSelector((s) => s.player);
  const service = usePlaybackService();

  const [scrub, setScrub] = React.useState<number | null>(null);
  const dragging = React.useRef(false);

  const commitScrub = React.useCallback(() => {
    dragging.current = false;
    if (scrub != null) {
      service.seek(scrub);
      setScrub(null);
    }
  }, [service, scrub]);

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

        {/*
          Playback rate hint:
          - Set rate:   const audio = document.querySelector('audio'); audio.playbackRate = 1.5;
          - Listen for changes: audio.addEventListener('ratechange', () => { console.log(audio.playbackRate); })
        */}
        <select onChange={(e) => { }} value={1}>
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>

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
