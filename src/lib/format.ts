export function formatTime(sec?: number) {
	if (sec == null || !isFinite(sec)) return 'LIVE';
	const s = Math.floor(sec % 60)
		.toString()
		.padStart(2, '0');
	const m = Math.floor((sec / 60) % 60)
		.toString()
		.padStart(2, '0');
	const h = Math.floor(sec / 3600);
	return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}
