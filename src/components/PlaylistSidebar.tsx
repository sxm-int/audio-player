import React, { useState } from 'react';

import type { StreamItem } from '../api/streams';

type SortListBy = 'recent' | 'a-to-z';

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

	const handleSort = (sort: SortListBy) =>  {};

	const handleDelete = (item: StreamItem) => {};

	return (
		<aside className="sidebar">
			<div className="sidebar-head">
				<div className="row">
					<h2>Playlist</h2>
				  <div className='sort'>
					  <button
						  className={'btn'}
						  onClick={() => handleSort('recent')}
					  >
						  Recent
					  </button>
					  <button
						  className={'btn'}
						  onClick={() => handleSort('a-to-z')}
					  >
						  A to Z
					  </button>
				  </div>
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
							<button
								className={'btn-chip'}
								onClick={() => handleDelete(item)}
								title={'Remove'}
							>
								<span className="chip">Remove</span>
							</button>
						</li>
					);
				})}
			</ul>
		</aside>
	);
};

export default PlaylistSidebar;
