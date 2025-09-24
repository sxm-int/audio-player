import { http, HttpResponse } from 'msw';

export const handlers = [
	http.get('/hello-world', () => {
		return HttpResponse.json({
			data: 'Hello world.',
		});
	}),
];
