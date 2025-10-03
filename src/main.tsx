import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './App.css'; // add this line (keep index.css too if you use it)

async function deferRender() {
	const { mockServiceWorker } = await import('./mocks/browser');

	return mockServiceWorker.start();
}

deferRender().then(() => {
	ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
		<Provider store={store}>
			<App />
		</Provider>,
	);
});
