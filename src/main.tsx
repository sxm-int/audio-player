import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './App.css';

async function bootstrap() {
	// Start MSW explicitly with a fixed URL so it works in StackBlitz iframes.
	if (import.meta.env.DEV && 'serviceWorker' in navigator) {
		const { worker } = await import('./mocks/browser');
		const swUrl = new URL('/mockServiceWorker.js', window.location.origin).href;
		await worker.start({
			serviceWorker: { url: swUrl, options: { scope: '/' } },
			onUnhandledRequest: 'bypass',
		});
	}

	ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
		<React.StrictMode>
			<Provider store={store}>
				<App />
			</Provider>
		</React.StrictMode>,
	);
}

bootstrap();
