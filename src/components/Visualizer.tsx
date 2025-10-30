// src/components/Visualizer.tsx
import React, { useEffect, useRef } from 'react';

type Props = {
	height?: number; // CSS px
	fftSize?: number; // power of 2 (32–32768)
	/** Frequency window for bars (helps avoid over-emphasizing sub-bass) */
	minHz?: number; // default 300
	maxHz?: number; // default 6000 (capped at Nyquist)
	/** Number of bars to draw */
	bars?: number; // default 72
};

const Visualizer: React.FC<Props> = ({
	height = 140,
	fftSize = 2048,
	minHz = 300,
	maxHz = 6000,
	bars = 72,
}) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const ctxRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const audioEl = document.querySelector('audio') as HTMLAudioElement | null;
		if (!audioEl) return;

		// Reuse a single AudioContext
		if (!ctxRef.current) {
			try {
				ctxRef.current = new (window.AudioContext ||
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(window as any).webkitAudioContext)();
			} catch (err) {
				console.error('AudioContext init failed:', err);
				return;
			}
		}
		const ac = ctxRef.current;

		// Analyser tuned so bars remain visible
		if (!analyserRef.current) {
			const an = ac.createAnalyser();
			an.fftSize = fftSize;
			an.smoothingTimeConstant = 0.6;
			an.minDecibels = -100;
			an.maxDecibels = -20;
			analyserRef.current = an;
		} else {
			analyserRef.current.fftSize = fftSize;
		}

		// Connect element -> analyser -> destination (idempotent)
		if (!sourceRef.current) {
			try {
				const src = ac.createMediaElementSource(audioEl);
				src.connect(analyserRef.current!);
				analyserRef.current!.connect(ac.destination);
				sourceRef.current = src;
			} catch (err) {
				console.warn('Visualizer source appears already connected:', err);
			}
		}

		// Canvas sizing
		const dpr = Math.max(1, window.devicePixelRatio || 1);
		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			canvas.width = Math.floor(rect.width * dpr);
			canvas.height = Math.floor(height * dpr);
		};
		resize();
		window.addEventListener('resize', resize);

		const analyser = analyserRef.current!;
		const freq = new Uint8Array(analyser.frequencyBinCount);
		const time = new Uint8Array(analyser.fftSize);

		// Frequency helpers
		const nyquist = ac.sampleRate / 2;
		const fMin = Math.max(20, Math.min(minHz, nyquist - 1));
		const fMax = Math.max(fMin + 10, Math.min(maxHz, nyquist));
		const logFMin = Math.log(fMin);
		const logFMax = Math.log(fMax);

		// Map a target frequency (Hz) to analyser bin index
		const hzToIndex = (hz: number) =>
			Math.min(
				freq.length - 1,
				Math.max(0, Math.round((hz / nyquist) * (freq.length - 1))),
			);

		const draw = () => {
			const cx = canvas.getContext('2d');
			if (!cx) return;

			analyser.getByteFrequencyData(freq);
			analyser.getByteTimeDomainData(time);

			const w = canvas.width;
			const h = canvas.height;

			// Background
			cx.clearRect(0, 0, w, h);
			const bg = cx.createLinearGradient(0, 0, 0, h);
			bg.addColorStop(0, '#152043');
			bg.addColorStop(1, '#0f1630');
			cx.fillStyle = bg;
			cx.fillRect(0, 0, w, h);

			// ---- Bars (log spaced between fMin..fMax, tilted around ~800Hz) ----
			const barColumns = bars;
			const barGap = 2 * dpr;
			const barW = Math.max(
				1 * dpr,
				(w - barGap * (barColumns - 1)) / barColumns,
			);
			const minBarH = 2 * dpr;

			for (let i = 0; i < barColumns; i++) {
				const t = i / Math.max(1, barColumns - 1); // 0..1
				// Log-space frequency across the selected window
				const f = Math.exp(logFMin + (logFMax - logFMin) * t);

				// Tilt the response so lows are attenuated and mids/highs are emphasized.
				// Center roughly near 800Hz; gentle curve with clamps.
				const center = 800; // Hz
				const tilt = Math.pow(f / center, 0.25); // 1/4 power = subtle
				const tiltGain = Math.min(1.35, Math.max(0.65, tilt)); // clamp 0.65..1.35

				// Sample a small neighborhood around the target bin
				const idx = hzToIndex(f);
				const start = Math.max(0, idx - 2);
				const end = Math.min(freq.length - 1, idx + 2);
				let sum = 0;
				for (let j = start; j <= end; j++) sum += freq[j];
				const avg = sum / (end - start + 1);

				const v = (avg / 255) * tiltGain; // 0..~1.35
				const barH = Math.max(minBarH, Math.min(h * 0.75, v * (h * 0.7)));
				const x = i * (barW + barGap);
				const y = h - barH;

				cx.fillStyle = `hsla(${220 - i * 0.8}, 80%, ${42 + Math.min(30, v * 35)}%, 0.88)`;
				cx.fillRect(x, y, barW, barH);
			}

			// ---- Waveform overlay ----
			cx.lineWidth = Math.max(1, 1.2 * dpr);
			cx.strokeStyle = 'rgba(255,255,255,0.95)';
			cx.beginPath();
			const step = w / time.length;
			for (let i = 0; i < time.length; i++) {
				const v = time[i] / 255; // 0..1
				const y = v * h;
				const x = i * step;
				if (i === 0) cx.moveTo(x, y);
				else cx.lineTo(x, y);
			}
			cx.stroke();

			rafRef.current = requestAnimationFrame(draw);
		};

		const resume = () => {
			if (ctxRef.current?.state === 'suspended') {
				ctxRef.current.resume().catch((err) => {
					console.error('AudioContext resume failed:', err);
				});
			}
		};
		window.addEventListener('pointerdown', resume, { once: true });
		audioEl.addEventListener('play', resume);

		rafRef.current = requestAnimationFrame(draw);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener('resize', resize);
			audioEl.removeEventListener('play', resume);
		};
	}, [fftSize, height, minHz, maxHz, bars]);

  console.log('Why am I getting logged?');

	return <canvas ref={canvasRef} className="viz-canvas" style={{ height }} />;
};

export default Visualizer;
