console.log("Content Script Online");

// Inject injected.js into page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/injected.js');
document.documentElement.appendChild(script);

// Extract source video ID from reel_item_watch response
function extractSourceVideoId(data) {
  const panels = data?.engagementPanels ?? [];
  for (const panel of panels) {
    const renderer = panel?.engagementPanelSectionListRenderer;
    if (renderer?.targetId !== 'engagement-panel-shorts-audio-pivot') continue;

    const header = renderer?.content?.richGridRenderer?.header?.pageHeaderViewModel;

    const videoIdFromImage = header?.image?.contentPreviewImageViewModel
      ?.rendererContext?.commandContext?.onTap
      ?.innertubeCommand?.watchEndpoint?.videoId;
    if (videoIdFromImage) return { videoId: videoIdFromImage, title: header?.title?.dynamicTextViewModel?.text?.content };

    const videoIdFromTitle = header?.title?.dynamicTextViewModel
      ?.rendererContext?.commandContext?.onTap
      ?.innertubeCommand?.watchEndpoint?.videoId;
    if (videoIdFromTitle) return { videoId: videoIdFromTitle, title: header?.title?.dynamicTextViewModel?.text?.content };
  }
  return null;
}

// Receive intercepted reel_item_watch response from injected.js
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (event.data?.type !== 'REEL_ITEM_WATCH_RESPONSE') return;

  const data = event.data.data;
  if (data?.status !== 'REEL_ITEM_WATCH_STATUS_SUCCEEDED') return;

  const source = extractSourceVideoId(data);
  if (source?.videoId) {
    console.log("Source video ID:", source.videoId, "| Title:", source.title);
  } else {
    console.log("No audio pivot found in reel_item_watch response");
  }
});

// Detect URL changes for shorts navigation
window.navigation.addEventListener("navigate", function(event) {
  const url = new URL(event.destination.url);
  if (!url.pathname.startsWith('/shorts/')) return;
  const videoId = url.pathname.split('/')[2];
  console.log("Current Shorts Video ID:", videoId);
});