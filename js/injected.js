(function() {
  console.log("injected.js loaded");
 
  const originalFetch = window.fetch;
 
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
 
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
 
    if (url && url.includes('/youtubei/v1/reel/reel_item_watch')) {
      const cloned = response.clone();
      cloned.json().then(data => {
        window.postMessage({
          type: 'REEL_ITEM_WATCH_RESPONSE',
          data
        }, '*');
      }).catch(() => {});
    }
 
    return response;
  };
})();
 