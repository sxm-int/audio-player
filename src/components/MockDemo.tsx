import { useEffect, useState } from 'react';
import { loggedFetch } from '../lib/loggedFetch';

export function MockDemo() {
	const [data, setData] = useState(null);

	useEffect(() => {
		loggedFetch('/hello-world')
			.then((res) => res.json())
			.then((res) => {
				console.log(res.data);
				setData(res.data);
			});
	}, []);

	return (
		<div>
			<p>Mock Server Data: {data ? data : ''}</p>
		</div>
	);
}
