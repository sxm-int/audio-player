import { loggedFetch } from "../lib/loggedFetch";

export async function handleLogin({
	email,
	password,
}: {
	email: string;
	password: string;
}): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await loggedFetch('/login', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});
		const data = await response.json();
		if (!response.ok || data.success !== true) {
			return {
				success: false,
				error: data?.error ?? 'error',
			};
		}

		localStorage.setItem('userEmail', email);

		return { success: true };
	} catch (err) {
		console.error('Login failed:', err);
		return {
			success: false,
			error: (err as Error).message,
		};
	}
}
