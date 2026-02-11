import React, { useState } from 'react';

import type { StreamItem } from '../api/streams';

type PlaylistSidebar = {
	streams: StreamItem[];
	url: string;
	handlePlay: (item: StreamItem) => void;
};

const PlaylistSidebar: React.FC<PlaylistSidebar> = ({
	streams,
	url,
	handlePlay,
}) => {
	const [listSearchText, setListSearchText] = useState('');
	const filteredStreams = streams.filter((s) => {
		return s.title.toLowerCase().includes(listSearchText.toLowerCase());
	});

	return (
		<aside className="sidebar">
			<div className="sidebar-head">
				<div className="row">
					<h2>Playlist</h2>
				</div>
				<input
					className="input slim"
					placeholder="Search"
					value={listSearchText}
					name="Search"
					onChange={(e) => setListSearchText(e.target.value)}
					aria-label="Search streams"
				/>
			</div>

			<ul className="list">
				{filteredStreams.map((item) => {
					const label = item.title;
					const active = item.url === url;
					return (
						<li
							className={`row no-thumb ${active ? 'active' : ''}`}
							key={item.id}
						>
							<div className="row-meta">
								<div className="row-title">
									{label}
								</div>
								<div className="row-sub">{item.url}</div>
							</div>
							<button
								className={'btn-chip'}
								onClick={() => handlePlay(item)}
								title={'Play'}
							>
								<span className={`chip ${active ? 'playing' : ''}`}>
									{active ? 'Playing' : 'Play'}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
		</aside>
	);
};

export default PlaylistSidebar;
