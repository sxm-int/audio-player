import React from 'react';

type Header = {
  setLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Header: React.FC<Header> = ({ setLoginOpen }) => {

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
