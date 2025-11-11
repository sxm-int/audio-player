import { http, HttpResponse } from 'msw';
import { streams } from './streams';

export const handlers = [
	http.get('/hello-world', () => {
		return HttpResponse.json({
			data: 'Hello world.',
		});
	}),
	http.get('/streams', () => {
		return HttpResponse.json(streams);
	}),
];
