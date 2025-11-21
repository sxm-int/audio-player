import { streams } from './streams';

export interface MockHandler {
	method: string;
	path: string;
	handler: () => unknown;
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
];
