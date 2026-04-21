console.log("Content Script Online");

// Inject injected.js into page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/injected.js');
document.documentElement.appendChild(script);

let backgroundSource;
let title;
let backgroundURL;

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

function isExtensionValid() {
  try { return !!chrome.runtime?.id; } catch { return false; }
}

function checkSourceBanned(){
  console.log("Checking if current video is in banList...");
  if (!backgroundURL || !isExtensionValid()){
    return;
  }else{
    console.log("Error: Invalid extension or background URL not set");
  }
  const currentURL = backgroundURL ? backgroundURL : window.location.href;
  chrome.storage.local.get('banList', (result) => {
    console.log("Retrieved banList from storage:", result.banList);
    const banList = result.banList ?? [];
    if (banList.some(entry => entry.url === currentURL)) {
      console.log("Current video is in banList, skipping...");
      skipVideo();
    }
  });
}

function skipVideo(){
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    keyCode: 40,
    bubbles: true,
    cancelable: true
  }));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addToBanList") {

    console.log("Received addToBanList message from popup.js");
      chrome.storage.local.get('banList', (result) => {
        const banList = result.banList ?? [];
        banList.push({ title: title, url: backgroundURL });
        chrome.storage.local.set({ banList });
        skipVideo();
      });
      sendResponse({
        sourceTitle: title,
        sourceURL: backgroundURL
      });
    return true; // Indicates that we will send a response asynchronously
  }
});

// Receive intercepted reel_item_watch response from injected.js
window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (event.data?.type !== 'REEL_ITEM_WATCH_RESPONSE') return;

  const data = event.data.data;
  if (data?.status !== 'REEL_ITEM_WATCH_STATUS_SUCCEEDED') return;

  backgroundSource = extractSourceVideoId(data);
  title = backgroundSource?.title || "Unknown Title";
  backgroundURL = backgroundSource ? `https://www.youtube.com/watch?v=${backgroundSource.videoId}` : window.location.href;

  chrome.storage.local.set({ sourceTitle: title, sourceURL: backgroundURL });

  if (backgroundSource) {
    console.log("Source video ID:", backgroundSource.videoId, "| Title:", title);
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
  checkSourceBanned();
});

// Initialize banList if it doesn't exist yet (replaces onInstalled)
chrome.storage.local.get('banList', (result) => {
   if(!result.banList) chrome.storage.local.set({ banList: [] });
  });