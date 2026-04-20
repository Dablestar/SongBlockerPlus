(function() {
    console.log("injected")
    const originalFetch = window.fetch;
 
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
 
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
 
    if (url && url.includes('/youtubei/v1/player')) {
      const cloned = response.clone();
      cloned.json().then(data => {
        window.postMessage({
          type: 'PLAYER_RESPONSE',
          data: data
        }, '*');
      }).catch(() => {});
    }
 
    return response;
  };
})();