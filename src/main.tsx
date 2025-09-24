import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './index.css';

async function deferRender() {
	const { mockServiceWorker } = await import('./mocks/browser');

	return mockServiceWorker.start();
}

deferRender().then(() => {
	ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
		<React.StrictMode>
			<Provider store={store}>
				<App />
			</Provider>
		</React.StrictMode>,
	);
});
