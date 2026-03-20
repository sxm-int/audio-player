import React from 'react';
import { useAppSelector } from '../hooks';
import Controls from './Controls';
import Visualizer from './Visualizer';

const NowPlaying: React.FC = () => {
  const { url, title, playbackState } = useAppSelector((s) => s.player);

  return (
    <>
      <div className="now">
        <div className="viz-card">
          <Visualizer height={140} fftSize={2048} />
        </div>
        <div className="meta">
          <h1 className="now-title">{title}</h1>
          <div className="now-url" title={url}>{url}</div>
        </div>
      </div>

      {playbackState === 'error' && (
        <div className="card">Content Unavailable</div>
      )}

      {playbackState !== 'idle' && playbackState !== 'error' && (
        <div className="card">
          <Controls />
        </div>
      )}
    </>
  );
};

export default NowPlaying;
