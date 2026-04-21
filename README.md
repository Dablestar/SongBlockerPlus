## (EN) Chrome Extension - SongBlocker Plus
### https://www.youtube.com/watch?v=c4KNd0Yv6d0&ab_channel=FriedFish

## 1. Reason for Development
To make a better doomscrolling experience by automatically skipping hated meme songs (Skibidi, Japanese Anime OSTs, etc.) that keep appearing in YouTube Shorts.

## 2. Environment
- JavaScript
- Chrome Extension API (Manifest V3)
- Chrome Storage API

## 3. How does it work?
1. **Intercept**: `injected.js` hooks into `window.fetch` to capture YouTube's internal `reel_item_watch` API response when a Short loads.
2. **Extract**: Parses the API response to extract the source music video ID and title from the engagement panel.
3. **Store**: The source music URL and title are saved to `chrome.storage.local`.
4. **Ban List**: Clicking the extension popup button adds the current source music to the ban list stored in `chrome.storage.local`.
5. **Auto-Skip**: When a new Short loads, the source music URL is checked against the ban list. If matched, the video is automatically skipped.

## 4. How to use
1. Download the zip file and extract it (path doesn't matter)
2. Open Chrome → `chrome://extensions` → Enable **Developer mode**
3. Click **Load unpacked** and select the extracted folder
4. Navigate to YouTube Shorts
5. When a song you want to block is playing, click the extension icon and press **Add to Ban List**
6. That song will be automatically skipped in all future Shorts

## 5. Known Limitations
- Only works for Shorts that expose their source audio publicly (not original audio uploads)
- The Short plays for a brief moment before being skipped (the API response must arrive first)
- Ban list is stored locally per browser — not synced across devices

## by Daburu
