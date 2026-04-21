//intercept fetch requests to YouTube's reel_item_watch endpoint to extract source video ID and title, then send it to content script via postMessage
(function() {
  console.log("injected.js loaded");

  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

    if (url && url.includes('/youtubei/v1/reel/reel_item_watch')) {
      // Extract the Shorts video ID from the request body to correlate
      // this response with the correct video (handles prefetch ordering)
      let shortsVideoId = null;
      const requestInit = args[1];
      if (requestInit?.body) {
        try {
          shortsVideoId = JSON.parse(requestInit.body)?.videoId ?? null;
        } catch(e) {}
      }

      const cloned = response.clone();
      cloned.json().then(data => {
        window.postMessage({ type: 'REEL_ITEM_WATCH_RESPONSE', data, shortsVideoId }, '*');
      }).catch(() => {});
    }

    return response;
  };

  // Handle skip requests from content script by dispatching keyboard events
  // and scrolling the shorts container from page context
  window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    if (event.data?.type !== 'SKIP_VIDEO') return;

    const eventConfig = {
      key: 'ArrowDown',
      keyCode: 40,
      code: 'ArrowDown',
      which: 40,
      bubbles: true,
      cancelable: true,
      composed: true
    };

    document.dispatchEvent(new KeyboardEvent('keydown', eventConfig));
    window.dispatchEvent(new KeyboardEvent('keydown', eventConfig));

    const container = document.querySelector('#shorts-container') ||
                      document.querySelector('ytd-shorts');
    if (container) {
      container.scrollBy({ top: window.innerHeight, behavior: 'instant' });
    }
  });
})();
