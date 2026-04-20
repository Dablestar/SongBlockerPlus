(function() {
  const originalFetch = window.fetch;
 
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
 
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
 
    if (url && url.includes('/youtubei/v1/browse')) {
      const cloned = response.clone();
      cloned.json().then(data => {
        // execute only 'reelWatchEndpoint' included
        const json = JSON.stringify(data);
        if (json.includes('reelWatchEndpoint')) {
          // search VideoID
          const match = json.match(/"reelWatchEndpoint":\{"videoId":"([^"]+)"/);
          if (match && match[1]) {
            window.postMessage({
              type: 'SOURCE_VIDEO_ID',
              videoId: match[1]
            }, '*');
          }
        }
      }).catch(() => {});
    }
 
    return response;
  };
})();
 