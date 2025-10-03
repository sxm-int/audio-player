import { http, HttpResponse } from 'msw';

export const handlers = [
	http.get('/hello-world', () => {
		return HttpResponse.json({
			data: 'Hello world.',
		});
	}),
	http.get('/streams', () => {
		return HttpResponse.json([
			{
				title: 'Big Buck Bunny - adaptive qualities',
				url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
			},
			{
				title: 'Big Buck Bunny - 480p only',
				url: 'https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8',
			},
			{
				title: 'ARTE China, ABR',
				url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
			},
			{
				title: 'Ad-insertion in event stream',
				url: 'https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8',
			},
			{
				title: 'hls.js/issues/666',
				url: 'https://test-streams.mux.dev/issue666/playlists/cisq0gim60007xzvi505emlxx.m3u8',
			},
			{
				title: 'SAMPLE-AES encrypted',
				url: 'https://test-streams.mux.dev/bbbAES/playlists/sample_aes/index.m3u8',
			},
			{
				title: 'DK Turntable, PTS shifted by 2.3s',
				url: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
			},
			{
				title: 'Tears of Steel, HLS with IMSC Captions',
				url: 'https://test-streams.mux.dev/tos_ismc/main.m3u8',
			},
		]);
	}),
];
