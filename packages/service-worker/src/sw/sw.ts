import { VerificationMessage, ServiceWorkerEvents } from '../typings';
import { CanisterResolver } from './domains';
import { RequestProcessor } from './requests';
import { loadResponseVerification } from './requests/utils';
import { handleErrorResponse } from './views/error';

declare const self: ServiceWorkerGlobalScope;

export const sendClientMessage =
  ({ type, message, url }: VerificationMessage) =>
  async (event: FetchEvent) => {
    event.waitUntil(
      (async () => {
        // Exit early if we don't have access to the client.
        // Eg, if it's cross-origin.
        if (!event.clientId) return;

        // Get the client.
        const client = await self.clients.get(event.clientId);
        // Exit early if we don't get the client.
        // Eg, if it closed.
        if (!client) return;

        // Send a message to the client.
        client.postMessage({
          type,
          message,
          url,
        });
      })()
    );
  };

// Always install updated SW immediately
self.addEventListener('install', (event) => {
  event.waitUntil(loadResponseVerification().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  // upon activation take control of all clients (tabs & windows)
  event.waitUntil(self.clients.claim());
});

// Intercept and proxy all fetch requests made by the browser or DOM on this scope.
self.addEventListener('fetch', (event) => {
  const isNavigation = event.request.mode === 'navigate';
  console.debug('sw fetch', { isNavigation });
  try {
    const request = new RequestProcessor(event.request);
    event.respondWith(
      request
        .perform()
        .then((response) => {
          console.debug('fetch', { response });
          sendClientMessage({
            type: response.status >= 400 ? 'error' : 'info',
            message: response.statusText,
            status: response.status,
            url: event.request.url,
          })(event);

          return response;
        })
        // TODO: not sure if this can throw internally
        .catch((e) => handleErrorResponse({ isNavigation, error: e }))
    );
  } catch (e) {
    return event.respondWith(
      handleErrorResponse({
        isNavigation,
        error: e,
      })
    );
  }
});

// handle events from the client messages
self.addEventListener('message', async (event) => {
  const body = event.data;
  switch (body?.action) {
    case ServiceWorkerEvents.SaveICHostInfo: {
      const resolver = await CanisterResolver.setup();
      await resolver.saveICHostInfo(body.data);
      break;
    }
  }
});
