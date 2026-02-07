export async function handleUpgrade(): Promise<{
	success: boolean;
	error?: string;
	message?: string;
}> {
	const response = await fetch('/upgrade', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({}),
	});
	const data = await response.json();

	if (!response.ok || data.success !== true) {
		return {
			success: false,
			error: data?.error ?? 'Upgrade failed',
		};
	}

	return { success: true, message: data.message };
}
