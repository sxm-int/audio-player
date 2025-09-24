import { useEffect, useState } from 'react';

export function MockDemo() {
	const [data, setData] = useState(null);

	useEffect(() => {
		fetch('/hello-world')
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
