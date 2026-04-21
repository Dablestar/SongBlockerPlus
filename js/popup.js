var filePath = "./banList.txt";
var backgroundURL;
let banList;



document.getElementById("addBtn").addEventListener("click", function() {
    console.log("Add button clicked");
    sendBackgroundURLFromContentMsg();
});

function sendBackgroundURLFromContentMsg(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const activeTab = tabs[0];
        if (activeTab) {
            chrome.tabs.sendMessage(activeTab.id, { action: "addToBanList" }, function(response) {
                if (response && response.sourceTitle && response.sourceURL)
                {
                    backgroundURL = response.sourceURL;
                    console.log("Added URL to BanList from content script:", backgroundURL);
                } else {
                    console.log(response);
                    console.error("No URL received from content script");
                }
            });
        } else {
            console.error("No active tab found");
        }
    });
}


