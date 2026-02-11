import { streams } from './streams';
import { VALID_EMAIL, VALID_PASS } from '../constants';

export interface MockHandler {
	method: string;
	path: string;
	handler: (body?: unknown) => unknown | Promise<unknown>;
}

export const handlers: MockHandler[] = [
	{
		method: 'GET',
		path: '/hello-world',
		handler: () => ({
			data: 'Hello world.',
		}),
	},
	{
		method: 'GET',
		path: '/streams',
		handler: () => streams,
	},
	{
		method: 'POST',
		path: '/login',
		handler: (body?: unknown) => {
			const data = body as Record<string, unknown>;
			const email = typeof data?.email === 'string' && data.email;
			const password = typeof data?.password === 'string' && data.password;
			const success = email === VALID_EMAIL && password === VALID_PASS;

			return {
				success,
				...(success ? { user: { email } } : { error: 'Invalid credentials' }),
			};
		},
	},
	{
		method: 'POST',
		path: '/upgrade',
		handler: async () => {
			console.debug('/upgrade');

			// simulate network delay
			const delay = 1000;
			await new Promise((resolve) => setTimeout(resolve, delay));

			// set to true for success and false for error responses.
			const success = true;
			return {
				status: success ? 'success' : 'error',
				message: success ? 'Successfully upgraded to premium!' : 'Upgrade failed. Please try again.',
			};
		},
	},
];
