## (EN) Chrome Extension - SongBlocker Plus
### https://www.youtube.com/watch?v=c4KNd0Yv6d0&ab_channel=FriedFish

## 1. Reason for Development
To make a better doomscrolling experience by automatically skipping hated meme songs (Skibidi, Japanese Anime OSTs, etc.) that keep appearing in YouTube Shorts.

## 2. Environment
- JavaScript
- Chrome Extension API (Manifest V3)
- Chrome Storage API

## 3. How does it work?
1. **Intercept**: `injected.js` hooks into `window.fetch` to capture YouTube's internal `reel_item_watch` API response, including the Shorts video ID from the request body.
2. **Buffer**: Responses are buffered by Shorts video ID to correctly handle cases where YouTube prefetches the next video's data before navigation occurs.
3. **Extract**: Parses the API response to extract the source music video ID and title from the engagement panel. For original-audio videos with no audio pivot, the Shorts URL itself is used as the source.
4. **Store**: The source music URL and title are saved to `chrome.storage.local`.
5. **Ban List**: Clicking the **+** button in the extension popup adds the current source to the ban list. Duplicate entries are prevented automatically.
6. **Auto-Skip**: When a new Short loads, the source URL is checked against the ban list. If matched, the video is skipped via a keyboard event dispatched from page context.

## 4. How to use
1. Download the zip file and extract it (path doesn't matter)
2. Open Chrome → `chrome://extensions` → Enable **Developer mode**
3. Click **Load unpacked** and select the extracted folder
4. Navigate to YouTube Shorts
5. When a song you want to block is playing, click the extension icon and press **+**
6. That song will be automatically skipped in all future Shorts
7. To remove a blocked song, open the popup and click **✕** next to the entry in the ban list

## 5. Known Limitations
- Original-audio Shorts are blocked by their video URL, not a shared audio source — the block only applies to that specific Short
- The Short plays for a brief moment before being skipped (the API response must arrive first)
- Ban list is stored locally per browser — not synced across devices

## by Daburu
