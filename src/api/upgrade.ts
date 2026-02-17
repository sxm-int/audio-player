export async function handleUpgrade(): Promise<{
	status: 'success' | 'error';
	message: string;
}> {
	const response = await fetch('/upgrade', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({}),
	});
	const data = await response.json();

	if (!response.ok || !data.status || !data.message) {
		return {
			status: 'error',
			message: 'Upgrade failed. Please try again.',
		};
	}

	return { status: data.status, message: data.message };
}
