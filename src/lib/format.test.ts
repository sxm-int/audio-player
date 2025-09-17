import { describe, it, expect } from 'vitest';
import { formatTime } from './format';

describe('formatTime', () => {
	it('returns LIVE when sec is undefined', () => {
		expect(formatTime(undefined)).toBe('LIVE');
	});

	it('returns LIVE when sec is null', () => {
		// @ts-expect-error testing null input
		expect(formatTime(null)).toBe('LIVE');
	});

	it('returns LIVE when sec is Infinity', () => {
		expect(formatTime(Infinity)).toBe('LIVE');
	});

	it('formats 0 seconds correctly', () => {
		expect(formatTime(0)).toBe('00:00');
	});

	it('formats times under 1 minute', () => {
		expect(formatTime(5)).toBe('00:05');
		expect(formatTime(42)).toBe('00:42');
	});

	it('formats times under 1 hour', () => {
		expect(formatTime(60)).toBe('01:00'); // exactly one minute
		expect(formatTime(125)).toBe('02:05'); // 2m5s
		expect(formatTime(3599)).toBe('59:59'); // just before 1h
	});

	it('formats times with hours', () => {
		expect(formatTime(3600)).toBe('1:00:00'); // exactly 1h
		expect(formatTime(3661)).toBe('1:01:01'); // 1h1m1s
		expect(formatTime(7322)).toBe('2:02:02'); // 2h2m2s
	});
});
