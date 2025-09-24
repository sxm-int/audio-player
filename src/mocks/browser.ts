import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const mockServiceWorker = setupWorker(...handlers);

mockServiceWorker.start();
