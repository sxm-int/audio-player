export interface IHls {
	attachMedia(audio: HTMLAudioElement): void;
	loadSource(url: string): void;
	once(event: string, handler: () => void): void;
	destroy(): void;
}
