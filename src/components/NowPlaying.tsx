import React from 'react';

import HlsAudio from './HlsAudio';
import Controls from './Controls';
import Visualizer from './Visualizer';

type NowPlaying = {
	url: string;
	title?: string;
};

const NowPlaying: React.FC<NowPlaying> = ({
	url,
	title = 'Now Playing',
}) => {
	return (
		<>
			<div className="now">
				<div className="viz-card">
					<Visualizer height={140} fftSize={2048} />
				</div>
				<div className="meta">
					<h1 className="now-title">
						{title}
					</h1>
					<div className="now-url" title={url}>
						{url}
					</div>
				</div>
			</div>

			<div className="card">
				<HlsAudio />
				<Controls />
			</div>
		</>
	);
};

export default NowPlaying;
