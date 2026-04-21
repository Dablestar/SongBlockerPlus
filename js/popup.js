function loadCurrentSource() {
    chrome.storage.local.get(['sourceTitle', 'sourceURL'], (result) => {
        const el = document.getElementById('currentTitle');
        el.textContent = result.sourceTitle || '—';
        el.title = result.sourceURL || '';
    });
}

function loadBanList() {
    chrome.storage.local.get('banList', (result) => {
        renderBanList(result.banList ?? []);
    });
}

function renderBanList(banList) {
    const container = document.getElementById('banListContainer');
    document.getElementById('banCount').textContent = banList.length;

    if (banList.length === 0) {
        container.innerHTML = '<p class="empty-msg">No songs blocked yet.</p>';
        return;
    }

    container.innerHTML = '';
    banList.forEach((entry, index) => {
        const row = document.createElement('div');
        row.className = 'banlist-row';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'banlist-title';
        titleSpan.textContent = entry.title || 'Unknown';
        titleSpan.title = entry.url;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✕';
        deleteBtn.title = 'Remove';
        deleteBtn.addEventListener('click', () => deleteEntry(index));

        row.appendChild(titleSpan);
        row.appendChild(deleteBtn);
        container.appendChild(row);
    });
}

function deleteEntry(index) {
    chrome.storage.local.get('banList', (result) => {
        const banList = result.banList ?? [];
        banList.splice(index, 1);
        chrome.storage.local.set({ banList }, () => renderBanList(banList));
    });
}

function showStatus(msg, isError = false) {
    const el = document.getElementById('statusMsg');
    el.textContent = msg;
    el.className = 'status-msg ' + (isError ? 'error' : 'success');
    setTimeout(() => {
        el.textContent = '';
        el.className = 'status-msg';
    }, 2000);
}

document.getElementById('addBtn').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
        if (!activeTab) {
            showStatus('No active tab', true);
            return;
        }
        chrome.tabs.sendMessage(activeTab.id, { action: 'addToBanList' }, function(response) {
            if (chrome.runtime.lastError) {
                showStatus('Extension not active on this page', true);
                return;
            }
            if (response?.alreadyAdded) {
                showStatus('Already in ban list');
                return;
            }
            if (response?.sourceTitle || response?.sourceURL) {
                showStatus('Added: ' + (response.sourceTitle || response.sourceURL));
                loadBanList();
                loadCurrentSource();
            } else {
                showStatus('No source detected yet', true);
            }
        });
    });
});

loadCurrentSource();
loadBanList();
