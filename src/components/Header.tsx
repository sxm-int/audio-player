import React from 'react';
import { useAppDispatch } from '../hooks';
import { setUrl } from '../store';

type Header = {
	tempUrl: string;
	setTempUrl: React.Dispatch<React.SetStateAction<string>>;
	setLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<Header> = ({ tempUrl, setTempUrl, setLoginOpen }) => {
	const dispatch = useAppDispatch();

	return (
		<header className="topbar">
			<div className="left">
				<div className="logo">
					<img src="/stella.png" alt="SiriusXM Stella" />
				</div>{' '}
				<div className="brand">
					<div className="title">sxm-interview</div>
					<div className="sub">HLS Audio Player</div>
				</div>
			</div>

			<div className="search-group">
				<form
					className="search"
					onSubmit={(e) => {
						e.preventDefault();
						dispatch(setUrl(tempUrl));
					}}
				>
					<input
						className="input"
						type="url"
						placeholder="Paste an .m3u8 URL and press Enter"
						value={tempUrl}
						onChange={(e) => setTempUrl(e.target.value)}
						required
					/>
					<button className="btn" type="submit">
						Load
					</button>
				</form>
				<button
					className="btn"
					type="button"
					onClick={() => setLoginOpen(true)}
				>
					Log In
				</button>
			</div>
		</header>
	);
};

export default Header;
