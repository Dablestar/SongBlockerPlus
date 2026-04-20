console.log("Content Script Online");
 
// Inject fetch override into page context via inline script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/injected.js');
document.documentElement.appendChild(script);
script.remove();
 
// Receive messages from injected page context script
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (event.data?.type === 'PLAYER_RESPONSE') {
    console.log("PLAYER_RESPONSE received:", event.data.data);
  }
});
 
// Detect URL changes for shorts navigation
let lastVideoId = null;
 
window.navigation.addEventListener("navigate", function(event) {
  const url = new URL(event.destination.url);
  if (!url.pathname.startsWith('/shorts/')) return;
 
  const videoId = url.pathname.split('/')[2];
  if (!videoId || videoId === lastVideoId) return;
 
  lastVideoId = videoId;
  console.log("Current Shorts Video ID:", videoId);
});