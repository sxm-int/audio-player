export type StreamItem = {
	id: string;
	title: string;
	url: string;
	isPremium: boolean;
	collectedAt: string;
};

export const streams: StreamItem[] = [
	{
		id: 'a1b2ca',
		title: 'Big Buck Bunny - adaptive qualities',
		url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
		isPremium: true,
		collectedAt: '2025-08-14T10:23:45Z',
	},
	{
		id: 'd3e4fb',
		title: 'Big Buck Bunny - 480p only',
		url: 'https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8',
		isPremium: false,
		collectedAt: '2025-11-02T15:47:12Z',
	},
	{
		id: 'g5h6ic',
		title: 'ARTE China, ABR',
		url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
		isPremium: true,
		collectedAt: '2025-05-21T08:15:33Z',
	},
	{
		id: 'j7k8ld',
		title: 'Ad-insertion in event stream',
		url: 'https://test-streams.mux.dev/dai-discontinuity-deltatre/manifest.m3u8',
		isPremium: false,
		collectedAt: '2025-09-30T14:02:58Z',
	},
	{
		id: 'm9n0oe',
		title: 'hls.js/issues/666',
		url: 'https://test-streams.mux.dev/issue666/playlists/cisq0gim60007xzvi505emlxx.m3u8',
		isPremium: false,
		collectedAt: '2025-07-18T19:34:21Z',
	},
	{
		id: 'p1q2rf',
		title: 'SAMPLE-AES encrypted',
		url: 'https://test-streams.mux.dev/bbbAES/playlists/sample_aes/index.m3u8',
		isPremium: true,
		collectedAt: '2025-12-05T11:28:47Z',
	},
	{
		id: 's3t4ug',
		title: 'DK Turntable, PTS shifted by 2.3s',
		url: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
		isPremium: false,
		collectedAt: '2026-01-15T16:52:09Z',
	},
	{
		id: 'v5w6xh',
		title: 'Tears of Steel, HLS with IMSC Captions',
		url: 'https://test-streams.mux.dev/tos_ismc/main.m3u8',
		isPremium: true,
		collectedAt: '2025-06-09T13:41:55Z',
	},
];
