import React from 'react';

type Recommendation = {
	id: string;
	title: string;
	description: string;
	link: string;
};

const recommendations: Recommendation[] = [
	{
		id: 'chill-vibes',
		title: 'Chill Vibes',
		description: 'Relaxing beats and ambient sounds',
		link: '#',
	},
	{
		id: 'indie-rock',
		title: 'Indie Rock',
		description: 'Discover new alternative artists',
		link: '#',
	},
	{
		id: 'classical-focus',
		title: 'Classical Focus',
		description: 'Music for deep concentration',
		link: '#',
	},
	{
		id: 'jazz-lounge',
		title: 'Jazz Lounge',
		description: 'Smooth jazz for any mood',
		link: '#',
	},
	{
		id: 'electronic-beats',
		title: 'Electronic Beats',
		description: 'From house to techno',
		link: '#',
	},
	{
		id: 'country-roads',
		title: 'Country Roads',
		description: 'Modern and classic country hits',
		link: '#',
	},
	{
		id: 'latin-heat',
		title: 'Latin Heat',
		description: 'Reggaeton, salsa, and more',
		link: '#',
	},
	{
		id: 'metal-zone',
		title: 'Metal Zone',
		description: 'Heavy riffs and powerful vocals',
		link: '#',
	},
	{
		id: 'rb-soul',
		title: 'R&B Soul',
		description: 'Smooth rhythms and soulful melodies',
		link: '#',
	},
	{
		id: 'pop-hits',
		title: 'Pop Hits',
		description: "Today's biggest pop songs",
		link: '#',
	},
	{
		id: 'blues-roots',
		title: 'Blues & Roots',
		description: 'Classic blues and roots music',
		link: '#',
	},
	{
		id: 'world-music',
		title: 'World Music',
		description: 'Global sounds from every continent',
		link: '#',
	},
	{
		id: '80s-hits',
		title: '80s Hits',
		description: 'Totally rad throwback jams',
		link: '#',
	},
	{
		id: '90s-alternative',
		title: '90s Alternative',
		description: 'Grunge, britpop, and more',
		link: '#',
	},
	{
		id: 'comedy-central',
		title: 'Comedy Central',
		description: 'Stand-up and comedy shows',
		link: '#',
	},
	{
		id: 'podcasts-daily',
		title: 'Podcasts Daily',
		description: 'Top podcasts and talk shows',
		link: '#',
	},
	{
		id: 'kids-tunes',
		title: "Kids' Tunes",
		description: 'Family-friendly music and stories',
		link: '#',
	},
	{
		id: 'workout-energy',
		title: 'Workout Energy',
		description: 'High-energy tracks to power through',
		link: '#',
	},
	{
		id: 'sleep-sounds',
		title: 'Sleep Sounds',
		description: 'Calming sounds for better rest',
		link: '#',
	},
	{
		id: 'holiday-classics',
		title: 'Holiday Classics',
		description: 'Seasonal favorites all year round',
		link: '#',
	},
];

const Recommendations: React.FC = () => {
	return (
		<div className="recommendations">
			<h2 className="recommendations-title">Recommended Channels</h2>
			<div className="recommendations-grid">
				{recommendations.map((recommendation) => (
					<div key={recommendation.id} className="recommendation-card">
						<h3 className="recommendation-title">{recommendation.title}</h3>
						<p className="recommendation-desc">{recommendation.description}</p>
						<a href={recommendation.link} className="recommendation-link">
							Listen Now →
						</a>
					</div>
				))}
			</div>
		</div>
	);
};

export default Recommendations;
