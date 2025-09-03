// src/components/Controls.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setMuted, setPlaying, setVolume, setRequestedTime } from '../store';
import { formatTime } from '../lib/format';

const Controls: React.FC = () => {
	const { isPlaying, muted, volume, currentTime, duration, isLive, status } =
		useAppSelector((s) => s.player);
	const dispatch = useAppDispatch();

	// Local scrub state so we don't seek continuously during drag
	const [scrub, setScrub] = React.useState<number | null>(null);

	const commitScrub = React.useCallback(() => {
		if (scrub != null) {
			dispatch(setRequestedTime(scrub));
			setScrub(null);
		}
	}, [dispatch, scrub]);

	return (
		<div className="controls">
			<div className="row">
				<button
					className="btn"
					onClick={() => dispatch(setPlaying(!isPlaying))}
				>
					{isPlaying ? 'Pause' : 'Play'}
				</button>

				<button className="btn" onClick={() => dispatch(setMuted(!muted))}>
					{muted ? 'Unmute' : 'Mute'}
				</button>

				<label className="volume">
					Volume
					<input
						type="range"
						min={0}
						max={1}
						step={0.01}
						value={volume}
						onChange={(e) => dispatch(setVolume(parseFloat(e.target.value)))}
					/>
				</label>

				<span className="status">{status}</span>
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
					onChange={(e) => setScrub(parseFloat(e.target.value))}
					onMouseUp={commitScrub}
					onTouchEnd={commitScrub}
					disabled={!isFinite(duration)}
				/>

				<div className="time">{formatTime(duration)}</div>

				{isLive && (
					<button
						className="btn"
						onClick={() => dispatch(setRequestedTime(Number.MAX_SAFE_INTEGER))}
					>
						Live
					</button>
				)}
			</div>
		</div>
	);
};

export default Controls;
