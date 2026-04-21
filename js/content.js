console.log("Content Script Online");

const script = document.createElement('script');
script.src = chrome.runtime.getURL('js/injected.js');
document.documentElement.appendChild(script);

let backgroundSource;
let title;
let backgroundURL;
let lastVideoId = null;
let isSkipping = false;

// Buffer for REEL_ITEM_WATCH_RESPONSE data that arrived before navigate fired
// (YouTube sometimes prefetches the next video's watch data)
const sourceDataBuffer = new Map();

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

function applySourceData(source, url, titleVal) {
  backgroundSource = source;
  backgroundURL = url;
  title = titleVal;
  chrome.storage.local.set({ sourceTitle: title, sourceURL: backgroundURL });
  if (source) {
    console.log("Source video ID:", source.videoId, "| Title:", title);
  } else {
    console.log("No audio pivot — using Shorts URL as source:", url);
  }
}

function checkSourceBanned() {
  console.log("Checking if current video is in banList...");
  if (!backgroundURL || !isExtensionValid()) {
    console.log("Skipping check: no backgroundURL or extension invalid");
    return;
  }
  const currentURL = backgroundURL;
  chrome.storage.local.get('banList', (result) => {
    console.log("Retrieved banList from storage:", result.banList);
    const banList = result.banList ?? [];
    if (banList.some(entry => entry.url === currentURL)) {
      console.log("Current video is in banList, skipping...");
      skipVideo();
    }
  });
}

function skipVideo() {
  if (isSkipping) return;
  isSkipping = true;
  setTimeout(() => { isSkipping = false; }, 1500);
  window.postMessage({ type: 'SKIP_VIDEO' }, '*');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "addToBanList") {
    console.log("Received addToBanList message from popup.js");
    chrome.storage.local.get('banList', (result) => {
      const banList = result.banList ?? [];

      if (banList.some(entry => entry.url === backgroundURL)) {
        sendResponse({ alreadyAdded: true, sourceTitle: title, sourceURL: backgroundURL });
        return;
      }

      banList.push({ title: title, url: backgroundURL });
      chrome.storage.local.set({ banList });
      skipVideo();
      sendResponse({ sourceTitle: title, sourceURL: backgroundURL });
    });
    return true;
  }
});

window.addEventListener('message', function(event) {
  if (event.source !== window) return;
  if (event.data?.type !== 'REEL_ITEM_WATCH_RESPONSE') return;

  const data = event.data.data;
  const shortsVideoId = event.data.shortsVideoId;
  if (data?.status !== 'REEL_ITEM_WATCH_STATUS_SUCCEEDED') return;

  const source = extractSourceVideoId(data);
  const resolvedTitle = source?.title || "Unknown Title";
  // Issue 2: for original-audio videos (no audio pivot), use the Shorts URL itself
  const resolvedURL = source
    ? `https://www.youtube.com/watch?v=${source.videoId}`
    : (shortsVideoId ? `https://www.youtube.com/shorts/${shortsVideoId}` : window.location.href);

  if (shortsVideoId && shortsVideoId !== lastVideoId) {
    // Response is for a video we haven't navigated to yet — buffer it
    sourceDataBuffer.set(shortsVideoId, { source, url: resolvedURL, title: resolvedTitle });
    return;
  }

  applySourceData(source, resolvedURL, resolvedTitle);
  checkSourceBanned();
});

window.navigation.addEventListener("navigate", function(event) {
  const url = new URL(event.destination.url);
  if (!url.pathname.startsWith('/shorts/')) return;
  const videoId = url.pathname.split('/')[2];

  if (videoId === lastVideoId) return;
  lastVideoId = videoId;
  isSkipping = false;

  console.log("Current Shorts Video ID:", videoId);

  // Issue 1: use buffered data if the API response arrived before navigate
  if (sourceDataBuffer.has(videoId)) {
    const cached = sourceDataBuffer.get(videoId);
    sourceDataBuffer.delete(videoId);
    applySourceData(cached.source, cached.url, cached.title);
    checkSourceBanned();
  } else {
    backgroundURL = null;
    backgroundSource = null;
    title = null;
  }
});

chrome.storage.local.get('banList', (result) => {
  if (!result.banList) chrome.storage.local.set({ banList: [] });
});
