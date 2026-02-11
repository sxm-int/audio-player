import React from 'react';

type AppBody = {
	MainContent: React.ReactNode;
	Sidebar: React.ReactNode;
};

const AppBody: React.FC<AppBody> = ({
	MainContent,
	Sidebar,
}) => {
	return (
		<main className="main-content">
			<div className="grid">
				<section className="watch">
					{MainContent}
				</section>
				{Sidebar}
			</div>
		</main>
	);
};

export default AppBody;
