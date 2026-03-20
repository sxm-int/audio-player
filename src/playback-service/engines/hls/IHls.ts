export interface IHls {
	attachMedia(audio: HTMLAudioElement): void;
	loadSource(url: string): void;
	once(event: string, handler: () => void): void;
	on(event: string, handler: (event: string, data: any) => void): void;
	destroy(): void;
}
